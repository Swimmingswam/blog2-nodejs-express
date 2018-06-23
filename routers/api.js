var express = require('express');
var router = express.Router();
var User = require('../modules/User')
var Content = require('../modules/Content');

//设置返回res的数据格式的中间件
var resdata;
router.use(function (req, res, next) {
    resdata = {
        code: 0,     //状态码
        message: ''     //返回信息
    }
    next();
})

//处理注册表单
router.post('/user/register', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //表单值验证
    if (username == '') {
        resdata.code = 1;
        resdata.message = '用户名不能为空';
        res.json(resdata);
        return;
    }
    if (password == '') {
        resdata.code = 2;
        resdata.message = '密码不能为空';
        res.json(resdata);
        return;
    }
    if (repassword != password) {
        resdata.code = 3;
        resdata.message = '两次输入密码不一致';
        res.json(resdata);
        return;
    }

    User.findOne({     //在数据库User的collection中寻找username
        username: username
    }).then(function (userinfo) {
        if (userinfo) {   //如果数据库中已有该username
            resdata.code = 4;
            resdata.message = '用户名已被注册';
            res.json(resdata);   //服务器返回response内容给浏览器端，这里的resdata就是请求返回的res对象的数据
            return;
        }

        //数据库中没有该username，则新建该username的document并保存到数据库
        var user = new User({
            username: username,
            password: password
        });
        return user.save();

        //返回注册成功的信息
    }).then(function (userinfo) {
        resdata.code = 200;
        resdata.message = '注册成功';
        res.json(resdata);
    })

})

//处理登录表单
router.post('/user/login', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    //表单值验证
    if (username == '' || password == '') {
        resdata.code = 1;
        resdata.message = '用户名或密码不能为空';
        res.json(resdata);
        return;
    }

    //在数据库User的collection中寻找username和password
    User.findOne({
        username: username,
        password: password
    }).then(function (userinfo) {
        if (!userinfo) {        //如果找不到对应的username->password
            resdata.code = 2;
            resdata.message = '用户名或密码错误';
            res.json(resdata);
            return;
        } else {            //如果找到对应的username->password
            resdata.code = 200;
            resdata.message = '登录成功';
            resdata.userinfo = {     //返回的userinfo
                _id: userinfo._id,
                username: userinfo.username,
                isadmin: userinfo.isadmin
            }
            req.cookies.set('userinfo', JSON.stringify({    //把userinfo设置cookies值存起来，在浏览器记录下该用户的登录情况
                _id: userinfo._id,
                username: userinfo.username,
                isadmin: userinfo.isadmin
            }));
            res.json(resdata);
            return;
        }
    })
})

//处理用户退出登录
router.get('/user/logout', function (req, res, next) {
    req.cookies.set('userinfo', null);    //清除cookies值的userinfo，删除用户的登录记录
    resdata.message = '退出成功'
    res.json(resdata)
})

//评论提交
router.post('/comment/post', function (req, res, next) {
    var contentid = req.body.contentid || '';
    var postdata = {
        username: req.userinfo.username,
        postTime: new Date(),
        content: req.body.content
    }
    if (postdata.content == '') {
        resdata.code = 1;
        resdata.message = '评论不能为空';
        res.json(resdata);
        return;
    } else {
        Content.findOne({     //前面的内容验证通过后，通过文章id在数据库查找该文章信息
            _id: contentid
        }).then(function (content) {
            content.comments.push(postdata)     //向该content document中的comments数组添加表单的评论数据并保存
            return content.save()
        }).then(function (newcontent) {
            resdata.message = '评论成功'
            resdata.data = newcontent    //把成功保存添加评论后的content document数据返回到浏览器
            res.json(resdata);
            return
        })
    }


})

//获取当前文章的评论
router.get('/comment', function (req, res, next) {
    var contentid = req.query.contentid || '';
    Content.findOne({     //根据url的id在数据库中查找到该文章信息
        _id: contentid
    }).then(function (content) {
        resdata.data = content.comments   //把该文章的comments数组内的评论数据返回给浏览器
        res.json(resdata);
        return
    })
})
module.exports = router
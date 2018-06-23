var express = require('express');
var swig = require('swig');  //模板引擎
var mongoose = require('mongoose');   //数据库mongodb操作
var bodyParser = require('body-parser')  //处理post提交过来的请求数据
var cookies = require('cookies');   //cookies保存用户登录记录
var app = express();

var User = require('./modules/User')    //导入User模型
var Category = require('./modules/Category')  //导入Category模型

app.use('/public',express.static(__dirname + '/public'));    //设置静态文件资源（css、js、images、fonts)

app.engine('html',swig.renderFile);   //设置把.html文件用swig模板渲染
app.set('views','./views');   //设置模板的存放路径为'./views'
app.set('view engine','html')   //为.html文件注册所使用的模板引擎
swig.setDefaults({cache: false})   //开发过程中取消模板缓存

//app.use(bodyParser.urlencoded())
app.use(bodyParser.urlencoded({ extended: true }))   //表单请求数据的处理中间件

//cookies设置中间件
app.use(function(req,res,next){
    req.cookies = new cookies(req,res)   //发送请求时new一个cookies对象
    req.userinfo = {};     //请求体中的userinfo信息
    if(req.cookies.get('userinfo')){       //如果在请求时候在浏览器cookies中找到已存的userinfo，辨别登录用户的身份
        try{
            req.userinfo = JSON.parse(req.cookies.get('userinfo'))    //转化userinfo为json格式
            User.findById(req.userinfo._id).then(function(userinfo){       //通过userinfo._id在数据库的Usercollection找到对应存储的userinfo
                req.userinfo.isadmin = Boolean(userinfo.isadmin)   //把请求体中的userinfo信息的isadmin值设置为数据库中找到的对应document中的isadmin值
            })
        }catch(e){
            next()
        }
    }
    next()
})

app.use('/admin',require('./routers/admin'))   //设置三个主要路由的处理
app.use('/api',require('./routers/api'))
app.use('/',require('./routers/main'))

mongoose.connect('mongodb://localhost:27018/blog2',function(err){      //每次初始化项目时打印出项目与数据库的连接情况
    if(err){
        console.log('数据库连接失败')
    }else{
        console.log('数据库连接成功')
        console.log('program is running at "http://localhost:5060/"')
        app.listen(5060);      //项目成功连接到数据库后再用5060端口监听
    }

});  //连接数据库

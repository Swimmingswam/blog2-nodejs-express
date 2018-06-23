var express = require('express');
var router = express.Router();

//导入模型
var User = require('../modules/User')
var Category = require('../modules/Category')
var Content = require('../modules/Content')

//验证用户是否是管理员身份的中间件
router.use('/', function (req, res, next) {
    if (!req.userinfo.isadmin) {
        res.send('对不起，只有管理员才能进入管理页面')
    }
    next()
})

//进入管理员管理首页
router.get('/', function (req, res, next) {
    res.render('admin/index', { userinfo: req.userinfo })

})

//进入用户管理界面
router.get('/user', function (req, res, next) {
    var page = Number(req.query.page || 1);  //初始化当前显示页面为1
    var limit = 3;     //每页限制显示用户的数据条数
    var skip = ((page - 1) * limit);    //跳过skip从数据库获取user数据
    var pages = 0      //初始化用户列表的总页数为0

    User.count().then(function (count) {   //搜寻数据库中用户的信息条数
        pages = Math.ceil(count / limit);       //计算需要显示的pages最大值
        page = Math.min(page, pages);       //保证显示页面不超过最大值
        page = Math.max(page, 1);     //保证显示页面不能小于1

        User.find().limit(limit).skip(skip).then(function (users) {   //按照一定规则从数据库搜寻用户信息
            res.render('admin/user', {   
                userinfo: req.userinfo,
                users: users,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                pagemark:'user'     //上下页按钮的href地址设置
            })
        })
    })
})

//进入文章分类管理首页
router.get('/category', function (req, res, next) {

    var page = Number(req.query.page || 1);
    var limit = 3;
    var skip = ((page - 1) * limit);
    var pages = 0

    //搜寻数据库中文章分类的信息条数
    Category.count().then(function (count) {
        pages = Math.ceil(count / limit);   //计算需要显示的pages最大值
        page = Math.min(page, pages);  //保证显示页面不超过最大值
        page = Math.max(page, 1); //保证显示页面不能小于1

        Category.find().sort({ _id: -1 }).limit(limit).skip(skip).then(function (categorys) {   //按照一定规则从数据库搜寻文章分类信息
            res.render('admin/category', {
                userinfo: req.userinfo,
                categorys: categorys,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                pagemark:'category'
            })
        })
    })
})

//添加分类页面显示
router.get('/category/add', function (req, res, next) {
    res.render('admin/categoryadd', {
        userinfo: req.userinfo
    })
})

//添加分类页面的表单数据提交
router.post('/category/add', function (req, res, next) {
    var name = req.body.name || '';
    if (name == '') {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '名称不能为空',
        })
    } else {
        Category.findOne({  //从数据库中category的collection中寻找分类名称为name的分类信息
            name: name
        }).then(function (rs) {
            if (rs) {   //如果数据库中已有该分类的记录
                res.render('admin/error', {
                    userinfo: req.userinfo,
                    message: '该分类已存在，无需添加',
                })
                return Promise.reject();
            } else {    //如果数据库中没有该分类的记录，则添加新分类
                return new Category({     //新建Category信息并把提交的数据name保存进去
                    name: name
                }).save()
            }
        }).then(function (newcate) {     //保存后把数据库保存成功后的信息提示给用户
            res.render('admin/success', {
                userinfo: req.userinfo,
                message: '分类保存成功',
                url: '/admin/category'     //成功后点击跳转到分类显示页面查看分类信息
            })
        })
    }
})

//分类编辑页面显示
router.get('/category/edit', function (req, res, next) {
    var id = req.query.id || '';
    Category.findOne({       //根据url的id参数去数据库中查找该分类信息
        _id: id
    }).then(function (category) {      //数据库返回找到的该分类的结果
        if (!category) {           //若找不到给分类
            res.render('admin/error', {
                userinfo: req.userinfo,
                message: '找不到该分类'
            })
        } else {       //若找到给分类
            res.render('admin/categoryedit', {  //进入分类编辑页面
                userinfo: req.userinfo,
                category: category
            })
        }
    })
})

//分类页面编辑表单数据的提交
router.post('/category/edit', function (req, res, next) {
    var id = req.query.id || '';
    var name = req.body.name || '';
    Category.findOne({    //根据url的id参数去数据库中查找该分类信息
        _id: id
    }).then(function (category) {
        if (!category) {   //若找不到给分类
            res.render('admin/error', {
                userinfo: req.userinfo,
                message: '找不到该分类'
            })
            return Promise.rejust()
        } else {       //进入分类编辑页面
            if (name == category.name) {    //新编辑的分类名称与数据库中查到的旧名称一样？
                res.render('admin/success', {
                    userinfo: req.userinfo,
                    message: '修改成功',
                    url: '/admin/category'  //数据库中数据修改成功后返回跳转页面，跳转到分类显示页面查看分类情况
                }) 
                return Promise.rejust()
            } else {         //新编辑的分类名称与数据库中查到的旧名称不一样？
                return Category.findOne({   //返回找到的该分类对象
                    _id: { $ne: id },
                    name: name
                })
            }
        }
    }).then(function (samecategory) {     
        if (samecategory) {  //新编辑的分类名称与数据库中查到的旧名称一样
            res.render('admin/error', {   //出错，不能修改成已有分类的名称
                userinfo: req.userinfo,
                message: '数据库已存在同名分类'
            })
            return Promise.rejust()
        } else {          //新编辑的分类名称与数据库中查到的旧名称不一样
            return Category.update({   //通过id找到数据库的旧分类并更新把新分类名称更新到数据库中
                _id: id
            }, {
                    name: name
                })
        }
    }).then(function () {
        res.render('admin/success', {    
            userinfo: req.userinfo,
            message: '修改成功',
            url: '/admin/category'   //数据库中数据修改成功后返回跳转页面，跳转到分类显示页面查看分类情况
        })
    })
})

//删除分类的处理
router.get('/category/delete', function (req, res, next) {
    var id = req.query.id || '';
    Category.remove({   //从根据URL的分类id从数据找到该分类后删除该分类
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userinfo: req.userinfo,
            message: '删除成功',
            url: '/admin/category'    //数据库中数据修改成功后返回跳转页面，跳转到分类显示页面查看分类情况
        })
    })
})

//文章管理显示页面
router.get('/content', function (req, res, next) {
    var page = Number(req.query.page || 1);
    var limit = 3;
    var skip = ((page - 1) * limit);
    var pages = 0

    Content.count().then(function (count) {
        pages = Math.ceil(count / limit);   //计算需要显示的pages最大值
        page = Math.min(page, pages);  //保证显示页面不超过最大值
        page = Math.max(page, 1); //保证显示页面不能小于1
                                               //下面populate（category）对应的是../schemas/contents'下的category字段
        Content.find().limit(limit).skip(skip).populate(['category','user']).sort({addTime:-1}).then(function (contents) {
            console.log(contents)
            res.render('admin/content', {
                userinfo: req.userinfo,
                contents:contents,
                pagemark:'content',
                page: page,
                count: count,
                limit: limit,
                pages: pages,
            })
        })
    })
})

//添加文章页面显示
router.get('/content/add', function (req, res, next) {
    Category.find().sort({ _id: -1 }).then(function (categorys) {  //按倒序从数据库中查找所有分类信息

        res.render('admin/contentadd', {
            userinfo: req.userinfo,
            categorys: categorys  //用于分类选项
        })
    })
})

//添加文章页面的数据请求
router.post('/content/add', function (req, res, next) {
    if (!req.body.category) {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '分类不能为空'
        })
        return
    }
    if (!req.body.title) {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '标题不能为空'
        })
        return
    }
    if (!req.body.description) {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '简介不能为空'
        })
        return
    }
    if (!req.body.content) {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '内容不能为空'
        })
        return
    }
    new Content({   //通过前面的内容验证后，新建一个Content对象，并把表单的数据保存至数据库的content里
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        user: req.userinfo._id.toString(),
        content: req.body.content
    }).save().then(function () {
        res.render('admin/success', {    //数据库添加文章数据成功后返回成功页面
            userinfo: req.userinfo,
            message: '添加成功',
            url: "/admin/content"   //跳转至内容显示页面，查看更新后的文章列表
        })
    })
})

//文章编辑页面显示
router.get('/content/edit',function(req, res, next){
    var id = req.query.id || ''  
  Content.findOne({            //根据文章id在数据库找到该文章
      _id:id
  }).populate('category').then(function(content){   //文章信息要与其category关联
      //console.log(content)
      if(!content){   //数据库找不到该文章
          res.render('admin/error',{
              userinfo:req.userinfo,
              message:'未找到对应章内容'
          })
          return Promise.reject()
      }else{      //数据库找到该文章
        Category.find().sort({ _id: -1 }).then(function (categorys) {   //找到所有分类信息，并把其添加进分类选项中
            res.render('admin/contentedit',{
                userinfo:req.userinfo,
                content:content,
                categorys: categorys
            })
        }) 
      }
  })
})

//文章编辑的表单内容提交
router.post('/content/edit',function(req, res, next){
    var id = req.query.id || '';
    if (!req.body.category) {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '分类不能为空'
        })
        return
    }
    if (!req.body.title) {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '标题不能为空'
        })
        return
    }
    if (!req.body.description) {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '简介不能为空'
        })
        return
    }
    if (!req.body.content) {
        res.render('admin/error', {
            userinfo: req.userinfo,
            message: '内容不能为空'
        })
        return
    }
    Content.update({             //通过前面的内容验证后根据id更新该文章
      _id:id         //更新条件
    },{ 
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,               //更新的内容
    }).then(function(){
        res.render('admin/success',{
            userinfo:req.userinfo,
            message:'保存成功',
            url:'/admin/content/edit?id='+id      //数据库更新成功后返回成功跳转页面到文章显示页面，查看文章更新情况
        })
    })
})

//文章删除处理
router.get('/content/delete',function(req, res, next){
    var id = req.query.id || '';
    Content.remove({   //数据库中找到对应id的文章并删除
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userinfo: req.userinfo,
            message: '删除成功',
            url: '/admin/content'   //数据库更新成功后返回成功跳转页面到文章显示页面，查看文章更新情况
        })
    })
})


module.exports = router
var express = require('express');
var router = express.Router();

var Category = require('../modules/Category');
var Content = require('../modules/Content');

var data;
//处理通用数据的中间件
router.use(function (req, res, next) {
    data = {
        userinfo: req.userinfo,    //向main/index渲染模板添加请求的userinfo值
        categorys: [],  //初始化分类数组
    }
    Category.find().sort({ _id: -1 }).then(function (categorys) {   //倒序从数据库中查找到的分类信息
        data.categorys = categorys
        next()
    })
})

//整个博客的首页展示
router.get('/', function (req, res, next) {
    data.page = Number(req.query.page || 1)   //初始化当前展示文章条目信息的页数为1
    data.category = req.query.category || ''   //初始化首页导航栏处的分类选择为''
    data.limit = 2    //首页文章条目每页展示数
    data.pages = 0    //初始化首页文章展示总页数为0
    data.count = 0    //初始化首页文章展示的总数为0

    var where = {};     //设置文章搜索的范围（分类）
    if (data.category) {    //如果首页导航的分类已选则在该分类下搜索文章
        where.category = data.category
    }

    Content.where(where).count().then(function (count) {  //根据所选文章的分类在数据库中搜索文章信息
        data.count = count  //在数据库中找到的对应文章总数
        data.pages = Math.ceil(data.count / data.limit);   //计算需要显示的pages最大值
        data.page = Math.min(data.page, data.pages);  //保证显示页面不超过最大值
        data.page = Math.max(data.page, 1); //保证显示页面不能小于1
        var skip = ((data.page - 1) * data.limit);
        //下面populate（category）对应的是../schemas/contents'下的category字段
        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({ addTime: -1 });
    }).then(function (contents) {
        data.contents = contents   //把找到的所有符合分类条件的文章信息全部渲染到main/index
        //console.log(data)
        res.render('main/index', data)
    })
})

//阅读全文页面的显示
router.get('/views', function (req, res, next) {
    var contentid = req.query.contentid || ''
    Content.findOne({   //根据url的content的id在数据库中找到该文章
        _id: contentid
    }).then(function (content) { 
        data.content = content
        content.views++;     //每次阅读全文都会使该文章的阅读量+1并保存
        content.save()   
        //console.log(data)
        res.render('main/view', data)
    })

})



module.exports = router
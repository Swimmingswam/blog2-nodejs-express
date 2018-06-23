var mongoose = require('mongoose')
//用户的表结构
//创建分类表结构并暴露给modules
module.exports = new mongoose.Schema({
    //定义关联字段 - 内容分类id
    category: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Category'

    },
    //关联作者
    user: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'User'

    },
    //添加时间
    addTime:{
       type:Date,
       default:new Date()
    },
    //阅读数
    views:{
        type:Number,
        default:0
     },
    //文章标题
    title: String,
    //文章简介
    description: {
        type: String,
        default: ''
    },
    //文章内容
    content: {
        type: String,
        default: ''
    },
    //文章的评论数组
    comments:{
        type:Array,
        default:[]
    }
})
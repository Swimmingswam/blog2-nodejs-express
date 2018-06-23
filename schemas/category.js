var mongoose = require('mongoose')
//用户的表结构
//创建分类表结构并暴露给modules
module.exports = new mongoose.Schema({
  //分类名称
  name: String
})
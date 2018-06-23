var mongoose = require('mongoose')
//用户的表结构
//创建用户表结构并暴露给modules
module.exports = new mongoose.Schema({
  //用户名
  username: String,
  //密码
  password: String,
  //是否为管理员身份
  isadmin:{
    type: Boolean,
    default: false
  }
})
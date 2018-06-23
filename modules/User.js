var mongoose = require('mongoose');
var usersSchema = require('../schemas/users');

//创建模型并暴露
module.exports = mongoose.model('User',usersSchema);
//User 后面可用于实例化对象
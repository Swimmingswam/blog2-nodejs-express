var mongoose = require('mongoose');
var categorySchema = require('../schemas/category');

//创建模型并暴露
module.exports = mongoose.model('Category',categorySchema);
//Category 后面可用于实例化对象
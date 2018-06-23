var mongoose = require('mongoose');
var contentsSchema = require('../schemas/contents');

//创建模型并暴露
//'Content'是对应的../schemas/contents下的category => ref: 'Content'   用于关联
module.exports = mongoose.model('Content',contentsSchema);
//Content 后面可用于实例化对象

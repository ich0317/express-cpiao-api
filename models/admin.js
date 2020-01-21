const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    username:String,   //用户名
    password:String,   //密码
    usertype:String,     //用户类别 管理员(0)和普通用户(1)
    create_time:Date
});

module.exports = mongoose.model('adminUsers', adminSchema);
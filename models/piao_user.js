const mongoose = require("mongoose");
const user = new mongoose.Schema({
    username:String,   //用户名
    password:String,
    reg_datetime:String
},{versionKey: false});
module.exports = mongoose.model('piaouser', user);
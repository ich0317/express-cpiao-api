const mongoose = require("mongoose");
const screenList = new mongoose.Schema({
    screen_name:String,   //影厅名称
    screen_type:String,   //影厅类型
    sound_type:String,  //音响类型
    screen_status:Boolean,   //状态
    seat_amount:Number,     //座位数量
    cinema_id:String   //所属影院id

},{versionKey: false});
module.exports = mongoose.model('screenList', screenList);
const mongoose = require("mongoose");
const seatList = new mongoose.Schema({
    graph_col:String,   //坐标列
    graph_row:String,   //坐标行
    seat_col:String,  //座位列
    seat_row:String,   //座位行
    fixed_y:String,  //固定列坐标
    fixed_x:String,   //固定行坐标
    seat_status:Number,     //座位状态 （0 可售、1 已售、2 锁定、3 不可售、4 已选）
    is_show:String,    //是否显示
    screen_id:String    //影厅id
},{versionKey: false});
module.exports = mongoose.model('seatList', seatList);
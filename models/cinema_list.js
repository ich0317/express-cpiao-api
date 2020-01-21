const mongoose = require("mongoose");
const cinemaList = new mongoose.Schema({
    cinema_name:String,   //影院名称 
    province:String,
    city:String,
    spell:String,
    address:String,
    serve_price:Number,
    stop_sale:Number,
    lat:String,    //维度和精度
    lng:String,
    status:Boolean, //影院状态  true启用，false停用
}, {versionKey: false});
module.exports = mongoose.model('cinemaList', cinemaList);
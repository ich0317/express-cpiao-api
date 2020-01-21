const mongoose = require("mongoose");
const sessionList = new mongoose.Schema({
    film_name:String,   //影片名称
    alias:String,   //别名
    film_photo:String,  //影片海报
    film_long:Number,   //影片时长
    film_type:String,   //影片类型
    actors:String,  //演员
    director:String,    //导演
    brief:String,   //简介
    country:String, //制作国家
    language:String,    //语言
    release_date:String, //上映日期
    film_version:String, //影片版本
    start_datetime:String,    //开场日期时间
    end_datetime:String,     //结束日期时间
    screen_name:String,  //影厅名称
    sell_price:String,   //票价
    cinema_id:String,    //所属影院id
    screen_id:String,    //所属影厅id
    film_id:String,  //影片id
    status:Number,   //状态 （0未审核 1已审核 2禁售 3完场）
    //session_seat:Array
},{versionKey: false});
module.exports = mongoose.model('sessionList', sessionList);
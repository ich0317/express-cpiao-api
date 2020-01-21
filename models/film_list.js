const mongoose = require("mongoose");
const filmList = new mongoose.Schema({
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
    release_date:Date, //上映日期
    film_version:String //影片版本
});
module.exports = mongoose.model('filmList', filmList);
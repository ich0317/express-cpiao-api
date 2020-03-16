const mongoose = require("mongoose");
const newsList = new mongoose.Schema({
    title:String,  
    brief:String,   
    img_url:String,  
    content:String,   
    release_date:String,   
    views:{
        type:Number,
        default:0
    },
    like:{
        type:Number,
        default:0
    },
    editor:String,
    status:Boolean
}, {versionKey: false});
module.exports = mongoose.model('newsList', newsList);
const mongoose = require("mongoose");
const collegeList = new mongoose.Schema({
    college_name:String,
    province:String,
    city:String,
    address:String,
    longitude:String,   //经度
    latitude:String //维度,
});
module.exports = mongoose.model('collegeList', collegeList);
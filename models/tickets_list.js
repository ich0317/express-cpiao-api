const mongoose = require("mongoose");
const tickets_list = new mongoose.Schema({
  order_id: String, //订单id
  user_id: String,  //用户id
  seat_id: String, //座位id
  seat: String, //座位
  sell_price: Number, //单个票价
  serve_price: Number, //服务费
  ticket_status: Number // 0未检 1已检
},{versionKey: false});
module.exports = mongoose.model("tickets_list", tickets_list);

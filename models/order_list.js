const mongoose = require("mongoose");
const orderList = new mongoose.Schema(
    {
        user_id: String, //用户id
        order_num: String, //订单号
        seat_count: Number, //座位数量
        seat_id: Array, //座位id
        seat: Array, //座位号
        order_datetime: String, //下单日期
        pay_datetime: {
            //支付日期
            default: null,
            type: String
        },
        refund_datetime: {
            //退款时间
            default: null,
            type: String
        },
        order_status: Number, //状态（待支付100, 已支付200, 已退款300, 退款中400, 退款失败500, 已关闭600）
        total_price: Number, //总价（票数*单价）
        total_serveprice: {
            //服务费总价
            default: 0,
            type: Number
        },
        QR: {
            //取票二维码
            type: String,
            default: null
        },
        session_id: String, //场次id
        cinema_name: String, //影院名称
        film_name:String,
        start_datetime:String
    },
    { versionKey: false }
);

module.exports = mongoose.model("orderList", orderList);

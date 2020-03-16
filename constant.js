module.exports = {
    LOGIN_TOKEN_SALT: "a1b2c3d4",   //后台用户撒盐
    LOGIN_TOKEN_EXPIRES: 60 * 60,   //后台用户登录过期时间 秒
    SESSIONS_STATUS: [ 0, 1, 2, 3 ],  //排期状态 （0未审核 1已审核 2禁售 3完场）
    ORDER_STATUS: { //订单状态
        Unpaid: 100, //待支付
        Paid: 200, //已支付
        Refunded: 300, //已退款
        Refunding: 400, //退款中
        RefundFailed: 500, //退款失败
        Closed: 600 //已关闭（未支付成功）
    },
    SEAT_STATUS:[0, 1, 2, 3, 4], //0可用,1已售,2锁定,3不可售,4已选
    PIAO_LOGIN_TOKEN_SALT:"a4b3c2d1",   //前台用户撒盐
    PIAO_LOGIN_TOKEN_EXPIRES: 30 * 2 * 60,  //前台用户过期时间 秒
}

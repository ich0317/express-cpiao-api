const ordersTable = require("../../models/order_list");
const sessionsTable = require("../../models/session_list");
const ticketsTable = require("../../models/tickets_list");
const getUtils = require("../../utils/index");
const usersTable = require("../../models/piao_user");
const cinemasTable = require("../../models/cinema_list");
const seatsTable = require("../../models/seat_list");
const svgCaptcha = require('svg-captcha');
const qr = require("qr-image");

let {
    ORDER_STATUS,
    SESSIONS_STATUS,
    PIAO_LOGIN_TOKEN_SALT
} = require("../../constant");
const jwt = require("jsonwebtoken");

//创建订单
exports.createOrder = async (req, res, next) => {
    let { session_id, seats } = req.body;

    //检测是否登录
    if (!req.headers["_piao-token"]) {
        res.send({
            code: 20001,
            msg: "请登录",
            data: []
        });
        return;
    }

    jwt.verify(
        req.headers["_piao-token"],
        PIAO_LOGIN_TOKEN_SALT,
        async (err, decoded) => {
            if (decoded) {
                let { uid } = decoded.data;

                //检测用户是否存在
                const findUser = await usersTable.findOne({ _id: uid });
        
                if (!findUser) {
                    res.send({
                        code: -1,
                        msg: "用户不存在",
                        data: []
                    });
                    return;
                }

                //检测提交座的位是否有效
                const findOrderRes = await ordersTable.find({
                    $and:[
                        {session_id},
                        {order_status:{$in:[
                            ORDER_STATUS.Unpaid,
                            ORDER_STATUS.Paid,
                            ORDER_STATUS.Refunding,
                            ORDER_STATUS.RefundFailed
                        ]}}
                    ]
                })

                let unavailableSeats = findOrderRes.map(v=> [...v.seat_id]); //获取所有已售座位id
                unavailableSeats = unavailableSeats.toString().split(',');

                const intersection = (a, b) => {
                    const s = new Set(b);
                    return a.filter(x => s.has(x));
                };

                let isBuy = true;   //是否可以购买提交的座位
                
                //是否有未完成订单
                let rs = findOrderRes.filter(item => item.user_id === uid && item.order_status === ORDER_STATUS.Unpaid)[0] || [];
                
                let getIntersection = intersection(seats, unavailableSeats); //查重
  
                if(getIntersection.length !== 0){   //有和订单重复的座位
                    
                    if(intersection(getIntersection, rs.seat_id).length !== getIntersection.length){    //重复的座位是否是自己未完成订单的
                        isBuy = false; 
                    }
                }
                
                if(!isBuy){
                    res.send({
                        code:-1,
                        msg:'座位不可售',
                        data:[]
                    })
                    return;
                }
                
                //检测场次是否有效
                const findSession = await sessionsTable.findOne({$and:[
                    {_id:session_id},
                    {status:SESSIONS_STATUS[1]}
                ]})
  
                if(!findSession){
                    res.send({
                        code:-1,
                        msg:'场次不存在',
                        data:[]
                    })
                    return;
                }

                const cinemaRes = await cinemasTable.findOne({_id:findSession.cinema_id, status:true});

                if(!cinemaRes){
                    res.send({
                        code:-1,
                        msg:'影院已关闭',
                        data:[]
                    })
                    return;
                }

                const findSeatNum = await seatsTable.find({$and:[
                    {screen_id:findSession.screen_id},
                    {_id:{$in:seats}}
                ]}, 'seat_col seat_row')

                //创建订单号
                let order_num = getUtils.timestamp2Date(Date.now()/1000,'{Y}{M}{D}{h}{m}{s}') + Math.floor(8999 * Math.random() + 1000);

                //如果有未完成订单删除
                if(rs.length !==0){
                    let rmRes = await ordersTable.deleteOne({user_id:uid,order_status: ORDER_STATUS.Unpaid});
                }
        
                const orderRes = await ordersTable.create({
                    user_id: uid,
                    order_num,
                    seat_count: seats.length,
                    seat: findSeatNum.map(v=>v.seat_row +'排' + v.seat_col+'座'),
                    seat_id: seats,
                    order_datetime:getUtils.timestamp2Date(Date.now()/1000,'{Y}-{M}-{D} {h}:{m}:{s}'),
                    order_status: ORDER_STATUS.Unpaid,
                    total_price: findSession.sell_price * seats.length, //单价*张数（不含服务费）
                    total_serveprice: cinemaRes.serve_price * seats.length,  //服务费总价 单张*张数
                    session_id,
                    cinema_name:cinemaRes.cinema_name,
                    film_name:findSession.film_name,
                    start_datetime:findSession.start_datetime,
                    end_datetime:findSession.end_datetime
                })
             
                res.send({
                    code: 0,
                    msg: "成功",
                    data: {
                        order_id: orderRes._id
                    }
                });
            } else {
                res.send({
                    code: 20001,
                    msg: "请登录",
                    data: []
                });
            }
        }
    );
};

//获取订单信息
exports.getOrderDetail = async (req, res, next) => {
    let { order_id } = req.query;
    const orderDetailRes = await ordersTable.findOne({_id:order_id},'seat pay_datetime refund_datetime total_serveprice QR order_num order_datetime order_status total_price cinema_name session_id seat_count');
    if(!orderDetailRes){
        res.send({
            code: -1,
            msg: "订单不存在",
            data: []
        });
        return;
    }
    const sessionDetailRes = await sessionsTable.findOne({_id:orderDetailRes.session_id}, 'language screen_name sell_price start_datetime end_datetime film_photo film_name')
    if(!sessionDetailRes){
        res.send({
            code: -1,
            msg: "场次不存在",
            data: []
        });
        return;
    }
    let oS = (sessionDetailRes.toObject());
    delete oS._id
    res.send({
        code: 0,
        msg: "成功",
        data: {
            ...orderDetailRes.toObject(), ...oS, server_datetime:getUtils.timestamp2Date(Date.now()/1000,'{Y}-{M}-{D} {h}:{m}:{s}')
        }
    });
}

//订单过期
exports.payExpire = async (req, res, next) => {
    let { order_id } = req.body;
    const orderRes = await ordersTable.updateOne({_id:order_id},{order_status:ORDER_STATUS.Closed});
    if(orderRes){
        res.send({
            code: 0,
            msg: "订单已过期",
            data: []
        });
    }
}

//订单列表
exports.list = async (req, res, next) => {
    jwt.verify(req.headers["_piao-token"], PIAO_LOGIN_TOKEN_SALT,
        async (err, decoded) => {
            if (decoded) {
                let { uid } = decoded.data;
                const listRes = await ordersTable.find({user_id: uid, order_status:{
                    $in:[ORDER_STATUS.Unpaid, ORDER_STATUS.Paid, ORDER_STATUS.Refunded, ORDER_STATUS.Refunding, ORDER_STATUS.RefundFailed]
                }}, 'seat_count order_status cinema_name total_price film_name start_datetime end_datetime').sort({order_datetime:-1})

                res.send({
                    code: 0,
                    msg: "成功",
                    data: {
                        list:listRes,
                        total:listRes.length
                    }
                });
            }else{
                res.send({
                    code: 1,
                    msg: "请登录",
                    data: []
                });
            }
    })
}

//付款验证码
let vCode = null;
exports.getPayCode = async (req, res, next) => {
    var captcha = svgCaptcha.create({  
        // 翻转颜色  
        inverse: false,  
        // 字体大小  
        fontSize: 36,  
        // 噪声线条数  
        noise: 2,  
        // 宽度  
        width: 80,  
        // 高度  
        height: 30,  
      });  
      // 保存到session,忽略大小写  
      req.session = captcha.text.toLowerCase();
      vCode = req.session;
      //保存到cookie 方便前端调用验证
      res.cookie('captcha', req.session); 
      res.setHeader('Content-Type', 'image/svg+xml');
      res.write(String(captcha.data));
      res.end();
}

//订单支付
exports.payOrder = async (req, res, next) => {
    let {order_id, verifi_code} = req.body;

    if(verifi_code.toUpperCase() !== vCode.toUpperCase()){
        res.send({
            code: -1,
            msg: "验证码不正确",
            data: []
        });
        return;
    }

    if(order_id){
        const findOrderRes = await ordersTable.findOne({_id:order_id});

        if(!findOrderRes){
            res.send({
                code: -1,
                msg: "订单不存在",
                data: []
            });
            return;
        }
 
        let codeStr = qr.imageSync(order_id, { type: "png", size: 8, margin: 0 });
        let base64QR = "data:image/jpeg;base64," + codeStr.toString("base64");
        const payRes = await ordersTable.updateOne({_id:order_id},{
            pay_datetime: getUtils.timestamp2Date(Date.now()/1000,'{Y}-{M}-{D} {h}:{m}:{s}'),
            QR:base64QR,
            order_status:ORDER_STATUS.Paid
        })

        if(!payRes){
            res.send({
                code: -1,
                msg: "支付失败",
                data: []
            });
            return;
        }
        res.send({
            code: 0,
            msg: "成功",
            data: payRes
        });
    }else{
        res.send({
            code: -1,
            msg: "缺少订单id",
            data: []
        });
    }
}



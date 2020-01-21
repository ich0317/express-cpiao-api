const seatsTable = require("../../models/seat_list");
const sessionsTable = require("../../models/session_list");
const ordersTable = require("../../models/order_list");
const getUtils = require("../../utils/index");
const jwt = require("jsonwebtoken");
let {
    ORDER_STATUS,
    SEAT_STATUS,
    PIAO_LOGIN_TOKEN_SALT
} = require("../../constant");
//获取座位图
exports.getSeatMap = async (req, res, next) => {
    let {screen_id, session_id} = req.body;
    if(screen_id){
        const sessionRes = await sessionsTable.findOne({_id:session_id}, 'film_name start_datetime language film_version')

        if(!sessionRes){
            res.send({
                code:-1,
                msg:'场次不存在',
                data:[]
            })
            return;
        }
        const seatsRes = await seatsTable.find({screen_id}, 'seat_col seat_row graph_col graph_row seat_status');

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
        }, 'seat_id order_status user_id')

        jwt.verify(req.headers["_piao-token"], PIAO_LOGIN_TOKEN_SALT, async (err, decoded) => {
            if (decoded) {
                let { uid } = decoded.data;
                //查询已售或已锁定座位
                seatsRes.forEach(v=>{
                    findOrderRes.forEach(item=>{
                        if(item.seat_id.includes((v.toObject())._id)){
                            if(item.order_status === ORDER_STATUS.Unpaid){
                                console.log(item);
                                if(item.user_id === uid){
                                    v.seat_status = SEAT_STATUS[4]
                                }else{
                                    v.seat_status = SEAT_STATUS[1]
                                }
                            }else{
                                v.seat_status = SEAT_STATUS[1]
                            }
                        }
                    })
                })

                res.send({
                    code:0,
                    msg:'成功',
                    data:{
                        seats:seatsRes,
                        session:sessionRes,
                        total:seatsRes.length
                    }
                })
            }
        })
        
        
    }
}
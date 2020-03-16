const sessionsTable = require("../../models/session_list");
let { SESSIONS_STATUS } = require("../../constant");
const getUtils = require("../../utils/index");
let timer = null;

//获取影院排期
exports.getCinemaSessions = async (req, res, next) => {
   const nowDate = getUtils.timestamp2Date(Date.now()/1000,'{Y}-{M}-{D} {h}:{m}');
   const sessionsRes = await sessionsTable.find({status:SESSIONS_STATUS[1]}).sort({start_datetime: 1});
   let r = sessionsRes.filter(v=>v.start_datetime >= nowDate);
   res.send({
      code:0,
      msg:'成功',
      data:{
         sessions:r,
         total:r.length
      }
   })
}

//每分钟更新一次场次状态
clearInterval(timer);
timer = setInterval(async ()=>{
   const nowDate = getUtils.timestamp2Date(Date.now()/1000,'{Y}-{M}-{D} {h}:{m}');
   const sessionsRes = await sessionsTable.find({
      $or:[
         {status:SESSIONS_STATUS[0]},
         {status:SESSIONS_STATUS[1]}
      ]
   }, 'end_datetime')
   
   let r = sessionsRes.map(v=>v.end_datetime < nowDate && v._id);
   sessionsTable.updateMany({_id:{$in:r}},{status:SESSIONS_STATUS[3]},(err,res)=>{
      return console.log(err);
   })
}, 1000 * 60)
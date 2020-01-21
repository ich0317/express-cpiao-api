const sessionsTable = require("../../models/session_list");
const cinemasTable = require("../../models/cinema_list");
let { SESSIONS_STATUS } = require("../../constant");
const getUtils = require("../../utils/index");

//获取当前城市影片
exports.getPiaoFilm = async (req, res, next) => {
   let { city } = req.query;
   if(city){
      const cinemasRes = await cinemasTable.find({city});   //查询当前城市的影院
      
      let resLen = cinemasRes.length;
      let filterId = cinemasRes.map(v=> v._id);
      const sessionsRes = await sessionsTable.find({$and:[
         {cinema_id:{$in:filterId}},
         {status:SESSIONS_STATUS[1]}
      ]});
  
      //影片去重
      let obj = {};
      let r = sessionsRes.reduce(function(cur, next){
         obj[next.film_id] ? "" : obj[next.film_id] = true && cur.push(next);
         return cur
     },[]);

      res.send({
         code:0,
         msg:'成功',
         data:{
            sessions:r.map(v=>{
               return {
                  film_name:v.film_name,
                  film_long:v.film_long,
                  actors:v.actors,
                  director:v.director,
                  film_version:v.film_version,
                  film_photo:v.film_photo,
                  film_id:v.film_id
               }
            }),
            total:sessionsRes.length
         }
      }) 
   }else{
      res.send({
         code:-1,
         msg:'请选择城市',
         data:[]
      })
   }
};

//获取当前城市影院
exports.getPiaoCinemas = async (req, res, next) => {
   let { film_id, city } = req.query;
   let cinemasRes = [];
   if(film_id){
      const sessionsRes = await sessionsTable.find({$and:[
         {film_id},
         {status:SESSIONS_STATUS[1]}
      ]}, 'cinema_id');

      //排期去重
      let obj = {};
      let r = sessionsRes.reduce(function(cur, next){
         obj[next.cinema_id] ? "" : obj[next.cinema_id] = true && cur.push(next);
         return cur
      },[]);

      cinemasRes = await cinemasTable.find({_id:{$in:r.map(v=> v.cinema_id)}});
   }
   
   if(city){
      cinemasRes = await cinemasTable.find({city});
   }
   
   res.send({
      code:0,
      msg:'成功',
      data:{
         cinemas:cinemasRes,
         total:cinemasRes.length
      }
   })
}

//获取影院排期
exports.getCinemaSessions = async (req, res, next) => {
   let { cinema_id } = req.query;
   const cinemaRes = await cinemasTable.findOne({_id:cinema_id});
   
   const sessionsRes = await sessionsTable.find({$and:[
      {cinema_id},
      {status:SESSIONS_STATUS[1]}
   ]}).sort({start_datetime: 1})

   res.send({
      code:0,
      msg:'成功',
      data:{
         cinemaInfo:cinemaRes,
         sessionsInfo:{
            list:sessionsRes,
            total:sessionsRes.length
         }
      }
   })
}

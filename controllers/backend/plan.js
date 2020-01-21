const express = require("express");
const app = express();
const filmListTable = require("../../models/film_list");
const sessionListTable = require("../../models/session_list");
const screenListTable = require("../../models/screen_list");
const seatListTable = require("../../models/seat_list");
let { stampToTime, timestamp2Date } = require("../../utils/index");
let { SESSIONS_STATUS } = require("../../constant");
//const SESSIONS_STATUS = [0, 1, 2, 3]; //（0未审核 1已审核 2禁售 3完场）

//查询影片
exports.searchFilm = (req, res, next) => {
  let { film_name } = req.body;
  if(film_name){
    filmListTable.find({film_name:{$regex:film_name}},(err,data)=>{
      if (err) return console.log(err);
      if(data.length == 0){
        res.json({
          code:1,
          msg:'暂无影片',
          data
        });
      }else{
        res.json({
          code:0,
          msg:'获取成功',
          data
        });
      }
    });
  }
};

//设置排期
exports.addSession = async (req, res, next) => {
  let { _id, screen_id } = req.body;
  if(_id){
    //修改
  }else{
    //新增
    //const copySeatMap = await seatListTable.find({screen_id},(err,data)=>data);
    sessionListTable.create(req.body,(err,data)=>{
      if (err) return console.log(err);
      res.json({
        code:0,
        msg:'添加成功',
        data
      });
    });
  }
}

//获取影厅和排期
exports.getScreenSession = async (req, res, next) => {
  let { cinema_id, selectDate } = req.query;

  const screenRes = await screenListTable.find({cinema_id},(err,data)=>{
    if (err) return console.log(err);
    return data;
  })

  if(screenRes.length == 0){
    res.json({
      code:1,
      msg:'暂无影厅',
      data:{
        screen:screenRes,
        session:[]
      }
    });
    return;
  }
  
  //选出传入日期的影片
  sessionListTable.find({$and:[
    {cinema_id},
    {start_datetime:{$gte:`${selectDate} 00:00`}},
    {start_datetime:{$lte:`${selectDate} 23:59`}}
  ]},(err,data)=>{
    if (err) return console.log(err);
    
    if(data.length == 0){
      res.json({
        code:1,
        msg:'暂无排期',
        data:{
          screen:screenRes,
          session:[]
        }
      });
    }else{
      let nowDateTime = stampToTime(Date.now(),'YMDhms');
      let endSessionId = data.map(v=>{
        if(nowDateTime > v.end_datetime){
          v.status = SESSIONS_STATUS[3];
          return {_id:v._id};
        }
      }).filter(v=>v);

      sessionListTable.updateMany(endSessionId,{status:SESSIONS_STATUS[3]},(err,data)=>data);
   
      res.json({
        code:0,
        msg:'获取成功',
        data:{
          screen:screenRes,
          session:data
        }
      });
    }
  });
}

//删除排期
exports.delSession = (req, res, next) => {
  sessionListTable.deleteOne(req.body,(err,data)=>{
    if (err) return console.log(err);
      res.json({
        code:0,
        msg:'删除成功',
        data
      });
  });
}

//审核排期
exports.agreeSession = (req, res, next) => {
  sessionListTable.updateMany({_id:req.body},{status:1}, (err,data)=>{
    if (err) return console.log(err);
      res.json({
        code:0,
        msg:'审核成功'
      });
  });
}

//定时任务跑影片完场状态
setInterval(async ()=>{
  const passSessions = await sessionListTable.find({status:SESSIONS_STATUS[1]}, 'end_datetime');
  let getDateNow = timestamp2Date(Math.floor(Date.now()/1000), '{Y}-{M}-{D} {h}:{m}')
  let r = passSessions.map(v=>{
    if(getDateNow > v.end_datetime){
      return v._id;
    }
  }).filter(v=> v && v);
  return sessionListTable.update({_id:r},{status:SESSIONS_STATUS[3]});
},600000)


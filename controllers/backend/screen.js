const express = require("express");
const app = express();
const screenListTable = require("../../models/screen_list");
const seatListTable = require("../../models/seat_list");

//添加影厅
exports.addScreen = (req, res, next) => {
  let { _id } = req.body;
  if(_id){
    //修改
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
  }else{
    //新增
    screenListTable.create(req.body,(err,data)=>{
      if (err) return console.log(err);
      res.json({
        code:0,
        msg:'添加成功',
        data
      });
    });
  }
};

//获取影厅及默认座位
exports.getScreen = async (req, res, next) => {
  let { cinema_id , _id} = req.query;
  if(!cinema_id){
    res.json({
      code:-1,
      msg:'缺少影院id'
    });
    return;
  }
  const r = await screenListTable.find({cinema_id},(err,data)=>{
    if (err) return console.log(err);
    if(data.length == 0){
      res.json({
        code:1,
        msg:'请先添加影厅',
        data
      });
    }else{
      return data;
    }
  });

  seatListTable.find({screen_id:r[0]._id},(err,data)=>{
    if (err) return console.log(err);
    res.json({
      code:0,
      msg:'获取成功',
      data:{
        screen:r,
        seat:data
      }
    });
  });

}

//添加座位
exports.addSeat = async (req,res,err)=>{
  let {seat} = req.body;

  if(seat[0].screen_id){
    //修改
    seatListTable.deleteMany({screen_id:seat[0].screen_id},(err,data=>data));
  }
  //增加
  seatListTable.insertMany(seat,(err,data)=>{
    if (err) return console.log(err);
    res.json({
      code:0,
      msg:'保存成功',
      data
    });
  });
}

//获取座位
exports.getSeat = (req,res,err)=>{
  let { screen_id } = req.body;

  seatListTable.find({screen_id},(err,data)=>{
    if (err) return console.log(err);
    if(data.length == 0){
      res.json({
        code:1,
        msg:'暂无数据',
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

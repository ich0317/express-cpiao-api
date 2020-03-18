const express = require("express");
const app = express();
const screenListTable = require("../../models/screen_list");
const seatListTable = require("../../models/seat_list");
const sessionListTable = require("../../models/session_list");
let { SESSIONS_STATUS } = require("../../constant");

//添加影厅
exports.addScreen = async (req, res, next) => {
    let { _id } = req.body;
    if (_id) {
        //修改
        const updateRes = await screenListTable.updateOne(
            {
                _id
            },
            req.body
        );
        res.json({
            code: 0,
            msg: "修改成功",
            data: updateRes
        });
    } else {
        //新增
        screenListTable.create(req.body, (err, data) => {
            if (err) return console.log(err);
            res.json({
                code: 0,
                msg: "添加成功",
                data
            });
        });
    }
};

//删除影厅
exports.delScreen = async (req, res, next) => {
    let { _id } = req.body;
    if (_id) {
      const validSessions = await sessionListTable.find({screen_id:_id, status:SESSIONS_STATUS[1]});
        if(validSessions.length !== 0){
          res.json({
              code: -1,
              msg: "该影厅有排期，不能删除",
              data:[]
          });
          return;
        }
        await screenListTable.deleteOne({ _id }, (err, data) => {
            if (err) return console.log(err);
            res.json({
                code: 0,
                msg: "删除成功",
                data
            });
        });
    } else {
      res.json({
          code: -1,
          msg: "缺少影厅id",
          data
      });
    }
};

//获取影厅及默认座位
exports.getScreen = async (req, res, next) => {
    let { cinema_id, _id } = req.query;
    if (!cinema_id) {
        res.json({
            code: -1,
            msg: "缺少影院id"
        });
        return;
    }
    const r = await screenListTable.find({ cinema_id }, (err, data) => {
        if (err) return console.log(err);
        if (data.length == 0) {
            res.json({
                code: 1,
                msg: "请先添加影厅",
                data
            });
        } else {
            return data;
        }
    });

    seatListTable.find({ screen_id: r[0]._id }, (err, data) => {
        if (err) return console.log(err);
        res.json({
            code: 0,
            msg: "获取成功",
            data: {
                screen: r,
                seat: data
            }
        });
    });
};

//添加座位
exports.addSeat = async (req, res, err) => {
    let { seat } = req.body;

    if (seat[0].screen_id) {
        //修改
        const validSessions = await sessionListTable.find({screen_id:seat[0].screen_id, status:SESSIONS_STATUS[1]});
  
        if(validSessions.length !== 0){
          res.json({
              code: -1,
              msg: "该影厅有排期，不能修改",
              data:[]
          });
          return;
        }
        seatListTable.deleteMany(
            { screen_id: seat[0].screen_id },
            (err, data => data)
        );
    }
    //增加
    seatListTable.insertMany(seat, (err, data) => {
        if (err) return console.log(err);
        res.json({
            code: 0,
            msg: "保存成功",
            data
        });
    });
};

//获取座位
exports.getSeat = (req, res, err) => {
    let { screen_id } = req.body;

    seatListTable.find({ screen_id }, (err, data) => {
        if (err) return console.log(err);
        if (data.length == 0) {
            res.json({
                code: 1,
                msg: "暂无数据",
                data
            });
        } else {
            res.json({
                code: 0,
                msg: "获取成功",
                data
            });
        }
    });
};

const express = require('express');
const app = express();
const bodyParser = require("body-parser"); //交互
const mongoose = require("mongoose"); //数据库
const collegeListTable = require("../../models/college_list"); //数据表
const filmListTable = require("../../models/film_list");
const cinemaListTable = require("../../models/cinema_list");
const screenListTable = require("../../models/screen_list");
const sessionListTable = require("../../models/session_list");
const adminUserTable = require("../../models/admin_user");
const pinyin = require("pinyin");
const getUtils = require("../../utils/index")

//添加影院
exports.addCinema = async (req, res, next) => {
    let aParams = req.body;
    let pinyinRes = pinyin(aParams.area[1], {
        style: pinyin.STYLE_NORMAL
    });
    let spell = "";
    aParams.province = aParams.area[0];
    aParams.city = aParams.area[1];
    pinyinRes.forEach(v => {
        spell += getUtils.capitalize(v[0]);
    })
    aParams.spell = spell;
    let latLngArr = aParams.lat_lng.split(',');
    req.body.lat = latLngArr[0];
    req.body.lng = latLngArr[1];
    delete aParams.area;
    if (req.body._id) {
        //修改
        cinemaListTable.update(
            { _id: req.body._id },
            req.body,
            (err, data) => {
                if (err) console.log(err);
                res.json({
                    code: 0,
                    msg: "更新成功",
                    data
                });
            }
        );
    } else {
        //新增
        const r = await cinemaListTable.findOne({
            $and: [
                { cinema_name: aParams.cinema_name },
                { city: { '$regex': aParams.city } }
            ]
        }, (err, data) => data);

        if (r) {
            res.json({
                code: -1,
                msg: "同一地区影院名称不能重复"
            });
        } else {
            await cinemaListTable.create(req.body, (err, data) => {
                if (err) console.log(err);
                res.json({
                    code: 0,
                    msg: "保存成功",
                    data
                });
            });
        }


    }
};

//获取影院列表
exports.getCinema = async (req, res, next) => {
    let { page = 1, page_size = 10, city, searchName } = req.query;
    let queryCond = {};
    let $and = [];
    if(searchName){
        $and.push({cinema_name:{ '$regex': searchName }}); 
    }
    if(city){
        $and.push({province:{ '$regex': city[0] }},{city:{ '$regex': city[1] }}); 
    }

    if($and.length != 0){
        queryCond.$and = $and;
    }

    let n = (Number(page) - 1) * page_size;
    let numAdventures = await cinemaListTable.estimatedDocumentCount({}, (err, length) => {
        return length;
    });

    await cinemaListTable.find(queryCond).skip(n).limit(Number(page_size)).sort({ _id: -1 }).exec((err, data) => {
        if (err) return console.log(err);
        if (data.length == 0) {
            res.json({
                code: 1,
                msg: "暂无影院",
                data: {
                    data,
                    total: numAdventures
                }
            });
        } else {
            res.json({
                code: 0,
                msg: "获取成功",
                data: {
                    data,
                    total: numAdventures
                }
            });
        }
    });
}

//获取影院详情
exports.getCinemaDetail = async (req, res, next) => {
    let { cinema_id } = req.query;
    if (cinema_id) {
        cinemaListTable.findOne({ _id: cinema_id }, (err, data) => {
            if (err) return console.log(err);
            res.json({
                code: 0,
                msg: "获取成功",
                data: data
            });
        })
    }
}
//删除影院
exports.delCinema = (req, res, next) => {
    cinemaListTable.deleteOne({ _id: req.body._id }, (err, data) => {
        if (err) console.log(err);
        res.json({
            code: 0,
            msg: "删除成功",
            data
        });
    });
};

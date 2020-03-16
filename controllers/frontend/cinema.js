/**
 * 获取影院信息表
 */
const cinemasTable = require("../../models/cinema_list");

//获取当前影院信息
exports.getPiaoCinemas = async (req, res, next) => {
    const cinemasRes = await cinemasTable.find({});
    res.send({
       code:0,
       msg:'成功',
       data:{
        cinemas: cinemasRes,
        total: cinemasRes.length
       }
    })
 }
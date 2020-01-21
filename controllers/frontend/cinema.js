const cinemasTable = require("../../models/cinema_list");
const getUtils = require("../../utils/index");

//获取所有排期城市
exports.getPiaoCitys = async (req, res, next) => {
    const validCitys = await cinemasTable.find({ status: true }, 'province city spell');
    let obj = {};
    let r = validCitys.reduce(function(cur, next){
        obj[next.city] ? "" : obj[next.city] = true && cur.push(next);
        
        return cur
    },[]);

    res.send({
        code:0,
        msg:'成功',
        data:{
            list:r.map(v=>{
                return {
                    label: v.city,
                    spell: v.spell,
                    value: v.city
                }
            }),
            total:r.length
        }
    })
  
 };
const adminUserTable = require("../../models/piao_user");

//获取用户列表
exports.getUserList = async (req, res, next) => {
    let { searchName, page = 1, page_size = 10 } = req.query;
    
    let n = (Number(page) - 1) * page_size;
    let searchCond = searchName ? {username:{'$regex':searchName}} : {};

    //查询总条数
    let numAdventures = await adminUserTable.estimatedDocumentCount({}, (err, length) => length);

    adminUserTable.find(searchCond,'username reg_datetime').skip(n).limit(Number(page_size)).sort({_id:-1}).exec((err, data) => {
        if (err) return console.log(err);
        numAdventures = searchName ? data.length : numAdventures;
        if (data.length == 0) {
            res.json({
                code: 1,
                msg: "暂无用户",
                data:{
                    list:data,
                    total:numAdventures
                }
            });
        } else {
            res.json({
                code: 0,
                msg: "获取成功",
                data:{
                    list:data,
                    total:numAdventures
                }
            });
        }
    })
};

//登出

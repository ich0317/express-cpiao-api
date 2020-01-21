const usersTable = require("../../models/piao_user");
const jwt = require("jsonwebtoken");
const svgCaptcha = require('svg-captcha');
let { PIAO_LOGIN_TOKEN_SALT, PIAO_LOGIN_TOKEN_EXPIRES } = require("../../constant");

//会员登录注册
exports.login = async (req, res, next) => {
    let { username, password } = req.body;

    if(!username){
        res.send({
            code:-1,
            msg:'请输入用户名',
            data:[]
        })
        return;
    }

    if(!password){
        res.send({
            code:-1,
            msg:'请输入密码',
            data:[]
        })
        return;
    }

    const userRes = await usersTable.findOne({username, password});
    

    if(!userRes){
        res.send({
            code:-1,
            msg:'用户名或密码不存在',
            data:[]
        })
        return;
    }

    let token = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + PIAO_LOGIN_TOKEN_EXPIRES,
            data: {
                password,
                uid:userRes._id
            }
        },
        PIAO_LOGIN_TOKEN_SALT
    );

    res.send({
        code: 0,
        msg: "登录成功",
        data: {
            username: userRes.username,
            token,
            reg_datetime:userRes.reg_datetime
        }
    });
}

//获取登录信息
exports.getLoginInfo = async (req, res, next) => {
    jwt.verify(
        req.headers["_piao-token"],
        PIAO_LOGIN_TOKEN_SALT,
        async (err, decoded) => {
            if (decoded) {
                let { uid } = decoded.data;
                const userRes = await usersTable.findOne({_id:uid}, 'username')
                res.send({
                    code: 0,
                    msg: "成功",
                    data: userRes
                });
            }
    })
}




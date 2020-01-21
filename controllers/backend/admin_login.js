const adminTable = require("../../models/admin");
const jwt = require("jsonwebtoken");
let {LOGIN_TOKEN_SALT, LOGIN_TOKEN_EXPIRES} = require("../../constant");

exports.login = async (req, res, next) => {
    let { username, password } = req.body;
    const userAdmin = await adminTable.findOne({ username, password });
    if (userAdmin) {
        let token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + LOGIN_TOKEN_EXPIRES,
                data: password
            },
            LOGIN_TOKEN_SALT
        );

        res.send({
            code: 0,
            msg: "登录成功",
            data: {
                username: userAdmin.username,
                uid: userAdmin._id,
                token
            }
        });
    } else {
        res.send({
            code: -1,
            msg: "用户名或密码错误",
            data: {}
        });
    }
};

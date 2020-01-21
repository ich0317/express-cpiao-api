let jwt = require('jsonwebtoken');
/**
 * 设置加密token
 * @param {Object, String, Number}
 * content需要加密数据
 * salt盐
 * expiresIn过期时间 / 秒
 */
exports.setToken = (content, salt = 'abc123', expiresIn) => jwt.sign(content, salt, { expiresIn });
/**
 * 解密token
 * @param {String}
 * token token
 * salt盐
 */
exports.parseToken = (token, salt = 'abc123') => jwt.verify(token, salt, (err, decoded) => decoded);
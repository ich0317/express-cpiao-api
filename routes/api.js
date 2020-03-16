const express = require('express');
const router = express.Router();

const login = require('../controllers/backend/admin_login')
const cinemaManage = require('../controllers/backend/cinema_manage');
const filmManage = require('../controllers/backend/film_manage');
const planManage = require('../controllers/backend/plan');
const screenManage = require('../controllers/backend/screen');
const newsManage = require('../controllers/backend/news');
const userManage = require('../controllers/backend/users');
const orderManage = require('../controllers/backend/order');

const oFilm = require('../controllers/frontend/film');
const oCinema = require('../controllers/frontend/cinema');
const oSeat = require('../controllers/frontend/seats');
const oOrder = require('../controllers/frontend/order');
const oMember = require('../controllers/frontend/member');


/**
 * 前台api
 */
//获取登录验证码
//router.get('/getPiaoVerifiCode', oMember.getVerificationCode)
//登录
router.post('/piaoLogin', oMember.login)
//获取当前影院信息
router.get('/getPiaoCinemas', oCinema.getPiaoCinemas)
//获取当前影院排期
router.get('/getPiaoCinemaSessions', oFilm.getCinemaSessions)

//获取影院座位图
router.post('/getPiaoSeatMap', oSeat.getSeatMap)
//创建订单
router.post('/createPiaoOrder', oOrder.createOrder)
//获取订单信息
router.get('/getPiaoOrderDetail', oOrder.getOrderDetail)
//获取付款验证码
router.get('/getPiaoPayCode', oOrder.getPayCode)
//订单支付
router.post('/piaoPayOrder', oOrder.payOrder)
//订单过期
router.post('/piaoPayExpire', oOrder.payExpire)
//获取登录信息
router.get('/getPiaoLoginInfo', oMember.getLoginInfo)
//获取订单列表
router.get('/getPiaoList', oOrder.list)









/* 票后台 */
router.post('/adminLogin', login.login);
//添加影院
router.post("/addCinema", cinemaManage.addCinema);
//获取影院列表
router.get("/getCinema", cinemaManage.getCinema);
//获取影院详情
router.get("/getCinemaDetail", cinemaManage.getCinemaDetail);
//删除影院
router.post("/delCinema", cinemaManage.delCinema);
//排期 搜索影片
router.post("/searchFilm", planManage.searchFilm);
//添加影厅
router.post("/addScreen", screenManage.addScreen);
//获取影厅
router.get("/getScreen", screenManage.getScreen);
//添加座位
router.post("/addSeat", screenManage.addSeat);
//获取座位
router.post("/getSeat", screenManage.getSeat);
//添加排期
router.post("/addSession", planManage.addSession);
//获取影厅和排期
router.get("/getScreenSession", planManage.getScreenSession);
//删除排期
router.post("/delSession", planManage.delSession);
//审核排期
router.post("/agreeSession", planManage.agreeSession);
/**
 * 影片列表
 */
//添加影片
router.post("/addFilm", filmManage.addFilm);
//添加影片海报
router.post("/upFilmPhoto", filmManage.upFilmPhoto);
//获取影片列表
router.post("/getFilmList", filmManage.getFilmList);
//获取影片详情
router.get("/getFilmDetail", filmManage.getFilmDetail);
//删除影片
router.post("/delFilm", filmManage.delFilm);
//抓取电影信息
router.get("/getdbFilm", filmManage.getdbFilm);
/**
 * 订单管理
 */
//获取用户订单
router.get("/getOrder", orderManage.getOrder);
//获取订单详情
router.get("/getOrderDetail", orderManage.getOrderDetail);

/**
 * 新闻栏目
 */
//添加新闻图片
router.post("/upNewsPhoto", newsManage.upNewsPhoto);
//添加新闻
router.post("/addNews", newsManage.addNews);
//获取新闻列表
router.get("/getNewsList", newsManage.getNewsList);
//获取新闻详情
router.get("/getNewsDetail", newsManage.getNewsDetail);
//删除新闻
router.post("/delNews", newsManage.delNews);
/**
 * 用户栏目
 */
//获取用户列表
router.get("/getUserList", userManage.getUserList);

module.exports = router;

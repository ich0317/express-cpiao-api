const newsListTable = require("../../models/news_list");
const fs = require("fs");
const multer = require("multer"); //express上传中间件
let { parseToken } = require("../../utils/token");

exports.upNewsPhoto = (req, res, next) => {
  let storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
      let apiPath = req.route.path;  //上传接口
      let oDate = new Date();
      let YM = oDate.getFullYear() + "-" + (oDate.getMonth() + 1);
      let getFileNam = fs.readdirSync("./uploads/news_photos/");

      if (getFileNam.indexOf(YM) == -1) {
        fs.mkdir("./uploads/news_photos/" + YM, function (err) {
          //创建文件夹
          if (err) return console.error(err);
          cb(null, "./uploads/news_photos/" + YM); //图片存放路径
        });
      } else {
        cb(null, "./uploads/news_photos/" + YM); //图片存放路径
      }
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
      let fileFormat = file.originalname.split(".");
      cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]); //文件名为时间戳
    }
  });
  //添加配置文件到muler对象。
  let upload = multer({
    storage: storage
  }).single("file");

  upload(req, res, function (err) {
    if (err) return console.error(err);
    let upPath = req.file.path.replace(/\\+/g, "/");

    res.json({
      code: 0,
      msg: "上传成功",
      data: {
        imgUrl: `http://${req.headers.host}/${upPath}`
      }
    });
  });
}

//添加新闻
exports.addNews = (req, res, next) => {
  let { _id } = req.body;
  if (_id) {
    //修改
    newsListTable.update({ _id }, req.body, (err, data) => {
      res.json({
        code: 0,
        msg: '修改成功',
        data
      });
    })
  } else {
    //新增
    newsListTable.create(req.body, (err, data) => {
      res.json({
        code: 0,
        msg: '保存成功',
        data
      });
    })
  }

}


//获取新闻列表
exports.getNewsList = async (req, res, next) => {
  let { title, page = 1, page_size = 10 } = req.query;
  let getToken = req.headers["x-token"];
  let { username } = parseToken(getToken, "a1234");
  let n = (Number(page) - 1) * page_size;
  let searchCond = title ? {title:{'$regex':title}} : {};

  //查询总条数
  let numAdventures = await newsListTable.estimatedDocumentCount({}, (err, length) => length);

  newsListTable.find(searchCond, 'title editor release_date like views status').skip(n).limit(Number(page_size)).sort({_id:-1}).exec((err, data) => {
    
    numAdventures = title ? data.length : numAdventures;
    if (data.length == 0) {
      res.json({
        code: 1,
        msg: '暂无数据',
        data:{
          list:data,
          total:numAdventures
        }
      });
    } else {
      let newData = data.map(v=>{
        return {
          like:v.like,
          release_date: v.release_date,
          status: v.status,
          title: v.title,
          views: v.views,
          _id: v._id,
          username
        }
      })

      res.json({
        code: 0,
        msg: '获取成功',
        data:{
          list:newData,
          total:numAdventures
        }
      });
    }
  });
}

//获取新闻详情
exports.getNewsDetail = (req, res, next) => {
  let { _id } = req.query;
  newsListTable.findOne({ _id }).exec((err, data) => {
    res.json({
      code: 0,
      msg: '获取成功',
      data
    });
  });
}

//删除新闻
exports.delNews = (req, res, next) => {
  let { _id } = req.body;
  newsListTable.deleteOne({ _id }, (err, data) => {
    if (err) console.log(err);
    res.json({
      code: 0,
      msg: "删除成功",
      data
    });
  });
}

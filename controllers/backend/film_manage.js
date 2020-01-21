const express = require("express");
const app = express();
const bodyParser = require("body-parser"); //交互
const mongoose = require("mongoose"); //数据库
const filmListTable = require("../../models/film_list");
const fs = require("fs");
const multer = require("multer"); //express上传中间件
let https = require("https");
let path = require("path");
let cheerio = require("cheerio");

//添加影片
exports.addFilm = async (req, res, next) => {
  if (req.body._id) {
    //修改
    filmListTable.updateOne({ _id: req.body._id }, req.body, (err, data) => {
      if (err) console.log(err);
      res.json({
        code: 0,
        msg: "更新成功",
        data
      });
    });
  } else {
    //新增
    const r = await filmListTable.findOne(
      { film_name: req.body.film_name },
      (err, data) => data
    );
    //重复验证
    if (r) {
      res.json({
        code: -1,
        msg: "影片已存在"
      });
      return;
    }
    filmListTable.create(req.body, (err, data) => {
      if (err) console.log(err);
      res.json({
        code: 0,
        msg: "保存成功",
        data
      });
    });
  }
};

//影片图片上传
exports.upFilmPhoto = (req, res, next) => {
  let storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function(req, file, cb) {
      let apiPath = req.route.path; //上传接口
      let oDate = new Date();
      let YM = oDate.getFullYear() + "-" + (oDate.getMonth() + 1);
      let getFileNam = fs.readdirSync("./uploads/film_photos/");
console.log(getFileNam);
      if (getFileNam.indexOf(YM) == -1) {
        fs.mkdir("./uploads/film_photos/" + YM, function(err) {
          //创建文件夹
          if (err) return console.error(err);
          cb(null, "./uploads/film_photos/" + YM); //图片存放路径
        });
      } else {
        cb(null, "./uploads/film_photos/" + YM); //图片存放路径
      }
    },
    //给上传文件重命名，获取添加后缀名
    filename: function(req, file, cb) {
      let fileFormat = file.originalname.split(".");

      cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]); //文件名为时间戳
    }
  });
  //添加配置文件到muler对象。
  let upload = multer({
    storage: storage
  }).single("file");

  upload(req, res, function(err) {
    if (err) return console.error(err);
    let upPath = req.file.path.replace(/\\\+/g, "/");
    res.json({
      code: 0,
      msg: "上传成功",
      data: {
        imgUrl: `http://localhost:3001/${upPath}`
      }
    });
  });
};

//获取影片列表
exports.getFilmList = async (req, res, next) => {
  let { film_name, release_date, page = 1, page_size = 10 } = req.body;
  let getCond = {};
  let condArr = [];

  if (film_name) {
    condArr.push({ film_name: { $regex: film_name } });
  }

  if (release_date && !!release_date.length) {
    condArr.push({
      $and: [
        { release_date: { $gte: release_date[0] } },
        { release_date: { $lte: release_date[1] } }
      ]
    });
  }

  let n = (Number(page) - 1) * page_size;
  let numAdventures = await filmListTable.estimatedDocumentCount(
    {},
    (err, length) => {
      return length;
    }
  );

  if (!!condArr.length) {
    //有条件
    getCond = { $and: condArr };
  }

  filmListTable
    .find(getCond)
    .skip(n)
    .limit(Number(page_size))
    .sort({ _id: -1 })
    .exec((err, data) => {
      if (err) return console.log(err);
      if (!!condArr.length) {
        numAdventures = data.length;
      }
      if (data.length == 0) {
        res.json({
          code: 1,
          msg: "暂无数据",
          data: {
            film: data,
            total: numAdventures
          }
        });
      } else {
        res.json({
          code: 0,
          msg: "获取成功",
          data: {
            film: data,
            total: numAdventures
          }
        });
      }
    });
};

//获取影片详情
exports.getFilmDetail = (req, res, next) => {
  filmListTable.findOne(req.query, (err, data) => {
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

//删除影片
exports.delFilm = (req, res, next) => {
  filmListTable.deleteOne(req.body, (err, data) => {
    res.json({
      code: 0,
      msg: "删除成功",
      data
    });
  });
};

//抓取电影信息
exports.getdbFilm = (req, res, next) => {
  let { film_name } = req.query;
  let filmName = film_name;
  https
    .get(
      `https://movie.douban.com/j/subject_suggest?q=${encodeURI(filmName)}`,
      suc1 => {
        let getData = "";
        suc1.on("data", function(data) {
          getData += data;
        });
        suc1.on("end", () => {
          if (JSON.parse(getData).length === 0) {
            res.json({
              code: -1,
              msg: "暂无影片"
            });
            return;
          }

          let filmId = JSON.parse(getData)[0].id;
          if (filmId) {
            https
              .get(`https://movie.douban.com/subject/${filmId}/`, suc2 => {
                let getData2 = "";
                suc2.on("data", function(data) {
                  getData2 += data;
                });

                suc2.on("end", function() {
                  let $ = cheerio.load(getData2);
                  let oHtml = $("#info")
                    .html()
                    .replace(/\s+/g, "");
                  let oHtmlArr = oHtml.split("<br>");
                  let film_type = "";
                  let release_date = "";
                  let film_long = "";
                  for (let i = 0; i < $("#info span").length; i++) {
                    let iSpan = $("#info span").eq(i);
                    if (iSpan.attr("property") === "v:genre") {
                      film_type += iSpan.text() + "/";
                    }
                    if (
                      iSpan.attr("property") === "v:initialReleaseDate" &&
                      iSpan.attr("content").indexOf("中国大陆") != -1
                    ) {
                      release_date = iSpan
                        .attr("content")
                        .replace(/\(中国大陆\)/, "");
                    }

                    if (iSpan.attr("property") === "v:runtime") {
                      film_long = iSpan.attr("content");
                    }
                  }
                  let country = "";
                  let language = "";
                  let alias = "";
                  oHtmlArr.forEach(v => {
                    if (
                      v.indexOf(
                        "&#x5236;&#x7247;&#x56FD;&#x5BB6;/&#x5730;&#x533A;"
                      ) !== -1
                    ) {
                      country = unescape(
                        v
                          .replace(
                            /<spanclass="pl">&#x5236;&#x7247;&#x56FD;&#x5BB6;\/&#x5730;&#x533A;:<\/span>/,
                            ""
                          )
                          .replace(/&#x/g, "%u")
                          .replace(/;/g, "")
                          .replace(/%uA0/g, " ")
                      );
                    }
                    if (v.indexOf("&#x8BED;&#x8A00;") !== -1) {
                      language = unescape(
                        v
                          .replace(
                            /<spanclass="pl">&#x8BED;&#x8A00;:<\/span>/,
                            ""
                          )
                          .replace(/&#x/g, "%u")
                          .replace(/;/g, "")
                          .replace(/%uA0/g, " ")
                      );
                    }
                    if (v.indexOf("&#x53C8;&#x540D;") !== -1) {
                      alias = unescape(
                        v
                          .replace(
                            /<spanclass="pl">&#x53C8;&#x540D;:<\/span>/,
                            ""
                          )
                          .replace(/&#x/g, "%u")
                          .replace(/;/g, "")
                          .replace(/%uA0/g, " ")
                      );
                    }
                  });
                  let info = {
                    director: $("#info span")
                      .eq(0)
                      .find(".attrs")
                      .text()
                      .replace(/\s/g, ""),
                    screenwriter: $("#info span")
                      .eq(0)
                      .siblings("span")
                      .find(".attrs")
                      .text(),
                    actors: $("#info .actor")
                      .find(".attrs")
                      .text()
                      .replace(/\s/g, ""),
                    film_type: film_type.replace(/\/$/, ""),
                    country,
                    language,
                    release_date,
                    film_long,
                    alias,
                    //film_photo: JSON.parse(getData)[0].img,
                    film_name: JSON.parse(getData)[0].title,
                    brief: $("#link-report").text().replace(/\s/g, "")
                  };

                  res.json({
                    code: 0,
                    msg: "获取成功",
                    data: info
                  });
                });
              })
              .on("error", function() {
                console.log("获取数据出错2！");
                res.json({
                  code: -1,
                  msg: "获取失败"
                });
              });
          }
        });
      }
    )
    .on("error", function() {
      console.log("获取数据出错1！");
      res.json({
        code: -1,
        msg: "获取失败"
      });
    });
};

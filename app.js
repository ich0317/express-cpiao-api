const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const apiRouter = require('./routes/api');
const bodyParser = require("body-parser"); //交互
const app = express();
const jwt = require("jsonwebtoken");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(__dirname + "/uploads")); //文件托管
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true
  })
);

app.use(
  bodyParser.json({
    limit: "50mb"
  })
);


/**
 * 后台登录拦截
 */
// app.use('/', async (req,res,next)=>{
//   if(req.headers['x-token']){
//     jwt.verify(req.headers['x-token'], 'a1b2c3d4', (err, decoded) => {
//       if(decoded){
//         next()
//       }else{
//         res.send({
//           code:20001,
//           msg:"请重新登录",
//           data:{}
//         });
//       }
//     });
//   }else{
//     if(req.originalUrl === '/api/adminLogin'){
//       next()
//     }else{
//       res.send({
//         code:20002,
//         msg:"请登录",
//         data:{}
//       });
//     }
//   }
// })

app.use('/api', apiRouter);

mongoose.connect('mongodb://localhost:27017/piaopiao', {useNewUrlParser:true, useUnifiedTopology: true }).catch(err => console.log(err));

module.exports = app;

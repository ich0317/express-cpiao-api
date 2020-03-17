const orderListTable = require("../../models/order_list");
let { parseToken } = require("../../utils/token");

//获取订单列表
exports.getOrder = async (req, res, next) => {
  let {
    film_name,
    order_num,
    page = 1,
    page_size = 10,
    orderDateTime,
    username
  } = req.query;
  let n = (Number(page) - 1) * page_size;
  let searchCond = {};
  let $and = [];

  if (orderDateTime.length != 0) {
    $and = [{
      order_datetime: {
        '$gte': `${orderDateTime[0]} 00:00:00`,
        '$lte': `${orderDateTime[1]} 23:59:59`
      }
    }];
  }

  if (film_name) {
    $and.push({
      film_name: {
        '$regex': film_name
      }
    });
  }

  if (order_num) {
    $and.push({
      order_num: {
        '$regex': order_num
      }
    });
  }

  if (username) {
    $and.push({
      username: {
        '$regex': username
      }
    });
  }

  if ($and.length != 0) {
    searchCond.$and = $and;
  }

  //查询总条数
  let numAdventures = await orderListTable.estimatedDocumentCount(
    {},
    (err, length) => length
  );

  orderListTable
    .find(
      searchCond,
      "order_num film_name cinema_name total_price total_serveprice order_datetime order_status total_price user_id seat"
    )
    .skip(n)
    .limit(Number(page_size))
    .sort({ _id: -1 })
    .exec((err, data) => {
      numAdventures = film_name ? data.length : numAdventures;
      if (data.length == 0) {
        res.json({
          code: 1,
          msg: "暂无数据",
          data: {
            list: data,
            total: numAdventures
          }
        });
      } else {
        res.json({
          code: 0,
          msg: "获取成功",
          data: {
            list: data,
            total: numAdventures
          }
        });
      }
    });
};

//获取订单详情
exports.getOrderDetail = (req, res, next) => {
  let { order_id } = req.query;
  orderListTable.findOne({_id:order_id}, (err,data)=>{
    if(!data){
      res.json({
        code: 1,
        msg: "暂无数据"
      });
      return;
    }
    res.json({
      code: 0,
      msg: "获取成功",
      data
    });
  });
}

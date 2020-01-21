/**
 * Created by changliang on 6/22/19.
 */

/**
 * 个位数补0
 * @param {(number|string)}
 */
exports.to0 = n => {
  return n * 1 < 10 ? "0" + n : n;
};

/**
 * 时间戳或GMT转时间转换
 * @param {(string | dateGMT),string}
 * timeStamp 时间戳或GMT格式日期
 * format = YMD => 年-月-日 , Y=> 年 , M=>月 , D=>日 , YM => 年-月 , hms=> 时:分:秒 , YMDhms=> 年-月-日 时:分:秒 , YMDhm=> 年-月-日 时:分
 */
exports.stampToTime = (date, format = "YMDhms") => {
  let getDate = null;
  let to0 = n => (n * 1 < 10 ? "0" + n : n);

  if (Object.prototype.toString.call(date) == "[object Date]") {
    //GMT
    getDate = date;
  } else {
    //时间戳
    getDate = date / 100000000000 < 1 ? date * 1000 : date;
  }

  let oDate = new Date(getDate);
  let Y = oDate.getFullYear();
  let M = to0(oDate.getMonth() + 1);
  let D = to0(oDate.getDate());
  let h = to0(oDate.getHours());
  let m = to0(oDate.getMinutes());
  let s = to0(oDate.getSeconds());

  let oMap = new Map([
    ["Y", Y],
    ["M", M],
    ["D", D],
    ["h", h],
    ["hm", `${h}:${m}`],
    ["hms", `${h}:${m}:${s}`],
    ["YM", `${Y}-${M}`],
    ["YMD", `${Y}-${M}-${D}`],
    ["YMDhms", `${Y}-${M}-${D} ${h}:${m}:${s}`],
    ["YMDhm", `${Y}-${M}-${D} ${h}:${m}`]
  ]);
  return oMap.get(format);
};

/**
 * 时间转时间戳
 */
exports.timeToStamp = time => {
  let newTime = time.replace(/-/g, "/");
  return new Date(newTime).getTime();
};

/**
 * 数组里对象删除相同元素
 * @param {array ,string, [object|string]}
 * arr需要去重的数组  key对象里需要对比的 键 名  obj要对比的对象或者字符串
 */
exports.rmSameObj = (arr, key, obj) => {
  let _obj = obj[key] ? obj[key] : obj;
  let _del = "";

  arr.forEach((v, i) => {
    if (v[key] == _obj) {
      _del = arr.splice(i, 1);
    }
  });
  return _del;
};

/**
 * 两点间计算距离（经纬坐标）
 * @param {String, String, String, String}
 */
exports.getDistance = (lat1, lng1, lat2, lng2) => {
  let getRad = d => {
    var PI = Math.PI;
    return (d * PI) / 180.0;
  };

  let f = getRad((lat1 * 1 + lat2 * 1) / 2);
  let g = getRad((lat1 * 1 - lat2 * 1) / 2);
  let l = getRad((lng1 * 1 - lng2 * 1) / 2);
  let sg = Math.sin(g);
  let sl = Math.sin(l);
  let sf = Math.sin(f);
  let s, c, w, r, d, h1, h2;
  let a = 6378137.0; //The Radius of eath in meter.
  let fl = 1 / 298.257;
  sg = sg * sg;
  sl = sl * sl;
  sf = sf * sf;
  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;
  w = Math.atan(Math.sqrt(s / c));
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3 * r - 1) / 2 / c;
  h2 = (3 * r + 1) / 2 / s;
  s = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
  s = Math.round(s); //指定小数点后的位数。
  return s;
};

/**
 * 首字母大写
 * @param { String } 英文单词
 */
exports.capitalize = ([first, ...r]) => first.toUpperCase() + r.join('');

/**
 * 时间戳转日期格式
 */
exports.timestamp2Date = (ts, format = '{Y}-{M}-{D}') => {
   let oDate = new Date(ts * 1000);
   let to0 = n => (n * 1 < 10 ? "0" + n : n);
   let setDate = {
     Y:oDate.getFullYear(),
     M:to0(oDate.getMonth() + 1),
     D:to0(oDate.getDate()),
     h:to0(oDate.getHours()),
     m:to0(oDate.getMinutes()),
     s:to0(oDate.getSeconds())
   }
   return format.replace(/{(Y|M|D|h|m|s)+}/g,(v,k)=>{
    return setDate[k]
  })
}

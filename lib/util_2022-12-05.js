const config = require("../config.json");
const fs = require("fs");
const cookie = require("cookie");
function writeSuccess(ret, res) {
  try {
    res.statusCode = 200;
    if (typeof ret == "object") {
      res.setHeader("Content-type", "application/json; charset=UTF-8");
      res.end(JSON.stringify(ret));
    } else {
      res.setHeader("Content-type", "text/html; charset=UTF-8");
      res.end(ret);
    }
  } catch (error) {
    writeWithStatus(400, { result: false, description: error.message }, res);
  }
}

function writeError(ret, res) {
  res.statusCode = 500;
  if (typeof ret == "object") {
    res.setHeader("Content-type", "application/json; charset=UTF-8");
    res.end(JSON.stringify(ret));
  } else {
    res.setHeader("Content-type", "text/html; charset=UTF-8");
    res.end(ret);
  }
}

function writeWithStatus(statusCode, ret, res) {
  res.statusCode = statusCode;
  if (typeof ret == "object") {
    res.setHeader("Content-type", "application/json; charset=UTF-8");
    res.end(JSON.stringify(ret));
  } else {
    res.setHeader("Content-type", "text/html; charset=UTF-8");
    res.end(ret);
  }
}

function writeWithContentType(ret, res, contentType) {
  res.statusCode = 200;
  if (typeof ret == "object") {
    res.setHeader("Content-type", contentType);
    res.end(JSON.stringify(ret));
  } else {
    res.setHeader("Content-type", contentType);
    res.end(ret);
  }
}

var msgbox = function (param) {
  console.log(param);
};
var msgbox2 = function (param1, param2, param3, param4, param5) {
  if (config.debugging) {
    if (param5) {
      console.log(param1, param2, param3, param4, param5);
    } else if (param4) {
      console.log(param1, param2, param3, param4);
    } else if (param3) {
      console.log(param1, param2, param3);
    } else if (param2) {
      console.log(param1, param2);
    } else {
      console.log(param1);
    }
  }
};

var msgfile = function (fileName, contents) {
  //if (config.debugging) {
  var fullDir = __dirname.replace(/\\/gi, "/");
  var filePath = strLeft(fullDir, "/lib");
  if (!fs.existsSync(filePath + "/logs")) {
    fs.mkdirSync(filePath + "/logs", { recursive: true });
  }
  filePath += "/logs/" + fileName;
  msgbox2("로그기록=>", filePath);
  fs.writeFile(filePath, contents, "utf8", function (error) {
    if (error) return console.log(error);
  });
  //}
};

var msgfile2 = function (fileName, contents) {
  if (config.debugging) {
    var fullDir = __dirname.replace(/\\/gi, "/");
    var filePath = strLeft(fullDir, "/lib");
    if (!fs.existsSync(filePath + "/logs")) {
      fs.mkdirSync(filePath + "/logs", { recursive: true });
    }
    filePath += "/logs/" + fileName;
    msgbox2("로그기록=>", filePath);
    fs.writeFile(filePath, contents, "utf8", function (error) {
      if (error) return console.log(error);
    });
  }
};

var format = function (number, formatStr) {
  return new Intl.NumberFormat("en-IN", {
    maximumSignificantDigits: 3,
  }).format(number);
};

var getTimeStampNoSepa = function () {
  var d = new Date();

  var s = leadingZeros(d.getHours(), 2) + leadingZeros(d.getMinutes(), 2) + leadingZeros(d.getSeconds(), 2) + leadingZeros(d.getMilliseconds(), 3) + "";

  return s;
};

var leadingZeros = function (n, digits) {
  var zero = "";
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++) zero += "0";
  }
  return zero + n;
};
var getTimeStamp = function () {
  var d = new Date();

  var s = leadingZeros(d.getHours(), 2) + ":" + leadingZeros(d.getMinutes(), 2) + ":" + leadingZeros(d.getSeconds(), 2) + "." + leadingZeros(d.getMilliseconds(), 3) + " ";

  return s;
};

function getCookie(qObj) {
  var cookies = cookie.parse(qObj["cookie"]);
  return cookies;
}

//===========================[String control Function]===================//
var URLQueryString = function (sSource, sSeparator1) {
  var sRight = "";
  var sLeft = "";
  var sReturn = "";
  //var specialChars = '`~!@#$%^*()_+-{}[]|\':";<>?,/';
  var arr = sSource.split("&");
  var foundKey = false;
  var tmpKey;
  var arrChar = [];
  arrChar.push("~");
  arrChar.push("`");
  arrChar.push("!");
  arrChar.push("@");
  arrChar.push("#");
  arrChar.push("$");
  arrChar.push("%");
  arrChar.push("^");
  arrChar.push("*");
  arrChar.push("(");
  arrChar.push(")");
  arrChar.push("-");
  arrChar.push("+");
  arrChar.push("{");
  arrChar.push("}");
  arrChar.push("[");
  arrChar.push("]");
  arrChar.push(":");
  arrChar.push(";");
  arrChar.push('"');
  arrChar.push("'");
  arrChar.push("<");
  arrChar.push(">");
  arrChar.push(",");
  arrChar.push("?");
  arrChar.push("/");
  var foundSpecialChar = false;
  // x=1&y=2&z=3 => [0] x=1 [1] y=2 [2] z=3
  for (var index = 0; index < arr.length; index++) {
    if (foundKey) {
      if (arr[index].indexOf("=") > 0) {
        tmpKey = strLeft(arr[index], "=");
        foundSpecialChar = false;
        for (var idx = 0; idx < arrChar.length; idx++) {
          if (tmpKey.indexOf(arrChar[idx]) != -1) {
            foundSpecialChar = true;
            break;
          }
        }
        if (foundSpecialChar) {
          sReturn += "&" + arr[index];
        } else {
          break;
        }
      } else {
        sReturn += "&" + arr[index];
      }
    }
    if (arr[index].toLowerCase().indexOf(sSeparator1.toLowerCase() + "=") == 0) {
      foundKey = true;
      sReturn = strRight(arr[index], "=");
    }
    if (index >= arr.length - 1) {
      break;
    }
  }
  return sReturn;
};

var strLeft = function (str, sKey, ContainsKey) {
  if (!ContainsKey) ContainsKey = false;

  var nIndex;
  var sRet = "";

  nIndex = str.indexOf(sKey);

  if (nIndex != -1) {
    sRet = str.substr(0, nIndex);
    if (ContainsKey) sRet += sKey;
  }
  return sRet;
};

var strLeftBack = function (str, sKey, ContainsKey) {
  if (!ContainsKey) ContainsKey = false;

  var nIndex;
  var sRet = "";

  nIndex = str.lastIndexOf(sKey);
  if (nIndex != -1) {
    sRet = str.substr(0, nIndex);
    if (ContainsKey) sRet += sKey;
  }
  return sRet;
};

var strRight = function (str, sKey, ContainsKey) {
  if (!ContainsKey) ContainsKey = false;

  var nIndex;
  var sRet = "";
  nIndex = str.indexOf(sKey);
  if (nIndex != -1) {
    if (ContainsKey) {
      sRet = str.substr(nIndex, str.length);
    } else {
      sRet = str.substr(nIndex + sKey.length, str.length);
    }
  }
  return sRet;
};

var strRightBack = function (str, sKey, ContainsKey) {
  if (!ContainsKey) ContainsKey = false;

  var nIndex;
  var sRet = "";

  nIndex = str.lastIndexOf(sKey);
  if (nIndex != -1) {
    if (ContainsKey) {
      sRet = str.substr(nIndex, str.length);
    } else {
      sRet = str.substr(nIndex + sKey.length, str.length);
    }
  }
  return sRet;
};

var strMid = function (str, sKey1, sKey2, ContainsLeftKey, ContainsRightKey) {
  if (!ContainsLeftKey) ContainsLeftKey = false;
  if (!ContainsRightKey) ContainsRightKey = false;

  var sRight, sLeft;
  var sRet = "";

  sRight = strRight(str, sKey1);
  if (typeof sKey2 == "undefined" || typeof sKey2 == undefined || sKey2 == null) {
    console.log("strMid::second key is undefined!");
    sLeft = "";
  } else {
    sLeft = strLeft(sRight, sKey2);
  }
  if (sLeft != "") {
    sRet = sLeft;
    //좌측 검색어를 포함하는 경우
    if (ContainsLeftKey) {
      sRet = sKey1 + sLeft;
    }
    //우측 검색어를 포함하는 경우
    if (ContainsRightKey) {
      sRet += sKey2;
    }
  } else {
    //두번째 키가 없으면 첫번째 키로부터 끝까지
    sRet = sRight;
  }

  return sRet;
};

var isDatetime = function (d) {
  var re = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/;
  //         yyyy -       MM      -       dd           hh     :   mm  :   ss
  return re.test(d);
};

//GMT시간을 현재시간으로 convert
var getLocaleDateTimeString = function (year, month, day, h, M, s) {
  var ret = "";
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var nMonth;
  //IE 5.0 patch
  if (month.indexOf("0") == 0) {
    //01,02.....09까지의 앞 '0'을 제거해야 함
    nMonth = parseInt(month.replace(/0/gi, "")) - 1;
  } else {
    nMonth = parseInt(month) - 1;
  }
  var monthName = monthNames[nMonth];
  var timeStr = h + ":" + M + ":" + s;
  var serverTime = new Date(Date.parse(day + " " + monthName + " " + year + " " + timeStr + " UTC"));

  var offset = new Date().getTimezoneOffset();
  var offsetFromGMT = (offset / 60) * -1 + "";

  var tzDigit = offsetFromGMT;
  var sign = "+";
  if (tzDigit.indexOf("-") != -1) {
    sign = "-";
  }

  tzDigit = tzDigit.replace(sign, ""); //-9 -> 9
  tzDigit = (tzDigit > 9 ? "" : "0") + tzDigit; //9 -> 09
  tzDigit = "00" + sign + tzDigit; // 09 -> 00+09 or 00-09

  //20200205T235503 변환
  var mm = serverTime.getMonth() + 1;
  var dd = serverTime.getDate();
  var ymd = [serverTime.getFullYear(), (mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd].join("");

  var hh = serverTime.getHours();
  var min = serverTime.getMinutes();
  var sec = serverTime.getSeconds();
  var hms = [(hh > 9 ? "" : "0") + hh, (min > 9 ? "" : "0") + min, (sec > 9 ? "" : "0") + sec].join("");
  var ret = ymd + "T" + hms + "," + tzDigit;

  return ret;
};

var getRandom = function () {
  var rnd = Math.random();
  var ret = "";
  ret = rnd + "";

  ret = ret.replace(/0./g, "");

  return ret;
};

var base64encode = function (obj) {
  var plaintext = obj;
  if (typeof plaintext == "object") {
    plaintext = JSON.stringify(obj);
  }
  return Buffer.from(plaintext, "utf8").toString("base64");
};

var base64decode = function (text) {
  return Buffer.from(text, "base64").toString("utf8");
};

var fileToBase64String = function (file) {
  //파일을 읽어서 내용을 base64로 변경
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString("base64");
};

var base64StringToFile = function (encodedCont, path, fileName) {
  //콘텐를 디코딩하여 파일에 쓰기
  var bitmap = new Buffer(base64str, "base64");
  // write buffer to file
  var file = path + "/" + fileName;
  fs.writeFileSync(file, bitmap);
};
function isUndefined(name) {
  if (typeof name == undefined || typeof name == "undefined" || name == "undefined" || name == null) {
    return true;
  } else {
    return false;
  }
}

function isEmpty(name) {
  // if (typeof name == undefined || typeof name == "undefined" || ((name == null) == name) == "") { // 원본
  if (typeof name == undefined || typeof name == "undefined" || name == null || name == "null" || name == "" || name == undefined || name == "undefined") {
    // 수정
    return true;
  } else {
    return false;
  }
}

function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}
//===========================[String control Function]===================//
module.exports = {
  msgbox,
  msgbox2,
  msgfile,
  msgfile2,
  writeSuccess,
  writeError,
  writeWithStatus,
  writeWithContentType,
  format,
  getTimeStampNoSepa,
  leadingZeros,
  getTimeStamp,
  getCookie,
  URLQueryString,
  strLeft,
  strLeftBack,
  strRight,
  strRightBack,
  strMid,
  isDatetime,
  getLocaleDateTimeString,
  getRandom,
  base64encode,
  base64decode,
  fileToBase64String,
  base64StringToFile,
  isUndefined,
  isEmpty,
  replaceAll,
};

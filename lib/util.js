const config = require("../config.json");
const fs = require("fs");
const cookie = require("cookie");
const axios = require("axios");

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
    console.error(new Date(), JSON.stringify(ret));
    res.setHeader("Content-type", "application/json; charset=UTF-8");
    res.end(JSON.stringify(ret));
  } else {
    console.error(new Date(), ret);
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
  try {
    res.statusCode = 200;
    if (typeof ret == "object") {
      res.setHeader("Content-type", contentType);
      res.end(JSON.stringify(ret));
    } else {
      res.setHeader("Content-type", contentType);
      res.end(ret);
    }
  } catch (error) {
    writeWithStatus(400, { result: false, description: error.message }, res);
  }
}

function isUndefined(name) {
  var ret = true;
  if (
    name == undefined ||
    typeof name == "undefined" ||
    name == "undefined" ||
    name == null ||
    name == ""
  ) {
    if (name == "") {
      if (IsNumeric(name)) {
        ret = false;
      }
    }
  } else {
    ret = false;
  }

  return ret;
}

function isEmpty(name) {
  // if (typeof name == undefined || typeof name == "undefined" || ((name == null) == name) == "") { // 원본
  if (
    typeof name == undefined ||
    typeof name == "undefined" ||
    name == null ||
    name == "null" ||
    name == "" ||
    name == undefined ||
    name == "undefined"
  ) {
    // 수정
    return true;
  } else {
    return false;
  }
}

function isEmptyObj(obj) {
  var ret = false;
  try {
    if (obj.constructor === Object && Object.keys(obj).length === 0) {
      ret = true;
    }
  } catch (e) {
    ret = true;
  }
  return ret;
}

function setDebug(qObj) {
  if (!isUndefined(qObj.debug)) {
    if (!IsNumeric(qObj.debug)) {
      qObj.debug = 1;
    }
  } else {
    if (!isUndefined(config.debugging_level)) {
      qObj.debug = config.debugging_level;
    } else {
      qObj.debug = 1;
    }
  }

  return qObj;
}

function getDir(qObj) {
  dirname = qObj.dirname;
  var dirPath = dirname + "/output";
  var hasDir = false;
  try {
    dirPath = qObj.outputdirpath;
    if (isUndefined(dirPath)) {
    } else {
      hasDir = true;
    }
  } catch (e) {
    dirPath = dirname + "/output";
  }

  if (hasDir) {
  } else {
    dirPath = dirname + "/output";
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    var date = new Date();
    var year = date.getFullYear();
    dirPath = dirPath + "/" + year;
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    var month = date.getMonth() + 1;
    month = (month > 9 ? "" : "0") + month;
    dirPath = dirPath + "/" + month;
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    var day = date.getDate();
    day = (day > 9 ? "" : "0") + day;
    dirPath = dirPath + "/" + day;
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    var hour = date.getHours();
    hour = (hour > 9 ? "" : "0") + hour;
    dirPath = dirPath + "/" + hour;
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  }
  return dirPath;
}

function getLanguageCode(req, qObj) {
  var ret = "ko";
  try {
    var langArr = ["DWP_LANG", "language"];
    var language = qObj.language;
    if (isUndefined(language)) {
      var lang = "";
      var cookies = req.headers.cookie;
      var languageArr = cookies.split(";");
      for (i = 0; i < languageArr.length; i++) {
        var cookie = languageArr[i].trim();
        var cookie2 = cookie.split("=");
        for (var x = 0; x < cookie2.length; x++) {
          for (var y = 0; y < langArr.length; y++) {
            if (cookie2[0].trim().toLowerCase() == langArr[y].toLowerCase()) {
              language = cookie2[1];
              break;
            }
          }
          if (!isUndefined(language)) break;
        }
        if (!isUndefined(language)) break;
      }
    }
  } catch (e) {}
  if (isUndefined(language)) language = "ko";
  ret = language;

  return ret;
}

//첨부파일
function writeAttachSuccess(ret, res, fileName, fileSize) {
  console.log(ret);
  res.setHeader("Content-type", "application/x-download;");
  res.setHeader("Content-Encoding", "gzip");
  res.setHeader("Content-Disposition", "attachment;filename=" + fileName + "");
  // res.setHeader("Content-Length", fileSize);

  res.end(ret);
}

var msgbox = function (...params) {
  console.log(getTimeStamp() + " ", ...params);
};

var msgbox2 = function (debugging_level, request_level, ...params) {
  if (config.debugging) {
    if (!isUndefined(debugging_level)) {
      if (IsNumeric(debugging_level)) {
        msgbox(...params);
      } else {
        msgbox(debugging_level, request_level ?? "", ...params);
      }
    }
  } else {
    if (!isUndefined(debugging_level)) {
      if (IsNumeric(debugging_level)) {
        if (IsNumeric(request_level)) {
          if (debugging_level <= request_level) {
            msgbox(...params);
          }
        }
      } else {
        if (config.debugging_level >= 2) {
          msgbox(debugging_level, request_level ?? "", ...params);
        }
      }
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
  //msgbox2("로그기록=>", filePath);
  console.log("로그기록=>", filePath);

  fs.writeFile(filePath, contents, "utf8", function (error) {
    if (error) return console.log(error);
  });
  //}
};

var msgfile2 = function (debugging_level, request_level, fileName, contents) {
  if (config.debugging) {
    if (!isUndefined(debugging_level)) {
      if (IsNumeric(debugging_level)) {
        msgfile(fileName, contents);
      } else {
        msgfile(debugging_level, request_level);
      }
    }
  } else {
    if (!isUndefined(request_level)) {
      if (IsNumeric(request_level)) {
        if (IsNumeric(debugging_level)) {
          if (debugging_level <= request_level) {
            msgfile(fileName, contents);
          }
        }
      }
    }
  }
};

var format = function (number, formatStr) {
  return new Intl.NumberFormat("en-IN", {
    maximumSignificantDigits: 3,
  }).format(number);
};

var getTimeStampNoSepa = function () {
  var d = new Date();

  var s =
    leadingZeros(d.getHours(), 2) +
    leadingZeros(d.getMinutes(), 2) +
    leadingZeros(d.getSeconds(), 2) +
    leadingZeros(d.getMilliseconds(), 3) +
    "";

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

  var s =
    leadingZeros(d.getHours(), 2) +
    ":" +
    leadingZeros(d.getMinutes(), 2) +
    ":" +
    leadingZeros(d.getSeconds(), 2) +
    "." +
    leadingZeros(d.getMilliseconds(), 3) +
    " ";

  return s;
};

function getCookie(qObj) {
  var cookies = cookie.parse(qObj["cookie"]);
  return cookies;
}

// OS의 따른 상대경로 구분자 값 추출
function getPathSeparator() {
  var myGlobals = { isWin: false, isOsX: false, isNix: false };
  if (/^win/.test(process.platform)) {
    myGlobals.isWin = true;
  } else if (process.platform === "darwin") {
    myGlobals.isOsX = true;
  } else if (process.platform === "linux") {
    myGlobals.isNix = true;
  }
  if (myGlobals.isWin) {
    return "\\";
  } else if (myGlobals.isOsx || myGlobals.isNix) {
    return "/";
  }

  // default to *nix system.
  return "/";
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
    if (
      arr[index].toLowerCase().indexOf(sSeparator1.toLowerCase() + "=") == 0
    ) {
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
  if (
    typeof sKey2 == "undefined" ||
    typeof sKey2 == undefined ||
    sKey2 == null
  ) {
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
  var re =
    /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/;
  //         yyyy -       MM      -       dd           hh     :   mm  :   ss
  return re.test(d);
};

//GMT시간을 현재시간으로 convert
var getLocaleDateTimeString = function (year, month, day, h, M, s) {
  var ret = "";
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
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
  var serverTime = new Date(
    Date.parse(day + " " + monthName + " " + year + " " + timeStr + " UTC")
  );

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
  var ymd = [
    serverTime.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("");

  var hh = serverTime.getHours();
  var min = serverTime.getMinutes();
  var sec = serverTime.getSeconds();
  var hms = [
    (hh > 9 ? "" : "0") + hh,
    (min > 9 ? "" : "0") + min,
    (sec > 9 ? "" : "0") + sec,
  ].join("");
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

function IsNumeric(data) {
  return parseFloat(data) == data;
}

function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}

function getProperCase(str) {
  return str
    .split(" ")
    .map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(" ");
}

function getElasticAuthorization() {
  var ret = "";
  try {
    const auth =
      config.org.elasticsearchId + ":" + config.org.elasticsearchPassword;
    ret = Buffer.from(auth, "utf8").toString("base64");
  } catch (error) {
    console.log(error.message);
  }

  return ret;
}
//===========================[String control Function]===================//
//===========================[DataBase control Function]===================//
const refreshElasticSearch = function (url, auth) {
  // url => http://203.231.40.21:19200/vapprocomplete
  // auth => elasticsearch Basic auth string(like 'Basic base64String')
  if (
    isUndefined(url) ||
    url == "undefined" ||
    isUndefined(auth) ||
    auth == "undefined"
  ) {
    return false;
  }
  const options = {
    url: `${url}/_refresh`,
    method: "GET",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  };
  return axios(options)
    .then(({ data: { _shards: result } }) => {
      if (result.total === result.successful) {
        msgbox2("\x1b[32m%s\x1b[0m", "ElasticSearch Refresh Successful");
        return true;
      } else {
        msgbox2(
          "\x1b[33m%s\x1b[0m",
          `Function refreshElasticSearch Elasticsearch Refresh 실패!!! 총 ${result.total}건 중\n 성공: ${result.successful}, 실패: ${result.failed}`
        );
        return false;
      }
    })
    .catch(error => {
      console.error(
        "\x1b[31m%s\x1b[0m",
        `Function refreshElasticSearch Error => ${error.message}`
      );
      throw error;
    });
};
//===========================[DataBase control Function]===================//

const getTree = async (qObj, cb) => {
  msgbox2("### util.getTree : start");
  try {
    var code = qObj["code"];
    if (typeof code == "undefined" || code == null || code == "") {
      code = "_ROOT_";
    }
    var url = config.systems.gw.protocol + "://";
    url = url + config.systems.gw.server;
    // url = url + "/" + config.systems.gw.commondb.org;
    url = url + config.apps.gw.approval.api.write.orgList;
    url = url.replace(/#code#/, code);
    url = url.replace(/#comalias#/, qObj.userInfo.comalias);

    msgbox2("### getTree url : ", url);
    axios({
      method: "get",
      url: url,
      headers: {
        Cookie: qObj["cookie"],
      },
    })
      .then(response => {
        var data = response.data;
        drawTreeData(cb, qObj, data);
      })
      .catch(error => {
        cb(error, null);
        return;
      });
  } catch (error) {
    console.error(error);
    cb(error, null);
    return;
  }
};

const drawTreeData = async (cb, qObj, entries) => {
  msgbox2("### util.drawTreeData : start");
  var ret = {};
  try {
    let language = qObj.language;
    var datas = [];
    for (var entryIndex in entries) {
      var entryObj = entries[entryIndex];
      var _iscontainschild = false;
      var tmpObj = {};
      var _jsoninfo = entryObj["_jsoninfo"];
      // var _jsoninfo = JSON.parse(entryObj["_jsoninfo"].replace(/\\/gi, "/"));

      tmpObj["id"] = _jsoninfo["orgcode"];
      tmpObj["pid"] = _jsoninfo["porgcode"];
      tmpObj["title"] = getLangStr2(_jsoninfo["orgname"], language);
      tmpObj["comcode"] = _jsoninfo["comcode"];
      tmpObj["comalias"] = _jsoninfo["comalias"];
      tmpObj["orgname"] = getLangStr2(_jsoninfo["orgname"], language);
      tmpObj["orgcode"] = _jsoninfo["orgcode"];
      tmpObj["porgname"] = getLangStr2(_jsoninfo["porgname"], language);
      tmpObj["porgcode"] = _jsoninfo["porgcode"];
      tmpObj["fullorginfo"] = entryObj["_fullorginfo"];

      if (entryObj["_iscontainschild"] == "1") _iscontainschild = true;
      tmpObj["isChild"] = _iscontainschild;
      tmpObj["type"] = entryObj["_type"];

      let appConfig = eval(`config.apps.${qObj.namespace}.${qObj.command}`);

      if (entryObj["_type"].toLowerCase() == "s") {
        // 사용자정보에 폰번호 정보 추가함 20230126 by shin min jae
        tmpObj["mobileno"] = _jsoninfo["mobileno"];
        tmpObj["id"] = _jsoninfo["notesid"];
        tmpObj["pid"] = _jsoninfo["orgcode"];
        //직위:선임 , 직책:팀장.팀원 , 직급:S3
        //displayType : 1 ---> 팀원 신민재 or 2 ---> 선임 신민재
        let displayType = appConfig.orgchart.displayTitleType;

        if (
          typeof displayType == "undefined" ||
          displayType == null ||
          displayType == ""
        ) {
          displayType = "1";
        }

        let jobTitle = getLangStr2(_jsoninfo["dutyname"], language);
        if (displayType != "1") {
          jobTitle = getLangStr2(_jsoninfo["posname"], language);
        }

        tmpObj["title"] =
          getLangStr2(_jsoninfo["name"], language) + " " + jobTitle;
        //사번
        tmpObj["empno"] = _jsoninfo["empno"];
        //직책
        tmpObj["posname"] = getLangStr2(_jsoninfo["posname"], language);
        //직책
        tmpObj["dutyname"] = getLangStr2(_jsoninfo["dutyname"], language);

        tmpObj["fullorginfoObject"] = setFullorginfoObj(
          tmpObj["fullorginfo"],
          "person"
        );
      } else if (entryObj["_type"].toLowerCase() == "b") {
        tmpObj["fullorginfoObject"] = setFullorginfoObj(
          tmpObj["fullorginfo"],
          "department"
        );
      }

      let customKeys = appConfig.orgchart.customKeys;
      if (Array.isArray(customKeys)) {
        for (let key of customKeys) {
          if (typeof key === "object") {
            tmpObj[key.field] = getLangStr2(entryObj[key.field], language);
          } else {
            tmpObj[key] = entryObj[key];
          }
        }
      }
      datas.push(tmpObj);
    }

    ret["result"] = true;
    ret["description"] = "";
    ret["data"] = datas;
    // writeSuccess(ret, res);
    cb(null, ret);
  } catch (error) {
    console.error(error);
    cb(error, null);
    return;
  }
};

const getLangStr2 = (value, lang, seperator = ",") => {
  if (isUndefined(value) || value == "undefined") {
    return value;
  }
  let returnValue = "";
  if (value.constructor === Object) {
    if (!isEmptyObj(value[lang])) {
      returnValue = value[lang];
    } else if (!isEmptyObj(value["ko"])) {
      returnValue = value["ko"];
    } else {
      returnValue = value;
    }
  } else if (value.constructor === String) {
    if (value.indexOf(seperator) !== -1) {
      let returnStr = "";
      for (let str of value.split(seperator)) {
        if (str.indexOf(`${lang}:`) !== -1) {
          returnStr = str.replace(`${lang}:`, "");
          break;
        }
      }
      if (returnStr !== "") {
        returnValue = returnStr;
      } else {
        for (let str of value.split(seperator)) {
          if (str.indexOf(`ko:`) !== -1) {
            returnStr = str.replace(`ko:`, "");
            break;
          }
        }
        if (returnStr !== "") {
          returnValue = returnStr;
        } else {
          returnValue = value;
        }
      }
    } else {
      if (value.indexOf(`${lang}:`) !== -1) {
        returnValue = value.replace(`${lang}:`, "");
      }
      if (value.indexOf(`ko:`) !== -1) {
        returnValue = value.replace(`ko:`, "");
      } else {
        returnValue = value;
      }
    }
  } else {
    returnValue = value;
  }
  if (returnValue !== "" && returnValue.indexOf("，") !== -1) {
    returnValue = returnValue.replace("，", ",");
  }

  return returnValue;
};

const getSearch = async (qObj, cb) => {
  msgbox2("### util.getSearch : start");
  try {
    var query = decodeURIComponent(qObj["query"]);
    if (typeof query == "undefined" || query == null || query == "") {
      // writeError({ result: false, description: "검색어를 입력해주세요." }, res);
      cb({ result: false, description: "검색어를 입력해주세요." }, null);
      return;
    }
    var type = qObj["type"];
    if (typeof type == "undefined" || type == null || type == "") {
      type = "0";
    }
    var url = config.systems.gw.protocol + "://";
    url = url + config.systems.gw.server;
    // url = url + "/" + config.systems.gw.commondb.org;
    url = url + config.apps.gw.approval.api.write.orgSearch;
    url = url.replace(/#query#/, encodeURIComponent(query));
    url = url.replace(/#type#/, type);
    url = url.replace(/#comalias#/, qObj.userInfo.comalias);
    msgbox2("### url : ", url);

    axios({
      method: "get",
      url: url,
      headers: {
        Cookie: qObj["cookie"],
      },
    })
      .then(response => {
        var data = response.data;
        drawSearchData(cb, qObj, data);
      })
      .catch(error => {
        cb(error, null);
        return;
      });
  } catch (error) {
    console.error(error);
    cb(error, null);
    return;
  }
};

const drawSearchData = async (cb, qObj, entry) => {
  msgbox2("### util.drawSearchData : start");
  var ret = {};
  try {
    var languageObj = getCookie(qObj);
    var language = qObj.language || languageObj["language"];
    var datas = [];

    // if (!entry["result"]) {
    //   // writeError({ result: false, description: "Redis Agnt Error.. -> dwp/com/sys/org_mn.nsf => SearchTreeByRedis Check.." }, res);
    //   cb({ result: false, description: "Redis Agnt Error.. -> dwp/com/sys/org_mn.nsf => SearchTreeByRedis Check.." }, null);
    // }
    // var status = entry["status"];
    // if (typeof status == undefined || typeof status == "undefined" || status == null || status == "") {
    //   // writeError({ result: false, description: "Redis Agnt Error.. -> dwp/com/sys/org_mn.nsf => SearchTreeByRedis Check.." }, res);
    //   cb({ result: false, description: "Redis Agnt Error.. -> dwp/com/sys/org_mn.nsf => SearchTreeByRedis Check.." }, null);
    // }

    var response = entry["response"];
    var orgArr = response["org"];
    var personArr = response["person"];

    let appConfig = eval(`config.apps.${qObj.namespace}.${qObj.command}`);

    // 조직도 검색 데이터 확인용
    // console.log(JSON.stringify(orgArr));
    // console.log(JSON.stringify(personArr));

    if (Array.isArray(orgArr)) {
      for (var index = 0; index < orgArr.length; index++) {
        // 부서
        var insertObj = {};
        var orgObj = orgArr[index];
        insertObj["id"] = orgObj["orgcode"];
        insertObj["orgcode"] = orgObj["orgcode"];
        insertObj["pid"] = orgObj["parorgcode"];
        insertObj["title"] = getLangStr2(orgObj["orgname"], language);
        // insertObj["title"] = getOrgLangValue(cb, qObj, orgObj["orgname"]);
        insertObj["comcode"] = orgObj["comcode"];
        insertObj["comalias"] = orgObj["comalias"];
        insertObj["type"] = "B";
        insertObj["orgname"] = getLangStr2(orgObj["orgname"], language);
        insertObj["parorgname"] = getLangStr2(orgObj["parorgname"], language);
        insertObj["fullorginfo"] = orgObj["_fullorginfo"];

        insertObj["fullorginfoObject"] = setFullorginfoObj(
          insertObj["fullorginfo"],
          "department"
        );
        let customKeys = appConfig.orgchart.customKeys;
        if (Array.isArray(customKeys)) {
          for (let key of customKeys) {
            if (typeof key === "object") {
              insertObj[key.field] = getLangStr2(orgObj[key.field], language);
            } else {
              insertObj[key] = orgObj[key];
            }
          }
        }

        datas.push(insertObj);
      }
    }

    if (Array.isArray(personArr)) {
      for (let index = 0; index < personArr.length; index++) {
        // 사람
        let insertObj = {};
        let orgObj = personArr[index];
        let notesuname = orgObj["notesuname"]; //CN=KIM.HYEONDAM/OU=ksis211022/O=klri
        let notesunameArr = notesuname.split("/"); //CN=KIM.HYEONDAM , OU=ksis211022 , O=klri
        notesuname = "";
        for (
          let notesIndex = 0;
          notesIndex < notesunameArr.length;
          notesIndex++
        ) {
          if (notesuname != "") notesuname = notesuname + "/";
          notesuname = notesuname + strRight(notesunameArr[notesIndex], "=");
        }

        insertObj["id"] = notesuname;
        insertObj["pid"] = orgObj["orgcode"];
        insertObj["orgcode"] = orgObj["orgcode"];
        //직위:선임 , 직책:팀장.팀원 , 직급:S3
        //displayType : 1 ---> 팀원 신민재 or 2 ---> 선임 신민재

        let displayType = appConfig.orgchart.displayTitleType;
        if (
          typeof displayType == "undefined" ||
          displayType == null ||
          displayType == ""
        ) {
          displayType = "1";
        }

        // var jobTitle = setObjectLanguage(orgObj["name1"]);
        var jobTitle = getLangStr2(orgObj["name2"], language);
        if (displayType != "1") {
          // jobTitle = setObjectLanguage(orgObj["name2"]);
          jobTitle = getLangStr2(orgObj["name1"], language);
        }

        insertObj["title"] =
          getLangStr2(orgObj["personname"], language) + " " + jobTitle;
        // insertObj["title"] = jobTitle + " " + orgObj["personname"];
        insertObj["personname"] = getLangStr2(orgObj["personname"], language);
        insertObj["comcode"] = orgObj["comcode"];
        insertObj["comalias"] = orgObj["comalias"];
        insertObj["type"] = "S";
        insertObj["empno"] = orgObj["personid"];
        insertObj["posname"] = getLangStr2(orgObj["name1"], language);
        insertObj["dutyname"] = getLangStr2(orgObj["name2"], language);
        insertObj["orgname"] = getLangStr2(orgObj["orgname"], language);
        insertObj["parorgname"] = getLangStr2(orgObj["parorgname"], language);
        insertObj["fullorginfo"] = orgObj["_fullorginfo"];
        insertObj["mobileno"] = orgObj["mobileno"];

        insertObj["fullorginfoObject"] = setFullorginfoObj(
          insertObj["fullorginfo"],
          "person"
        );
        let customKeys = appConfig.orgchart.customKeys;
        if (Array.isArray(customKeys)) {
          for (let key of customKeys) {
            if (typeof key === "object") {
              insertObj[key.field] = getLangStr2(orgObj[key.field], language);
            } else {
              insertObj[key] = orgObj[key];
            }
          }
        }
        datas.push(insertObj);
      }
    }

    ret["result"] = true;
    ret["description"] = "";
    ret["data"] = datas;
    // writeSuccess(ret, res);
    cb(null, ret);
  } catch (error) {
    console.error(error);
    cb(error, null);
    return;
  }
};

const setFullorginfoObj = (fullorginfo, type) => {
  let fullorginfoArr = fullorginfo.split("^");
  let fullorginfoKeys = config.apps.util.fullorginfo[type];

  let fullorginfoObject = {};

  if (fullorginfoArr.length === fullorginfoKeys.length) {
    for (let index = 0; index < fullorginfoArr.length; index++) {
      let key = fullorginfoKeys[index];
      if (key === "") {
        continue;
      }
      let value = fullorginfoArr[index];
      if (value.includes(",") && value.includes(":")) {
        let values = value.split(",");
        let valueObj = {};
        values.forEach(v => {
          let [splitKey, splitValue] = v.split(":");
          valueObj[splitKey] = splitValue;
        });
        value = valueObj;
      } else if (value.includes(",")) {
        value = value.split(",");
      }
      fullorginfoObject[key] = value;
    }
  }

  return fullorginfoObject;
};

const getDocJson = str => {
  if (str.indexOf("<DOC_JSON>") !== -1) {
    let tmp = str.split("<DOC_JSON>")[1];
    tmp = tmp.split("</DOC_JSON>")[0];
    tmp = tmp.replace(/\\|\n|\t/gi, "");

    // 파일 다운로드
    // util.msgfile("doc_son.txt", tmp);

    try {
      tmp = tmp.replace(/,}/gi, "}");
      return JSON.parse(tmp);
    } catch (error) {
      return str;
    }
  } else {
    return str;
  }
};
function IsResultSuccess(str) {
  try {
    let jsonData = JSON.parse(str);
    if (jsonData.result === "200") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

const sumObject = Objarr => {
  let sum = { info: {}, fields: {} };
  if (typeof Objarr === "object" && !Array.isArray(Objarr)) {
    return Objarr;
  }
  for (let num1 in Objarr) {
    for (let num2 in Objarr[num1]) {
      for (let num3 in Objarr[num1][num2]) {
        sum[num2][num3] = Objarr[num1][num2][num3];
      }
    }
  }
  return sum;
};

function setLanguage(lang, str, Separator1, Separator2) {
  let arr = str.split(Separator1);

  for (let i in arr) {
    if (arr[i].trim().split(Separator2)[0] === lang) {
      return arr[i].split(Separator2)[1];
    }
  }

  return "";
}

const getUserInfo = async (req, res, qObj, cb) => {
  try {
    if (qObj.url) {
      getDataFromURL(req, res, qObj, cb);
      return;
    }
    let url = config.systems.gw.protocol + "://";
    url += config.systems.gw.server;
    url += `/dwp/com/sys/org_mn.nsf/api/data/collections/name/wviwbyempnoall?ps=10&category=#empno#`;
    url = url.replace(/#empno#/gi, qObj.empno);

    msgbox2("### URL => ", url);
    let { data } = await axios({
      method: "get",
      url: url,
      headers: {
        Cookie: qObj["cookie"],
      },
    });

    msgbox2("### data => ", data);

    if (!data || !data[0]) {
      cb("유효한 사용자가 아닙니다.", null);
      return;
    }

    qObj.info = data;

    drawUserInfo(req, res, qObj, cb);
  } catch (error) {
    console.error(error);
    cb(error, null);
  }
};

const drawUserInfo = (req, res, qObj, cb) => {
  try {
    let result = {};
    if (Object.keys(qObj.info[0]).includes("_jsoninfo")) {
      result.userInfo = JSON.parse(qObj.info[0]["_jsoninfo"]);
      result.url = qObj.info[0]["@link"]["href"];

      let language = "";
      try {
        let lang = "";
        let cArr = qObj.cookie.split(";");
        for (let i in cArr) {
          if (cArr[i].trim().split("=")[0] === "language") {
            lang = cArr[i].trim().split("=")[1];
          }
        }
        language = lang;
      } catch (error) {
        language = "ko";
      }

      // this.langcode = this.userInfo.langcode;
      result.langcode = language;

      cb(null, { result: true, data: result });
    }
  } catch (error) {
    console.error(error);
    cb(error, null);
  }
};

const getDataFromURL = async (req, res, qObj, cb) => {
  try {
    let url =
      config.systems.gw.protocol +
      "://" +
      config.systems.gw.server +
      "/" +
      qObj.url;
    msgbox2("### URL => ", url);
    let response = await axios({
      method: "get",
      url: url,
      headers: {
        Cookie: qObj["cookie"],
      },
    });

    let data = response.data;

    msgbox2("### data => ", response);

    if (!data) {
      cb("유효한 URL이 아닙니다.", null);
      return;
    }

    cb(null, { result: true, data });
  } catch (error) {
    console.error(error);
    cb(error, null);
  }
};

const delay = (time = 1000) => {
  return new Promise(resolve => setTimeout(resolve, time));
};

module.exports = {
  delay,
  msgbox,
  msgbox2,
  msgfile,
  msgfile2,
  writeSuccess,
  writeAttachSuccess,
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
  getDir,
  getLanguageCode,
  IsNumeric,
  isEmptyObj,
  replaceAll,
  getProperCase,
  getPathSeparator,
  getElasticAuthorization,
  setDebug,
  isEmpty,
  refreshElasticSearch,
  getTree,
  getSearch,
  getDocJson,
  IsResultSuccess,
  sumObject,
  setFullorginfoObj,
  getLangStr2,
  getUserInfo,
  setLanguage,
  getDataFromURL,
};

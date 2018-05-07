const io = require('socket.io-client');
const http = require('https');
const url = require('url');

if (global.window == null) {
  global.window = {
    addEventListener: function() {}
  };
}

if (global.localStorage == null) {
  global.localStorage = {
    getItem: function() {},
    setItem: function() {}
  };
}

'use strict';

var MDSCommon = {
  BASE32: '0123456789bcdefghjkmnpqrstuvwxyz',

  primitiveTypes: [
    'number',
    'string',
    'boolean',
    'undefined',
    'function'
  ],

  md5: function (string) {

    function RotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
      var lX4, lY4, lX8, lY8, lResult;
      lX8 = (lX & 0x80000000);
      lY8 = (lY & 0x80000000);
      lX4 = (lX & 0x40000000);
      lY4 = (lY & 0x40000000);
      lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
      if (lX4 & lY4) {
        return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        } else {
          return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        }
      } else {
        return (lResult ^ lX8 ^ lY8);
      }
    }

    function F(x, y, z) {
      return (x & y) | ((~x) & z);
    }

    function G(x, y, z) {
      return (x & z) | (y & (~z));
    }

    function H(x, y, z) {
      return (x ^ y ^ z);
    }

    function I(x, y, z) {
      return (y ^ (x | (~z)));
    }

    function FF(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
      a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
      return AddUnsigned(RotateLeft(a, s), b);
    }

    function ConvertToWordArray(string) {
      var lWordCount;
      var lMessageLength = string.length;
      var lNumberOfWords_temp1 = lMessageLength + 8;
      var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      var lWordArray = Array(lNumberOfWords - 1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    };

    function WordToHex(lValue) {
      var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValue_temp = "0" + lByte.toString(16);
        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
      }
      return WordToHexValue;
    }

    function Utf8Encode(string) {
      string = string.replace(/\r\n/g, "\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
          utftext += String.fromCharCode(c);
        }
        else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }

      }

      return utftext;
    };

    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = Utf8Encode(string);

    x = ConvertToWordArray(string);

    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
      AA = a;
      BB = b;
      CC = c;
      DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
      b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
      a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
      c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
      c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
      a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
      a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
      a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
      a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
      c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
      c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
      b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
      c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
      d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
      c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
      a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
      d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
      b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
      a = AddUnsigned(a, AA);
      b = AddUnsigned(b, BB);
      c = AddUnsigned(c, CC);
      d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

    return temp.toLowerCase();
  },

  findIndex: function (arr, predicate) {
    if (!Array.isArray(arr)) {
      throw new Error('Parameter arr must be array');
    }
    if (typeof predicate !== 'function') {
      throw new Error('Parameter predicate must be function');
    }
    for (var i in arr) {
      if (predicate(arr[i])) {
        return i;
      }
    }
    return -1;
  },

  find: function (arr, predicate) {
    var i = MDSCommon.findIndex(arr, predicate);
    return i === -1 ? undefined : arr[i];
  },

  toQuery: function(obj) {
    var ret = '';
    for (var k in obj) {
      if (ret === '') {
        ret = '?';
      } else {
        ret += '&';
      }
      ret += k + '=' + encodeURIComponent(obj[k]);
    }
    return ret;
  },

  parseQuery: function (queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&').filter(function (part) {
      return part !== '';
    });
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
  },

  endsWith: function (str, str2) {
    var i = str.indexOf(str2);
    if (i === -1) {
      return false;
    }
    return i === str.length - str2.length;
  },

  delay: function (milliseconds) {
    return new Promise(function (resolve) {
      if (milliseconds < 0) {
        resolve();
      } else {
        setTimeout(resolve, milliseconds);
      }
    });
  },

  refine_interval: function (interval, cd, mask) {
    if (cd & mask)
      interval[0] = (interval[0] + interval[1]) / 2;
    else
      interval[1] = (interval[0] + interval[1]) / 2;
  },

  calculateAdjacent: function (srcHash, dir) {
    var NEIGHBORS = {
      right: {even: "bc01fg45238967deuvhjyznpkmstqrwx"},
      left: {even: "238967debc01fg45kmstqrwxuvhjyznp"},
      top: {even: "p0r21436x8zb9dcf5h7kjnmqesgutwvy"},
      bottom: {even: "14365h7k9dcfesgujnmqp0r2twvyx8zb"}
    };

    NEIGHBORS.bottom.odd = NEIGHBORS.left.even;
    NEIGHBORS.top.odd = NEIGHBORS.right.even;
    NEIGHBORS.left.odd = NEIGHBORS.bottom.even;
    NEIGHBORS.right.odd = NEIGHBORS.top.even;


    var BORDERS = {
      right: {even: "bcfguvyz"},
      left: {even: "0145hjnp"},
      top: {even: "prxz"},
      bottom: {even: "028b"}
    };

    BORDERS.bottom.odd = BORDERS.left.even;
    BORDERS.top.odd = BORDERS.right.even;
    BORDERS.left.odd = BORDERS.bottom.even;
    BORDERS.right.odd = BORDERS.top.even;


    srcHash = srcHash.toLowerCase();
    var lastChr = srcHash.charAt(srcHash.length - 1);
    var type = (srcHash.length % 2) ? 'odd' : 'even';
    var base = srcHash.substring(0, srcHash.length - 1);
    if (BORDERS[dir][type].indexOf(lastChr) !== -1) {
      base = MDSCommon.calculateAdjacent(base, dir);
    }
    return base + MDSCommon.BASE32[NEIGHBORS[dir][type].indexOf(lastChr)];
  },

  decodeGeoHash: function (geohash) {
    var BITS = [16, 8, 4, 2, 1];

    var is_even = 1;
    var lat = [];
    var lon = [];
    lat[0] = -90.0;
    lat[1] = 90.0;
    lon[0] = -180.0;
    lon[1] = 180.0;
    var lat_err = 90.0;
    var lon_err = 180.0;
    var i;
    var cd;
    var mask;
    var c, j;

    for (i = 0; i < geohash.length; i++) {
      c = geohash[i];
      cd = MDSCommon.BASE32.indexOf(c);
      for (j = 0; j < 5; j++) {
        mask = BITS[j];
        if (is_even) {
          lon_err /= 2;
          MDSCommon.refine_interval(lon, cd, mask);
        } else {
          lat_err /= 2;
          MDSCommon.refine_interval(lat, cd, mask);
        }
        is_even = !is_even;
      }
    }
    lat[2] = (lat[0] + lat[1]) / 2;
    lon[2] = (lon[0] + lon[1]) / 2;

    return {latitude: lat, longitude: lon};
  },

  guid: function () {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  },

  diff: function (minuend, subtrahend, looseEquality) {
    if (Array.isArray(minuend)) {
      if (!Array.isArray(subtrahend) || minuend.length !== subtrahend.length) {
        return MDSCommon.copy(minuend);
      } else {
        for (var i in minuend) {
          if (looseEquality) {
            if (minuend[i][key] != subtrahend[i][key]) {
              return minuend;
              // ret[key] = MDSCommon.copy(minuend[key]);
            }
          } else {
            if (minuend[key] !== subtrahend[key]) {
              return minuend;
              // ret[key] = MDSCommon.copy(minuend[key]);
            }
          }
        }
        return minuend;
      }
    }


    var ret = {};
    for (var key in minuend) {
      if (MDSCommon.isObject(minuend[key]) || Array.isArray(minuend[key])) {
        ret[key] = MDSCommon.diff(minuend[key], subtrahend[key]);
      } else {
        if (looseEquality) {
          if (minuend[key] != subtrahend[key]) {
            ret[key] = minuend[key];
          }
        } else {
          if (minuend[key] !== subtrahend[key]) {
            ret[key] = minuend[key];
          }
        }
      }
    }

    return ret;
  },

  millisecondsToStr: function (milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();
    if (milliseconds <= 0) {
      return 'less than a second'; //'just now' //or other string you like;
    }

    function numberEnding(number) {
      return (number > 1) ? 's' : '';
    }

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
      return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
      return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
      return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
      return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
      return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
  },

  humanizeDate: function (date, language) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    var currentDateMillis = new Date().getTime();
    var dateMillis = date.getTime();
    var deltaMillis = currentDateMillis - dateMillis;
    return MDSCommon.millisecondsToStr(deltaMillis);
  },

  escapeHtml: function (string) {
    var str = '' + string;
    var match = /["'&<> ]/.exec(str);

    if (!match) {
      return str;
    }

    var escape;
    var html = '';
    var index = 0;
    var lastIndex = 0;

    for (index = match.index; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 32: // space
          escape = '&nbsp;';
          break;
        case 34: // "
          escape = '&quot;';
          break;
        case 38: // &
          escape = '&amp;';
          break;
        case 39: // '
          escape = '&#39;';
          break;
        case 60: // <
          escape = '&lt;';
          break;
        case 62: // >
          escape = '&gt;';
          break;
        default:
          continue;
      }

      if (lastIndex !== index) {
        html += str.substring(lastIndex, index);
      }

      lastIndex = index + 1;
      html += escape;
    }

    return lastIndex !== index
      ? html + str.substring(lastIndex, index)
      : html;
  },

  textToHtml: function (str) {
    var escaped = MDSCommon.escapeHtml(str);
    var lines = escaped.split('\n');
    if (lines.length === 1) {
      return escaped;
    }
    return lines.map(function (line) {
      return '<p>' + line + '</p>';
    }).join('\n');
  },


  binarySearchOf: function (arr, searchElement, comparer) {
    var minIndex = 0;
    var maxIndex = arr.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
      currentIndex = (minIndex + maxIndex) / 2 | 0;
      currentElement = arr[currentIndex];
      var cmp = comparer(currentElement, searchElement);
      if (cmp < 0) {
        minIndex = currentIndex + 1;
      }
      else if (cmp > 0) {
        maxIndex = currentIndex - 1;
      }
      else {
        return arr[currentIndex];
      }
    }
  },

  parseInt: function (x, defaultValue) {
    var ret = parseInt(x);
    if (isNaN(ret)) {
      return defaultValue;
    }
    return ret;
  },

  parseBool: function (x) {
    switch (x.toString().toLowerCase()) {
      case 'true':
      case '1':
        return true;
      case 'false':
      case '0':
        return false;
    }
    throw new Error('Value is not boolean');
  },

  isBool: function (x) {
    var s = x.toString().toLowerCase();
    return s === 'true' ||
      s === 'false' ||
      s === '1' ||
      s === '0';
  },

  isNumber: function (n) {
    return Number(n) === n || (typeof n === 'string' && /^-?\d[\d.]*$/.test(n));
  },

  isInt: function (n) {
    return (typeof n === 'string' && /^-?\d+$/.test(n)) || MDSCommon.isNumber(n) && n % 1 === 0;
  },

  isPrimitive: function (value) {
    return value === null || MDSCommon.primitiveTypes.indexOf(typeof value) > -1;
  },

  isReal: function (value) {
    return !isNaN(parseFloat(value));
  },
  isGeo: function (value) {
    if (value == null || typeof value !== 'string') {
      return false;
    }
    var m = value.match(/^-?(\d+(\.\d+)?),-?(\d+(\.\d+)?)$/);
    if (m) {
      var lat = parseFloat(m[1]);
      var lon = parseFloat(m[3]);
      if (lat <= 90 && lon <= 90) {
        return true;
      }
    }
    return false;
  },

  isGeoShape: function () {
    return false;
  },

  isEmail: function (t) {
    if (t == null) {
      return true;
    }
    if (t.length > 256) return false;
    if (t.lastIndexOf("@") > 64) return false;
    var r = new RegExp('^(?:(?:\\r\\n)?[ \\t])*(?:(?:(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*))*@(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*|(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)*\\<(?:(?:\\r\\n)?[ \\t])*(?:@(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*(?:,@(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*)*:(?:(?:\\r\\n)?[ \\t])*)?(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*))*@(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*\\>(?:(?:\\r\\n)?[ \\t])*)|(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)*:(?:(?:\\r\\n)?[ \\t])*(?:(?:(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*))*@(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*|(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)*\\<(?:(?:\\r\\n)?[ \\t])*(?:@(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*(?:,@(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*)*:(?:(?:\\r\\n)?[ \\t])*)?(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*))*@(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*\\>(?:(?:\\r\\n)?[ \\t])*)(?:,\\s*(?:(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*))*@(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*|(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)*\\<(?:(?:\\r\\n)?[ \\t])*(?:@(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*(?:,@(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*)*:(?:(?:\\r\\n)?[ \\t])*)?(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|"(?:[^\\"\\r\\\\]|\\\\.|(?:(?:\\r\\n)?[ \\t]))*"(?:(?:\\r\\n)?[ \\t])*))*@(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*)(?:\\.(?:(?:\\r\\n)?[ \\t])*(?:[^()<>@,;:\\\\".\\[\\] \\000-\\031]+(?:(?:(?:\\r\\n)?[ \\t])+|\\Z|(?=[\\["()<>@,;:\\\\".\\[\\]]))|\\[([^\\[\\]\\r\\\\]|\\\\.)*\\](?:(?:\\r\\n)?[ \\t])*))*\\>(?:(?:\\r\\n)?[ \\t])*))*)?;\\s*)$');
    return r.test(t + ' ');
  },

  isURL: function (t) {
    if (t == null) {
      return true;
    }
    return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(t);
  },

  isPhone: function (t) {
    if (t == null) {
      return true;
    }
    return /^\+?\d{3,15}$/.test(t);
  },

  isDate: function (t) {
    if (t == null) {
      return true;
    }
    var d = new Date(t);
    return isNaN(d.getDay());
  },

  getVersionOf: function (root) {
    var parts = root.split('$');
    var version = parts[1] ? parseInt(parts[1]) : 0;
    return version;
  },

  getBaseOf: function (root) {
    return root.split('$')[0];
  },

  /**
   *
   * @param {string} str String with GPS coordinates with format: "lat,lon".
   * @return {Object} Object with fields "lat" & "lon".
   */
  latLonStrToObject: function (str) {
    var parts = str.split(',');
    return {
      lat: parseFloat(parts[0]),
      lon: parseFloat(parts[1])
    };
  },

  isComplex: function (value) {
    return MDSCommon.isObject(value) || Array.isArray(value);
  },

  isObject: function (value) {
    return typeof value === 'object' && value !== null;
  },

  isNull: function (value) {
    return typeof value === 'undefined' || value === null;
  },

  isBlank: function (value) {
    return MDSCommon.isNull(value) || value === '' || Array.isArray(value) && value.length === 0;
  },

  throwIfBlank: function (value, message) {
    if (MDSCommon.isBlank(value)) {
      throw new Error(message);
    }
    return value;
  },

  throwIfNull: function (value, message) {
    if (MDSCommon.isNull(value)) {
      throw new Error(message);
    }
    return value;
  },

  isPresent: function (value) {
    return !MDSCommon.isBlank(value);
  },

  extend: function (dest, source) {
    var ret = MDSCommon.copy(dest);
    MDSCommon.extendOf(ret, source);
    return ret;
  },

  extendOf: function (dest, source) {
    if (MDSCommon.isBlank(source)) {
      return;
    }

    if (MDSCommon.isPrimitive(dest) || MDSCommon.isPrimitive(source)) {
      throw new Error('Cant extend primative type');
    }

    if (Array.isArray(dest) && Array.isArray(source)) {
      for (var i in source) {
        var item = source[i];
        dest.push(MDSCommon.copy(item));
      }
    } else { // object
      for (var i in dest) {
        if (typeof source[i] === 'undefined') {
          continue;
        }
        if (MDSCommon.isPrimitive(dest[i]) || MDSCommon.isPrimitive(source[i])) {
          dest[i] = MDSCommon.copy(source[i]);
        } else { // mergin
          MDSCommon.extendOf(dest[i], source[i]);
        }
      }
      for (var i in source) {
        if (typeof dest[i] === 'undefined') {
          dest[i] = MDSCommon.copy(source[i]);
        }
      }
    }
  },

  copy: function (data) {
    if (MDSCommon.isPrimitive(data)) {
      return data;
    }
    var ret = Array.isArray(data) ? [] : {};
    for (var i in data) {
      ret[i] = MDSCommon.copy(data[i]);
    }
    return ret;
  },

  mapToArray: function (map, keyName) {
    if (typeof keyName === 'undefined') {
      keyName = 'name';
    }
    var ret = [];
    for (var key in map) {
      ret.push(map[key]);
      if (keyName) {
        ret[ret.length - 1][keyName] = key;
      }
    }
    return ret;
  },

  convertNameValueArrayToMap: function (arr, nameFieldName, valueFieldName) {
    var ret = {};
    if (nameFieldName == null) {
      nameFieldName = 'name';
    }
    if (valueFieldName == null) {
      valueFieldName = 'value';
    }
    for (var i in arr) {
      if (typeof arr[i][nameFieldName] === 'undefined') {
        continue;
      }
      ret[arr[i][nameFieldName]] = arr[i][valueFieldName];
    }
    return ret;
  },

  convertMapToNameValue: function (obj) {
    var ret = [];
    for (var i in obj) {
      ret.push({
        name: i,
        value: obj[i]
      });
    }
    return ret;
  },

  findIndexByName: function (arr, name, caseInsensitive) {
    if (typeof caseInsensitive === 'undefined') {
      caseInsensitive = false;
    }
    if (arr == null) {
      throw new Error('Argument arr can not be null');
    }
    if (!Array.isArray(arr)) {
      throw new Error('Argument arr isnt array');
    }
    if (typeof name === 'undefined') {
      throw new Error('Name is undefined');
    }
    if (caseInsensitive) {
      name = name.toUpperCase();
    }
    for (var i in arr) {
      var itemName = arr[i].name;
      if (caseInsensitive) itemName = itemName.toUpperCase();
      if (itemName === name) {
        return i;
      }
    }
    return -1;
  },

  findByName: function (arr, name, caseInsensitive) {
    var index = MDSCommon.findIndexByName(arr, name, caseInsensitive);
    if (index !== -1) {
      return arr[index];
    }
    return undefined;
  },

  findValueByName: function (arr, name, caseInsensitive) {
    if (Array.isArray(arr)) {
      var item = MDSCommon.findByName(arr, name, caseInsensitive);
      if (item == null) {
        return item;
      }
      return item.value;
    } else {
      return arr[name];
    }
  },

  getChildPath: function (parentPath, childName) {
    if (MDSCommon.isBlank(parentPath)) {
      return childName;
    }
    return parentPath + '/' + childName;
  },

  /**
   * Returns last part of the path.
   */
  getPathName: function (path) {
    var i = path.lastIndexOf('/');
    if (i === -1) {
      i = path.lastIndexOf('\\');
      if (i === -1) {
        return path;
      }
    }
    return path.substr(i + 1);
  },

  getParentPath: function (path) {
    if (MDSCommon.isBlank(path)) {
      return null;
    }
    var i = path.lastIndexOf('/');
    if (i === -1) {
      i = path.lastIndexOf('\\');
      if (i === -1) {
        return '';
      }
    }
    return path.slice(0, i);
  },

  getURLParamByName: function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },


  /**
   * Converts date to unix like format.
   * @param {Date} date
   * @param {boolean} withSeconds
   * @returns {string}
   */
  dateToString: function (date, withSeconds) {
    if (typeof date === 'undefined') {
      date = new Date();
    }
    return String(date.getFullYear() + '-' +
      MDSCommon.intToFixedString(date.getMonth() + 1, 2) + '-' +
      MDSCommon.intToFixedString(date.getDate(), 2) + '_' +
      MDSCommon.intToFixedString(date.getHours(), 2) + '-' +
      MDSCommon.intToFixedString(date.getMinutes(), 2) +
      (withSeconds ? '-' + MDSCommon.intToFixedString(date.getSeconds(), 2) : '')
    );
  },

  intToFixedString: function (number, numberOfDigits) {
    var s = number.toString();
    var ret = '';
    var n = numberOfDigits - s.length;
    var i = 0;
    while (i < n) {
      ret += '0';
      i++;
    }
    return ret + s;
  },

  consoleFormat: function (format) {
    if (format == null) {
      format = '';
    }
    if (typeof format !== 'string') {
      format = format.toString();
    }
    if (arguments.length === 1) {
      return format;
    }
    var ret = '';
    var state = '';
    var lastArgIndex = 0;
    for (var i = 0; i < format.length; i++) {
      switch (format[i]) {
        case '%':
          state = '%';
          break;
        case 's':
        case 'd':
        case 'i':
        case 'f':
          if (state === '%') {
            lastArgIndex++;
            if (lastArgIndex <= arguments.length - 1) {
              ret += arguments[lastArgIndex];
            } else {
              ret += '%' + format[i];
            }
          } else {
            ret += format[i];
          }
          state = '';
          break;
        default:
          if (state === '%') {
            ret += '%';
          }
          ret += format[i];
          state = '';
      }
    }
    if (state === '%') {
      ret += '%';
    }

    for (var i = lastArgIndex + 1; i < arguments.length; i++) {
      ret += ' ' + arguments[i];
    }

    return ret;
  },

  requirePermit: function (data, keys) {
    return MDSCommon.permit(MDSCommon.req(data, keys), keys);
  },

  reqArray: function (arr, keys) {
    var ret = [];
    for (var i in arr) {
      var data = arr[i];
      ret[i] = MDSCommon.req(data, keys);
    }
    return ret;
  },

  /**
   * Checks availability and type of required keys.
   * Throws error if required key is not exist or has illegal type.
   * Valid types:
   * * s - any primitive value, string, integer, boolean, etc.
   * * i - integer value.
   * * a - any value: string, object, array, etc.
   * Example:
   * data = { name: 'John', age: 22, tags: ['my', 'first', 'tag'] }
   * This data suitable for next variants of keys:
   * keys = ['name', 'age', 'tags']
   * keys = { name: 's', age: 'i', tags: 'a' }
   * keys = { name: 's', age: 'i', tags: 's' }
   * keys = { name: 's', age: 's', tags: 's' }
   * keys = { name: 'a', age: 'a', tags: 'a' }
   * PS: If field is array then key applies for each item of this array.
   */
  req: function (data, keys) {
    if (typeof data === 'undefined') {
      return [];
    }
    if (arguments.length > 2) {
      keys = [];
      for (var i = 1; i < arguments.length; i++) {
        keys.push(arguments[i]);
      }
    }
    if (Array.isArray(data)) {
      return MDSCommon.reqArray(data, keys);
    } else {
      if (Array.isArray(keys)) {
        for (var i in keys) {
          var k = keys[i];
          if (typeof data[k] == 'undefined') {
            throw new Error('Required field isn\'t provided: ' + k);
          }
        }
      } else {
        for (var k in keys) {
          var type = keys[k];
          var val = data[k];
          if (typeof val == 'undefined') {
            throw new Error('Required field isn\'t provided: ' + k);
          }
          var ok = false;
          if (MDSCommon.isPrimitive(type)) {
            ok = MDSCommon.isValidPrimitiveType(val, type);
          } else {
            ok = MDSCommon.req(val, type);
          }
          if (!ok) {
            throw new Error('Illegal field or key type');
          }
        }
      }
      return data;
    }
  },

  permit: function (data, keys) {
    if (typeof data === 'undefined') {
      return [];
    }
    if (arguments.length > 2) {
      keys = [];
      for (var i = 1; i < arguments.length; i++) {
        keys.push(arguments[i]);
      }
    }
    if (Array.isArray(data)) {
      return MDSCommon.permitArray(data, keys);
    } else {
      var ret = {};
      if (Array.isArray(keys)) {
        for (var i in keys) {
          var k = keys[i];
          var val = data[k];
          if (typeof val !== 'undefined') {
            ret[k] = val;
          }
        }
      } else {
        for (var k in keys) {
          var type = keys[k];
          var val = data[k];
          if (typeof val !== 'undefined') {
            var ok = false;
            if (MDSCommon.isPrimitive(type)) {
              ok = MDSCommon.isValidPrimitiveType(val, type);
            } else {
              ret[k] = MDSCommon.permit(val, type);
            }
            if (ok) {
              ret[k] = val;
            }
          }
        }
      }
      return ret;
    }
  },

  permitArray: function (arr, keys) {
    var ret = [];
    for (var i in arr) {
      var data = arr[i];
      ret[i] = MDSCommon.permit(data, keys);
    }
    return ret;
  },

  isValidPrimitiveTypeSingle: function (val, type) {
    var ok = false;
    if (type && type.length > 3 && type[0] === '"' && type[type.length - 1] === '"') {
      var validValue = type.substring(1, type.length - 1);
      return val === validValue;
    }
    switch (type) {
      case 's': // string
      case 'j': // test
      case '*': // test
        ok = MDSCommon.isPrimitive(val);
        break;
      case 'u': // url
        ok = MDSCommon.isURL(val);
        break;
      case 'i':
        ok = MDSCommon.isInt(val);
        break;
      case 'r':
        ok = MDSCommon.isReal(val);
        break;
      case 'b':
        ok = MDSCommon.isBool(val);
        break;
      case 'd':
        ok = MDSCommon.isDate(val);
        break;
      case 'e':
        ok = MDSCommon.isEmail(val);
        break;
      case 'p':
        ok = MDSCommon.isPhone(val);
        break;
      case 'g':
        ok = MDSCommon.isGeo(val);
        break;
      case 'G':
        ok = MDSCommon.isGeoShape(val);
        break;
      case 'o':
        ok = MDSCommon.isObject(val);
        break;
      case 'true':
        ok = MDSCommon.isBool(val) && MDSCommon.parseBool(val);
        break;
      case 'a':
        ok = true;
        break;
    }
    return ok;
  },

  /**
   * @param val - Value or array of values to check.
   * @param type - Required value type.
   */
  isValidPrimitiveType: function (val, type) {
    var ok;
    if (Array.isArray(val)) {
      ok = val.reduce(function (prev, curr) {
        return prev && MDSCommon.isValidPrimitiveTypeSingle(curr, type);
      });
    } else {
      ok = MDSCommon.isPrimitive(val, type);
    }
    return ok;
  },

  ROOT_FIELD_GRAVITIES: {
    avatar: 1.3,
    name: 1.3,
    tags: 1.2,
    websiteURL: 1,
    description: 1.2,
    country: 1,
    language: 1,
    category: 1.1,
    readme: 1.2
  },

  getRootDataCompleteness: function (data) {
    var filled = 0;
    var total = 0;
    for (var k in MDSCommon.ROOT_FIELD_GRAVITIES) {
      var gravity = MDSCommon.ROOT_FIELD_GRAVITIES[k];
      if (MDSCommon.isPresent(MDSCommon.findValueByName(data.fields, k))) {
        filled += gravity;
      }
      total += gravity;
    }
    return filled / total;
  },

  isEmptyObject: function(obj) {
    var name;
    for ( name in obj ) {
      return false;
    }
    return true;
  },

  timestampToDate: function(timestamp) {
    var ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    if (ts < 20000000000) {
      ts *= 1000;
    }
    return new Date(ts);
  }
};

if (typeof module !== 'undefined') {
  module.exports = MDSCommon;
}

'use strict';

function EntityRecursiveFormatter(fieldsFormatter, childrenFormatter) {
  this.fieldsFormatter = fieldsFormatter;
  this.childrenFormatter = childrenFormatter;
}

EntityRecursiveFormatter.prototype.format = function(data) {
  var datas;
  if (Array.isArray(data)) {
    datas = data;
  } else if (data.datas == null) {
    datas = [data];
  } else {
    datas = data.datas;
  }
  for (var i in datas) {
    this.formatEntity(datas[i]);
  }
};

EntityRecursiveFormatter.prototype.formatEntity = function(entity) {
  if (entity != null && entity.children != null) {
    if (!Array.isArray(entity.children)) {
      throw new Error('children field must be array');
    }
    for (var i in entity.children) {
      this.formatEntity(entity.children[i]);
    }
  }
  this.fieldsFormatter.format(entity);
  if (this.childrenFormatter) {
    this.childrenFormatter.format(entity);
  }
};

function EntityFieldsSimplifier() {}
function EntityChildrenSimplifier() {}
function EntityFieldsUnsimplifier() {}

EntityFieldsSimplifier.prototype.format = function(data) {
  var res = {};
  if (data != null && data.fields != null) {
    if (!Array.isArray(data.fields)) {
      return;
      // throw new Error('fields must be array');
    }
    for (var i in data.fields) {
      var field = data.fields[i];
      res[field.name] = field.value;
    }
  }
  data.fields = res;
};

EntityChildrenSimplifier.prototype.format = function(data) {
  var res = {};
  if (data != null && data.children != null) {
    if (!Array.isArray(data.children)) {
      throw new Error('children field must be array');
    }
    for (var i in data.children) {
      var child = data.children[i];
      var childName = MDSCommon.getPathName(child.path)
      res[childName] = child;
    }
  }
  data.children = res;
};

EntityFieldsUnsimplifier.prototype.format = function(data) {
  var res = [];
  if (data != null && data.fields != null) {
    if (Array.isArray(data.fields)) {
      for (var i in data.fields) {
        res.push(data.fields[i]);
      }
    } else {
      for (var key in data.fields) {
        res.push({
          name: key,
          value: data.fields[key],
          type: 's'
        });
      }
    }
  }
  data.fields = res;
};

function EntitySimplifier() {
  EntityRecursiveFormatter.call(this, new EntityFieldsSimplifier());
}

function EntityUnsimplifier() {
  EntityRecursiveFormatter.call(this, new EntityFieldsUnsimplifier());
}

EntitySimplifier.prototype = Object.create(EntityRecursiveFormatter.prototype);
EntityUnsimplifier.prototype = Object.create(EntityRecursiveFormatter.prototype);




/**
 * Wrapper for MDSClient requests for work with entities.
 * Version 3.0
 * @param {MDSClient} client Instance of MDSClient class.
 * @param {string} root
 * @constructor
 */
function Entities(client, root) {
  this.client = client;
  this.root = root;
}

Entities.prototype.request = function (data) {
  var d;
  if (this.root) {
    if (data.root) {
      throw new Error('You can not specify root in request because it already specified in object');
    }
    d = MDSCommon.extend(data, {root: this.root });
  } else {
    d = data;
  }
  return this.client.request(d);
};

Entities.prototype.create = function (data) {
  return this.request('entities.create', data);
};

Entities.prototype.get = function (data) {
  return this.request('entities.get', data);
};

Entities.prototype.delete = function (data) {
  return this.request('entities.delete', data);
};

Entities.prototype.change = function(data) {
  return this.request('entities.change', data);
};

Entities.prototype.subscribe = function(data) {
  return this.request('entities.subscribe', data);
};

Entities.prototype.unsubscribe = function(data) {
  return this.request('entities.unsubscribe', data);
};

Entities.prototype.on = function(eventName, callback) {
  var self = this;
  var cb = self.root ? function (data) {
    if (data.root === self.root) {
      callback(data);
    }
  } : callback;
  this.client.on('entities.' + eventName + '.res', cb);
};

Entities.prototype.onChange = function(callback) {
  this.on('change', callback);
};

Entities.prototype.onDelete = function(callback) {
  this.on('delete', callback);
};

Entities.prototype.onRename = function(callback) {
  this.on('rename', callback);
};

Entities.prototype.onCreate = function (callback) {
  this.on('create', callback);
};

'use strict';

/**
 * Client for MyDataSpace service.
 * Version 2.1
 * @param {object|string} options
 * @param {boolean} [options.import] Must be true if you want import large amount of data.
 *                                   If this option is true:
 *                                   - Subscribers will not receive messages
 *                                   - More requests per second can be send
 * @param {string} [options.clientId]
 * @param {string} [options.permission]
 * @constructor
 */
function MDSClient(options) {
  var self = this;
  var apiURL = options.import === true ? MDSClient.DEFAULT_URLS.importURL : MDSClient.DEFAULT_URLS.apiURL;
  this.options = MDSCommon.extend({
    useLocalStorage: true,
    apiURL:  apiURL,
    cdnURL:  MDSClient.DEFAULT_URLS.cdnURL,
    websocketURL: apiURL,
    connected: function() { }
  }, options);
  this.connected = false;
  this.loggedIn = false;
  this.requests = {};
  this.subscriptions = [];
  this.lastRequestId = 10000;
  this.formatters = {};
  this.listeners = {
    login: [],
    logout: [],
    connected: [],
    tasksAuthorize: []
  };
  this.authProviders = {
    accessToken: {
      url: '/auth?authProvider=access-token' +
           '&state=permission%3d{{permission}}%3BclientId%3d{{client_id}}%3BresultFormat=json'
    },
    vk: {
      title: 'Connect through VK',
      icon: 'vk',
      url: 'https://oauth.vk.com/authorize?client_id={{oauth_client_id}}' +
      '&state=permission%3d{{permission}}%3BclientId%3d{{client_id}}' +
      '&redirect_uri={{api_url}}%2fauth%2fvk' +
      '&display=popup',
      loginWindow: {
        height: 400
      }
    },
    'vk/tasks': {
      title: 'Authorize tasks through VK',
      icon: 'vk',
      url: 'https://oauth.vk.com/authorize?client_id=6249018' +
      '&state=permission%3d{{permission}}%3BclientId%3d{{client_id}}%3Bauth_token%3d{{auth_token}}' +
      '&redirect_uri={{api_url}}%2fauth%2fvk%2Ftasks' +
      '&display=popup',
      loginWindow: {
        height: 400
      }
    },
    github: {
      title: 'Connect through GitHub',
      icon: 'github',
      url: 'https://github.com/login/oauth/authorize?client_id={{oauth_client_id}}&scope={{scope}}' +
           '&state=permission%3d{{permission}}%3BclientId%3d{{client_id}}' +
           '&redirect_uri={{api_url}}%2fauth%2fgithub',
      loginWindow: {
        height: 600
      }
    },
    facebook: {
      title: 'Connect through Facebook',
      icon: 'facebook',
      url: 'https://www.facebook.com/dialog/oauth?client_id={{oauth_client_id}}&scope={{scope}}' +
           '&state=permission%3d{{permission}}%3BclientId%3d{{client_id}}' +
           '&redirect_uri={{api_url}}%2fauth%2ffacebook' +
           '&display=popup',
      loginWindow: {
        height: 400
      }
    },
    google: {
      title: 'Connect through Google',
      icon: 'google-plus',
      url: 'https://accounts.google.com/o/oauth2/auth' +
           '?access_type=offline&scope={{scope}}&response_type=code' +
           '&client_id={{oauth_client_id}}' +
           '&state=permission%3d{{permission}}%3BclientId%3d{{client_id}}' +
           '&redirect_uri={{api_url}}%2fauth%2fgoogle',
      loginWindow: {
        height: 800
      }
    }
  };

  this.registerFormatter = function(eventName, formatter) {
    if (!(eventName in this.formatters)) {
      this.formatters[eventName] = [];
    }
    this.formatters[eventName].push(formatter);
  };

  this.registerFormatter('entities.change', new EntityUnsimplifier());
  this.registerFormatter('entities.create', new EntityUnsimplifier());

  if (this.options.simpleFormat !== false) {
    this.registerFormatter('entities.get.res', new EntitySimplifier());
    this.registerFormatter('entities.change.res', new EntitySimplifier());
    this.registerFormatter('entities.create.res', new EntitySimplifier());
    this.registerFormatter('entities.getRoots.res', new EntitySimplifier());
    this.registerFormatter('entities.getMyRoots.res', new EntitySimplifier());
  }

  this.entities = new Entities(this);
  this.on('connected', this.options.connected);


  window.addEventListener('message', function(e) {
    var authToken = e.data.result;
    switch (e.data.message) {
      case 'authResult':
        if (self.options.useLocalStorage) {
          localStorage.setItem('authToken', authToken);
        }
        self.authToken = authToken;
        self.emit('authenticate', { token: authToken });
        e.source.close();
        break;
      case 'taskAuthResult':
        self.callListeners('tasksAuthorize', { result: authToken, provider: e.data.provider });
        e.source.close();
        break;
    }
  });
}

MDSClient.DEFAULT_URLS = {
  cdnURL:  'https://cdn.mydataspace.net',
  apiURL:  'https://api.mydataspace.net',
  importURL: 'https://import.mydataspace.net'
};

MDSClient.OAUTH_CLIENT_IDS = {
  google: '821397494321-s85oh989s0ip2msnock29bq1gpprk07f.apps.googleusercontent.com',
  facebook: '827438877364954',
  github: 'eaa5d1176778a1626379',
  vk: '6037091'
};

MDSClient.OAUTH_SCOPES = {
  google: 'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.profile.emails.read',
  facebook: 'email',
  github: 'user:email',
  vk: ''
};

MDSClient.prototype.getAuthProviders = function() {
  var ret = MDSCommon.copy(this.authProviders);
  for (var providerName in ret) {
    ret[providerName].url =
      ret[providerName].url.replace('{{api_url}}', encodeURIComponent(this.options.apiURL));
    ret[providerName].url =
      ret[providerName].url.replace('{{permission}}', this.options.permission);
    ret[providerName].url =
      ret[providerName].url.replace('{{client_id}}', this.options.clientId);
    ret[providerName].url =
      ret[providerName].url.replace('{{auth_token}}', localStorage.getItem('authToken'));
    ret[providerName].url =
      ret[providerName].url.replace('{{oauth_client_id}}', MDSClient.OAUTH_CLIENT_IDS[providerName]);
    ret[providerName].url =
      ret[providerName].url.replace('{{scope}}', MDSClient.OAUTH_SCOPES[providerName]);
  }
  return ret;
};

MDSClient.prototype.getAuthProvider = function(providerName) {
  var prov = this.authProviders[providerName];
  if (typeof prov === 'undefined') {
    return null;
  }
  var ret = MDSCommon.copy(prov);
  ret.url = ret.url.replace('{{api_url}}', encodeURIComponent(this.options.apiURL));
  ret.url = ret.url.replace('{{permission}}', this.options.permission);
  ret.url = ret.url.replace('{{client_id}}', this.options.clientId);
  ret.url = ret.url.replace('{{auth_token}}', localStorage.getItem('authToken'));
  ret.url = ret.url.replace('{{oauth_client_id}}', MDSClient.OAUTH_CLIENT_IDS[providerName]);
  ret.url = ret.url.replace('{{scope}}', MDSClient.OAUTH_SCOPES[providerName]);
  return ret;
};

MDSClient.prototype.connect = function(forceConnect) {
  var self = this;
  if (self.connecting || self.connected) {
    return;
  }
  
  return new Promise(function(resolve, reject) {
    self.connecting = true;
    self.socket = io(self.options.websocketURL, {
      secure: true,
      'forceNew' : true,
      'force new connection' : true,
      'reconnectionAttempts': 'Infinity', //avoid having user reconnect manually in order to prevent dead clients after a server restart
      'timeout' : 10000, //before connect_error and connect_timeout are emitted.
      'transports' : ['websocket']
    });

    self.on('connect', function () {
      self.connecting = false;
      self.connected = true;
      if (self.options.useLocalStorage && MDSCommon.isPresent(localStorage.getItem('authToken'))) {
        self.emit('authenticate', { token: localStorage.getItem('authToken') });
      }

      self.subscriptions.forEach(function(subscription) {
        self.socket.on(subscription, function(data) {
          self.handleResponse(data, 'success');
        });
      });

      self.callListeners('connected');
      resolve();
    });

    self.on('authenticated', function() {
      self.loggedIn = true;
      self.callListeners('login', { authToken: self.authToken });
    });

    self.on('disconnect', function() {
      self.connected = false;
      self.loggedIn = false;
      self.subscriptions = [];
      self.lastRequestId = 10000;
      self.requests = {};
    });

    self.on('entities.err', function(data) {
      self.handleResponse(data, 'fail');
    }, false);
    self.on('apps.err', function(data) {
      self.handleResponse(data, 'fail');
    }, false);
    self.on('users.err', function(data) {
      self.handleResponse(data, 'fail');
    }, false);
  });
};

MDSClient.prototype.callListeners = function(eventName, args) {
  var listeners = this.listeners[eventName];
  if (typeof listeners === 'undefined') {
    throw new Error('Listener not exists');
  }
  for (var i in listeners) {
    listeners[i](args);
  }
};

/**
 * Close the websocket.
 * You need re-initialize listeners after that!
 */
MDSClient.prototype.disconnect = function() {
  if (this.socket) {
    this.socket.disconnect();
  }
  this.connected = false;
  this.socket = null;
};

MDSClient.prototype.popupCenter = function(url, title, w, h) {
  // Fixes dual-screen position                         Most browsers      Firefox
  var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
  var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

  var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  var left = ((width / 2) - (w / 2)) + dualScreenLeft;
  var top = ((height / 2) - (h / 2)) + dualScreenTop;
  var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

  // Puts focus on the newWindow
  if (newWindow.focus) {
    newWindow.focus();
  }
  return newWindow;
};

MDSClient.prototype.authorizeTasks = function(providerName) {
  var authProvider = this.getAuthProvider(providerName + '/tasks');
  var authWindow =
    this.popupCenter(authProvider.url, 'Login over ' + providerName, 640, authProvider.loginWindow.height);
  authWindow.focus();
  setInterval(function() {
    authWindow.postMessage({ message: 'requestTaskAuthResult' }, '*');
  }, 1000);
};

MDSClient.prototype.login = function(providerName) {
  var authProvider = this.getAuthProvider(providerName);
  var authWindow =
    this.popupCenter(authProvider.url, 'Login over ' + providerName, 640, authProvider.loginWindow.height);
  authWindow.focus();
  var authCheckInterval = setInterval(function() {
    authWindow.postMessage({ message: 'requestAuthResult' }, '*');
  }, 1000);
  var self = this;
  return new Promise(function(resolve, reject) {
    self.on('login', function(args) { resolve(args); });
  });
};

MDSClient.prototype.logout = function() {
  localStorage.removeItem('authToken');
  this.disconnect();
  this.connect();
  this.callListeners('logout');
};

MDSClient.prototype.isLoggedIn = function() {
  return this.loggedIn;
};

MDSClient.prototype.isConnected = function() {
  return this.connected;
};

MDSClient.prototype.emit = function(eventName, data) {
  if (typeof this.socket === 'undefined') {
    throw new Error('You must connect to server before emit data');
  }

  var arr = Array.isArray(data) ? data : [data];
  (this.formatters[eventName] || []).forEach(function(formatter) {
    arr.forEach(function(d) {
      formatter.format(d);
    });
  });

  if (Array.isArray(data)) {
    data = { datas: data };
  }
  this.socket.emit(eventName, data);
};

MDSClient.prototype.off = function(eventName, callback) {
};

MDSClient.prototype.on = function(eventName, callback, ignoreRequestErrors) {
  if (typeof this.listeners[eventName] !== 'undefined') {
    this.listeners[eventName].push(this.formatAndCallIgnoreRequestErrors.bind(this, eventName, callback, ignoreRequestErrors));
    return;
  }
  if (typeof this.socket === 'undefined') {
    throw new Error('You must connect to server before subscribe to events');
  }
  this.socket.on(eventName, this.formatAndCallIgnoreRequestErrors.bind(this, eventName, callback, ignoreRequestErrors));
};

/**
 * Content dependent function to make request to the server over instance of MDSClient class.
 * Content must be instance of MDSClient class!
 * This function extracted from MDSClient.request method to implement 2 behaviors - callback or Promise.
 */
function request(eventName, data, resolve, reject) {
  var self = this;
  var options = {
    success: resolve || function() {},
    fail: reject || function() {}
  };
  if (Array.isArray(data)) {
    if (data.length > 0) {
      data = { datas: data };
    } else {
      resolve();
      return;
    }
  }
  var responseEventName = eventName + '.res';
  // Store request information to array
  self.lastRequestId++;
  data.requestId = this.lastRequestId;
  self.requests[data.requestId] = {
    options: options,
    eventName: responseEventName
  };

  // Init response handler
  if (self.subscriptions.indexOf(responseEventName) === -1) {
    self.subscriptions.push(responseEventName);
    self.socket.on(responseEventName, function(data) {
      self.handleResponse(data, 'success');
    });
  }

  // Send request
  self.emit(eventName, data);
}

/**
 * Emit message to the server with field requestId and wait until message with the same requestId
 * received.
 * @param {String} eventName
 * @param data Request data
 * @param {function} [successCallback]
 * @param {function} [failCallback]
 * @return Nothing if successCallback or failCallback passed. Promise if not callback functions passed.
 */
MDSClient.prototype.request = function(eventName, data, successCallback, failCallback) {
  if (successCallback || failCallback) {
    request.call(this, eventName, data, successCallback, failCallback);
  } else {
    return new Promise(request.bind(this, eventName, data));
  }
};

MDSClient.prototype.formatAndCallIgnoreRequestErrors = function(eventName, callback, ignoreRequestErrors, data) {
  if (ignoreRequestErrors == null) {
    ignoreRequestErrors = true;
  }
  if (ignoreRequestErrors && data != null && data.requestId != null && eventName.endsWith('.err')) {
    return;
  }
  this.formatAndCall(eventName, callback, data);
};

MDSClient.prototype.formatAndCall = function(eventName, callback, data) {
  var formatterArr = this.formatters[eventName];
  if (data != null && data.datas != null) {
    var requestId = data.requestId;
    data = data.datas;
    // if (requestId != null) {
    //   data.requestId = requestId;
    // }
  }
  if (formatterArr != null) {
    for (var i in formatterArr) {
      formatterArr[i].format(data);
    }
  }
  callback(data);
};

MDSClient.prototype.handleResponse = function(data, callbackName) {
  if (typeof data.requestId === 'undefined') {
    return;
  }
  var req = this.requests[data.requestId];
  if (typeof req === 'undefined') {
    return;
  }
  delete this.requests[data.requestId];
  if (typeof req.options !== 'undefined' && callbackName in req.options) {
    var callback = req.options[callbackName];
    this.formatAndCall(req.eventName, callback, data);
  }
};

MDSClient.prototype.loginByToken = function(token) {
  var self = this;
  var url = self.options.apiURL + self.getAuthProvider('accessToken').url + '&accessToken=' + token;
  console.log(url);
  return new Promise(function(resolve, reject) {
    http.get(url, function(res) {
      var json = '';
      res.on('data', function(chunk) {
        json += chunk;
      });
      res.on('end', function() {
        var obj = JSON.parse(json);
        function loginListener() {
          self.off('login', loginListener);
          resolve();
        }
        self.on('login', loginListener);
        self.emit('authenticate', { token: obj.jwt });
        self.on('unauthorized', reject);
      });
    });
  });
};

module.exports.MDSCommon = MDSCommon;
module.exports.MDSClient = MDSClient;

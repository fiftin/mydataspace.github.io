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

  refine_interval: function(interval, cd, mask) {
    if (cd&mask)
      interval[0] = (interval[0] + interval[1])/2;
    else
      interval[1] = (interval[0] + interval[1])/2;
  },

  calculateAdjacent: function(srcHash, dir) {
    var NEIGHBORS = { right  : { even :  "bc01fg45238967deuvhjyznpkmstqrwx" },
      left   : { even :  "238967debc01fg45kmstqrwxuvhjyznp" },
      top    : { even :  "p0r21436x8zb9dcf5h7kjnmqesgutwvy" },
      bottom : { even :  "14365h7k9dcfesgujnmqp0r2twvyx8zb" } };

    NEIGHBORS.bottom.odd = NEIGHBORS.left.even;
    NEIGHBORS.top.odd = NEIGHBORS.right.even;
    NEIGHBORS.left.odd = NEIGHBORS.bottom.even;
    NEIGHBORS.right.odd = NEIGHBORS.top.even;


    var BORDERS   = { right  : { even : "bcfguvyz" },
      left   : { even : "0145hjnp" },
      top    : { even : "prxz" },
      bottom : { even : "028b" } };

    BORDERS.bottom.odd = BORDERS.left.even;
    BORDERS.top.odd = BORDERS.right.even;
    BORDERS.left.odd = BORDERS.bottom.even;
    BORDERS.right.odd = BORDERS.top.even;


    srcHash = srcHash.toLowerCase();
    var lastChr = srcHash.charAt(srcHash.length-1);
    var type = (srcHash.length % 2) ? 'odd' : 'even';
    var base = srcHash.substring(0,srcHash.length-1);
    if (BORDERS[dir][type].indexOf(lastChr) !== -1) {
      base = MDSCommon.calculateAdjacent(base, dir);
    }
    return base + MDSCommon.BASE32[NEIGHBORS[dir][type].indexOf(lastChr)];
  },

  decodeGeoHash: function(geohash) {
    var BITS = [16, 8, 4, 2, 1];

    var is_even = 1;
    var lat = []; var lon = [];
    lat[0] = -90.0;  lat[1] = 90.0;
    lon[0] = -180.0; lon[1] = 180.0;
    var lat_err = 90.0;
    var lon_err = 180.0;
    var i;
    var cd;
    var mask;

    for (i=0; i<geohash.length; i++) {
      c = geohash[i];
      cd = MDSCommon.BASE32.indexOf(c);
      for (j=0; j<5; j++) {
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
    lat[2] = (lat[0] + lat[1])/2;
    lon[2] = (lon[0] + lon[1])/2;

    return { latitude: lat, longitude: lon};
  },

  guid: function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  },

  diff: function(minuend, subtrahend, looseEquality) {
    if (Array.isArray(minuend)) {
      if (!Array.isArray(subtrahend) || minuend.length !== subtrahend.length) {
        return MDSCommon.copy(minuend);
      } else {
        for (var i in minuend) {
          if (looseEquality) {
            if (minuend[i][key] != subtrahend[i][key]) {
              ret[key] = MDSCommon.copy(minuend[key]);
            }
          } else {
            if (minuend[key] !== subtrahend[key]) {
              ret[key] = MDSCommon.copy(minuend[key]);
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

  millisecondsToStr: function(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();
    if (milliseconds <= 0) {
      return 'less than a second'; //'just now' //or other string you like;
    }

    function numberEnding (number) {
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

  humanizeDate: function(date, language) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    var currentDateMillis = new Date().getTime();
    var dateMillis = date.getTime();
    var deltaMillis = currentDateMillis - dateMillis;
    return MDSCommon.millisecondsToStr(deltaMillis);
  },

  escapeHtml: function(string) {
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

  textToHtml: function(str) {
    var escaped = MDSCommon.escapeHtml(str);
    var lines = escaped.split('\n');
    if (lines.length === 1) {
      return escaped;
    }
    return lines.map(function(line) {
      return '<p>' + line + '</p>';
    }).join('\n');
  },

  isNumber: function(n) {
    return Number(n) === n || (typeof n === 'string' && /^\d[\d\.]*$/.test(n));
  },

  isInt: function(n) {
    return (typeof n === 'string' && /^\d+$/.test(n)) || MDSCommon.isNumber(n) && n % 1 === 0;
  },

  isPrimitive: function(value) {
    return value === null || MDSCommon.primitiveTypes.indexOf(typeof value) > -1;
  },

  isReal: function(value) {
    return !isNaN(parseFloat(value));
  },

  isComplex: function(value) {
    return MDSCommon.isObject(value) || Array.isArray(value);
  },

  isObject: function(value) {
    return typeof value === 'object' && value !== null;
  },

  isNull: function(value) {
    return typeof value === 'undefined' || value === null;
  },

  isBlank: function(value) {
    return MDSCommon.isNull(value) || value === '' || Array.isArray(value) && value.length === 0;
  },

  throwIfBlank: function(value, message) {
    if (MDSCommon.isBlank(value)) {
      throw new Error(message);
    }
    return value;
  },

  throwIfNull: function(value, message) {
    if (MDSCommon.isNull(value)) {
      throw new Error(message);
    }
    return value;
  },

  isPresent: function(value) {
    return !MDSCommon.isBlank(value);
  },

  extend: function(dest, source) {
    var ret = MDSCommon.copy(dest);
    MDSCommon.extendOf(ret, source);
    return ret;
  },

  extendOf: function(dest, source) {
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

  copy: function(data) {
    if (MDSCommon.isPrimitive(data)) {
      return data;
    }
    var ret = Array.isArray(data) ? [] : {};
    for (var i in data) {
      ret[i] = MDSCommon.copy(data[i]);
    }
    return ret;
  },

  mapToArray: function(map, keyName) {
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

  convertNameValueArrayToMap: function(arr) {
    var ret = {};
    for (var  i in arr) {
      ret[arr[i].name] = arr[i].value;
    }
    return ret;
  },

  convertMapToNameValue: function(obj) {
    var ret = [];
    for (var  i in obj) {
      ret.push({
        name: i,
        value: obj[i]
      });
    }
    return ret;
  },

  findIndexByName: function(arr, name, caseInsensitive) {
    if (typeof caseInsensitive === 'undefined') {
      caseInsensitive = false;
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

  findByName: function(arr, name, caseInsensitive) {
    var index = MDSCommon.findIndexByName(arr, name, caseInsensitive);
    if (index !== -1) {
      return arr[index];
    }
    return undefined;
  },

  findValueByName: function(arr, name, caseInsensitive) {
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

  getPathName: function(path) {
    var i = path.lastIndexOf('/');
    if (i === -1) {
      i = path.lastIndexOf('\\');
      if (i === -1) {
        return path;
      }
      // throw new Error('Path has no child');
    }
    return path.substr(i + 1);
  },

  getParentPath: function(path) {
    if (MDSCommon.isBlank(path)) {
      return null;
    }
    var i = path.lastIndexOf('/');
    if (i === -1) {
      i = path.lastIndexOf('\\');
      if (i === -1) {
        return path;
      }
    }
    return path.slice(0, i);
  },

  getURLParamByName: function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  dateToString: function(date) {
    if (typeof date === 'undefined') {
      date = new Date();
    }
    return String(date.getFullYear() + '-' +
      MDSCommon.intToFixedString(date.getMonth() + 1, 2) + '-' +
      MDSCommon.intToFixedString(date.getDate(), 2) + '_' +
      MDSCommon.intToFixedString(date.getHours(), 2) + '-' +
      MDSCommon.intToFixedString(date.getMinutes(), 2));
  },

  intToFixedString: function(number, numberOfDigits) {
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

  consoleFormat: function(format) {
    if (format == null) {
      format = '';
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

  requirePermit: function(data, keys) {
    return MDSCommon.permit(MDSCommon.req(data, keys), keys);
  },

  reqArray: function(data, keys) {
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
  req: function(data, keys) {
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

  permit: function(data, keys) {
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

  permitArray: function(arr, keys) {
    var ret = [];
    for (var i in arr) {
      var data = arr[i];
      ret[i] = MDSCommon.permit(data, keys);
    }
    return ret;
  },

  isValidPrimitiveType: function(val, type) {
    var ok = false;
    switch (type) {
      case 's': // string
      case 'j': // javascript
      case 'u': // javascript source
        if (Array.isArray(val)) {
          ok = val.reduce(function(prev, curr) {
            return prev && MDSCommon.isPrimitive(curr);
          });
        } else {
          ok = MDSCommon.isPrimitive(val);
        }
        break;
      case 'i':
        ok = MDSCommon.isInt(val);
        break;
      case 'r':
        ok = MDSCommon.isReal(val);
        break;
      case 'o':
        ok = MDSCommon.isObject(val);
        break;
      case 'a':
        ok = true;
        break;
    }
    return ok;
  }
};

if (typeof module !== 'undefined') {
  module.exports = MDSCommon;
}

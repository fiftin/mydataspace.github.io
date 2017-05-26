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
    return typeof value === 'object';
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

'use strict';

function EntityRecursiveFormatter(fieldsFormatter) {
  this.fieldsFormatter = fieldsFormatter;
};

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
      throw new Error('fields must be array');
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
      res.push(...data.fields);
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
 * Wrapper for Myda requests for work with entities.
 * Version 2.1
 * @param parent Instance of Myda class.
 * @param {string} [root] Root name if you want to work only with one root.
 * @constructor
 */
function Entities(parent, root) {
  this.parent = parent;
  this.root = root;
}

/**
 *
 * @param pathOrData
 * @param options
 * @return {*}
 */
Entities.prototype.getRootPathData = function(pathOrData, options) {
  var data;
  if (typeof pathOrData === 'string') {
    data = MDSCommon.extend({
      root: this.root,
      path: pathOrData
    }, options);
  } else {
    data = pathOrData.root !== undefined ? pathOrData : MDSCommon.extend(pathOrData, { root: this.root })
  }
  return data;
};

/**
 * @deprecated Now this method equals to Myda.request.
 */
Entities.prototype.request = function(eventName, data) {
  return this.parent.request(eventName, data);
};

/**
 *
 * @param pathOrData Path to entity or data of request.
 * @param fields Fields of new entity. It is only relevant if the pathOrData is string.
 */
Entities.prototype.create = function(pathOrData, fields) {
  return this.request('entities.create', this.getRootPathData(pathOrData, { fields: fields }));
};

/**
 *
 * @param pathOrOptions
 * @param [fields]
 */
Entities.prototype.get = function(pathOrOptions, fields) {
  return this.request('entities.get', this.getRootPathData(pathOrOptions, { fields: fields }));
};

/**
 * @deprecated Use get method with option children:true. This method returns incomplete information
 *             if you use search string.
 *
 * @param {string} path Path to entity children of that you want to get.
 * @param [optionsOrSearch] Search string or options for request.
 * @param {number} [limit] Max number of children in result.
 */
Entities.prototype.getChildren = function(path, optionsOrSearch, limit) {
  var data = {
    root: this.root,
    path: path,
    children: [],
    limit: limit
  };
  var options = typeof options === 'string' ? { search: optionsOrSearch } : optionsOrSearch;
  return this.request('entities.get', MDSCommon.extend(data, options)).then(function(data) { return data.children; });
};

Entities.prototype.delete = function(path) {
  return this.request('entities.delete', this.getRootPathData(path));
};

Entities.prototype.change = function(pathOrData, fields) {
  return this.request('entities.change', this.getRootPathData(pathOrData, { fields: fields }));
};

Entities.prototype.subscribe = function(filterOrOptions, events) {
  return this.request('entities.subscribe', this.getRootPathData(filterOrOptions, { events: events }));
};

Entities.prototype.unsubscribe = function(filterOrOptions) {
  return this.request('entities.unsubscribe', this.getRootPathData(filterOrOptions));
};

/**
 * @deprecated Use onChange, onDelete, onRename or onCreate.
 */
Entities.prototype.on = function(eventName, callback) {
  this.parent.on('entities.' + eventName + '.res', callback);
};

Entities.prototype.onChange = function(callback) {
  this.parent.on('entities.change.res', callback);
};

Entities.prototype.onDelete = function(callback) {
  this.parent.on('entities.delete.res', callback);
};

Entities.prototype.onRename = function(callback) {
  this.parent.on('entities.rename.res', callback);
};

Entities.prototype.onCreate = function(callback) {
  this.parent.on('entities.create.res', callback);
};

'use strict';

/**
 * Client for MyDataSpace service.
 * Version 2.1
 * @param optionsOrRoot
 * @param {boolean} [optionsOrRoot.import] Must be true if you want import large amount of data.
 *                                   If this option is true:
 *                                   - Subscribers will not receive messages
 *                                   - More requests per second can be send
 * @param {string} [optionsOrRoot.root]
 * @constructor
 */
function Myda(optionsOrRoot) {
  var options = typeof optionsOrRoot === 'string' ? { root: optionsOrRoot } : optionsOrRoot;
  var apiURL = options.import === true ? 'https://import.mydataspace.net' : 'https://api.mydataspace.net';
  this.options = MDSCommon.extend({
    useLocalStorage: true,
		apiURL:  apiURL,
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
    connected: []
  };
  this.authProviders = {
    accessToken: {
      url: '/auth?authProvider=access-token' +
           '&state=permission%3d{{permission}}%26clientId%3d{{client_id}}%26resultFormat=json'
    },
    github: {
      title: 'Connect through GitHub',
      icon: 'github',
      url: 'https://github.com/login/oauth/authorize?client_id=eaa5d1176778a1626379&scope=user:email' +
           '&state=permission%3d{{permission}}%26clientId%3d{{client_id}}' +
           '&redirect_uri={{api_url}}%2fauth%3fauthProvider%3dgithub',
      loginWindow: {
        height: 600
      }
    },
    facebook: {
      title: 'Connect through Facebook',
      icon: 'facebook',
      url: 'https://www.facebook.com/dialog/oauth?client_id=827438877364954&scope=email' +
           '&state=permission%3d{{permission}}%26clientId%3d{{client_id}}' +
           '&redirect_uri={{api_url}}%2fauth%3fauthProvider%3dfacebook' +
           '&display=popup',
      loginWindow: {
        height: 400
      }
    },
    google: {
      title: 'Connect through Google',
      icon: 'google-plus',
      url: 'https://accounts.google.com/o/oauth2/auth' +
           '?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.profile.emails.read&response_type=code' +
           '&client_id=821397494321-s85oh989s0ip2msnock29bq1gpprk07f.apps.googleusercontent.com' +
           '&state=permission%3d{{permission}}%26clientId%3d{{client_id}}' +
           '&redirect_uri={{api_url}}%2fauth%3fauthProvider%3dgoogle',
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

  if (this.options.simpleFormat !== false) {
    this.registerFormatter('entities.get.res', new EntitySimplifier());
    this.registerFormatter('entities.change.res', new EntitySimplifier());
    this.registerFormatter('entities.create.res', new EntitySimplifier());
    this.registerFormatter('entities.getRoots.res', new EntitySimplifier());
    this.registerFormatter('entities.getMyRoots.res', new EntitySimplifier());

    this.registerFormatter('entities.change', new EntityUnsimplifier());
    this.registerFormatter('entities.create', new EntityUnsimplifier());
  }
  this.entities = new Entities(this, options.root);
  this.on('connected', this.options.connected);


  window.addEventListener('message', function(e) {
    if (e.data.message === 'authResult') {
      if (this.options.useLocalStorage) {
        localStorage.setItem('authToken', e.data.result);
      }
      this.emit('authenticate', { token: e.data.result });
      e.source.close();
    }
  }.bind(this));
}

Myda.prototype.getAuthProviders = function() {
  var ret = MDSCommon.copy(this.authProviders);
  for (var providerName in ret) {
    ret[providerName].url =
      ret[providerName].url.replace('{{api_url}}', encodeURIComponent(this.options.apiURL));
    ret[providerName].url =
      ret[providerName].url.replace('{{permission}}', this.options.permission);
    ret[providerName].url =
      ret[providerName].url.replace('{{client_id}}', this.options.clientId);
  }
  return ret;
};

Myda.prototype.getAuthProvider = function(providerName) {
  var prov = this.authProviders[providerName];
  if (typeof prov === 'undefined') {
    return null;
  }
  var ret = MDSCommon.copy(prov);
  ret.url = ret.url.replace('{{api_url}}', encodeURIComponent(this.options.apiURL));
  ret.url = ret.url.replace('{{permission}}', this.options.permission);
  ret.url = ret.url.replace('{{client_id}}', this.options.clientId);
  return ret;
};

Myda.prototype.connect = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.socket = io(self.options.websocketURL, {
      secure: true,
      'forceNew' : true,
      'force new connection' : true,
      'reconnectionAttempts': 'Infinity', //avoid having user reconnect manually in order to prevent dead clients after a server restart
      'timeout' : 10000, //before connect_error and connect_timeout are emitted.
      'transports' : ['websocket']
    });

    self.on('connect', function () {
      self.connected = true;
      if (self.options.useLocalStorage && MDSCommon.isPresent(localStorage.getItem('authToken'))) {
        self.emit('authenticate', { token: localStorage.getItem('authToken') });
      }
      self.callListeners('connected');
      resolve();
    });

    self.on('authenticated', function() {
      self.loggedIn = true;
      self.callListeners('login');
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

Myda.prototype.callListeners = function(eventName, args) {
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
Myda.prototype.disconnect = function() {
  this.socket.disconnect();
  this.socket = null;
};

Myda.prototype.popupCenter = function(url, title, w, h) {
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

Myda.prototype.login = function(providerName) {
  var authProvider = this.getAuthProvider(providerName);
  var authWindow =
    this.popupCenter(authProvider.url, 'Login over ' + providerName, 640, authProvider.loginWindow.height);
  authWindow.focus();
  var authCheckInterval = setInterval(function() {
    authWindow.postMessage({ message: 'requestAuthResult' }, '*');
  }, 1000);
};

Myda.prototype.logout = function() {
  localStorage.removeItem('authToken');
  this.disconnect();
  this.connect();
  this.callListeners('logout');
};

Myda.prototype.isLoggedIn = function() {
  return this.loggedIn;
};

Myda.prototype.isConnected = function() {
  return this.connected;
};

Myda.prototype.emit = function(eventName, data) {
  if (typeof this.socket === 'undefined') {
    throw new Error('You must connect to server before emit data');
  }
  if (Array.isArray(data)) {
    data = { datas: data };
  }
  this.socket.emit(eventName, data);
};

Myda.prototype.off = function(eventName, callback) {
};

Myda.prototype.on = function(eventName, callback, ignoreRequestErrors) {
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
 * Content dependent function to make request to the server over instance of Myda class.
 * Content must be instance of Myda class!
 * This function extracted from Myda.request method to implement 2 behaviors - callback or Promise.
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
Myda.prototype.request = function(eventName, data, successCallback, failCallback) {
  if (successCallback || failCallback) {
    request.call(this, eventName, data, successCallback, failCallback);
  } else {
    return new Promise(request.bind(this, eventName, data));
  }
};

Myda.prototype.formatAndCallIgnoreRequestErrors = function(eventName, callback, ignoreRequestErrors, data) {
  if (ignoreRequestErrors == null) {
    ignoreRequestErrors = true;
  }
  if (ignoreRequestErrors && data != null && data.requestId != null && eventName.endsWith('.err')) {
    return;
  }
  this.formatAndCall(eventName, callback, data);
};

Myda.prototype.formatAndCall = function(eventName, callback, data) {
  var formatterArr = this.formatters[eventName];
  if (data != null && data.datas != null) {
    var requestId = data.requestId;
    data = data.datas;
    if (requestId != null) {
      data.requestId = requestId;
    }
  }
  if (formatterArr != null) {
    for (var i in formatterArr) {
      formatterArr[i].format(data);
    }
  }
  callback(data);
};

Myda.prototype.handleResponse = function(data, callbackName) {
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

Myda.prototype.loginByToken = function(token) {
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
      });
    });
  });
};

module.exports.MDSCommon = MDSCommon;
module.exports.Myda = Myda;

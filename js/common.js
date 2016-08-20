'use strict';

var common = {
  primitiveTypes: [
    'number',
    'string',
    'boolean',
    'undefined',
    'function'
  ],

  isNumber: function(n) {
    return Number(n) === n || (typeof n === 'string' && /^\d[\d\.]*$/.test(n));
  },

  isInt: function(n) {
    return (typeof n === 'string' && /^\d+$/.test(n)) || common.isNumber(n) && n % 1 === 0;
  },

  isPrimitive: function(value) {
    return value === null || common.primitiveTypes.indexOf(typeof value) > -1;
  },

  isReal: function(value) {
    return !isNaN(parseFloat(value));
  },

  isComplex: function(value) {
    return common.isObject(value) || Array.isArray(value);
  },

  isObject: function(value) {
    return typeof value === 'object';
  },

  isNull: function(value) {
    return typeof value === 'undefined' || value === null;
  },

  isBlank: function(value) {
    return common.isNull(value) || value === '' || Array.isArray(value) && value.length === 0;
  },

  throwIfBlank: function(value, message) {
    if (common.isBlank(value)) {
      throw new Error(message);
    }
    return value;
  },

  throwIfNull: function(value, message) {
    if (common.isNull(value)) {
      throw new Error(message);
    }
    return value;
  },

  isPresent: function(value) {
    return !common.isBlank(value);
  },

  extend: function(dest, source) {
    var ret = common.copy(dest);
    common.extendOf(ret, source);
    return ret;
  },

  extendOf: function(dest, source) {
    if (common.isBlank(source)) {
      return;
    }

    if (common.isPrimitive(dest) || common.isPrimitive(source)) {
      throw new Error('Cant extend primative type');
    }

    if (Array.isArray(dest) && Array.isArray(source)) {
      for (let i in source) {
        let item = source[i];
        dest.push(common.copy(item));
      }
    } else { // object
      for (let i in dest) {
        if (typeof source[i] === 'undefined') {
          continue;
        }
        if (common.isPrimitive(dest[i]) || common.isPrimitive(source[i])) {
          dest[i] = common.copy(source[i]);
        } else { // mergin
          common.extendOf(dest[i], source[i]);
        }
      }
      for (let i in source) {
        if (typeof dest[i] === 'undefined') {
          dest[i] = common.copy(source[i]);
        }
      }
    }
  },

  copy: function(data) {
    if (common.isPrimitive(data)) {
      return data;
    }
    var ret = Array.isArray(data) ? [] : {};
    for (var i in data) {
      ret[i] = common.copy(data[i]);
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
    for (let i in arr) {
      let itemName = arr[i].name;
      if (caseInsensitive) itemName = itemName.toUpperCase();
      if (itemName === name) {
        return i;
      }
    }
    return -1;
  },

  findByName: function(arr, name, caseInsensitive) {
    var index = common.findIndexByName(arr, name, caseInsensitive);
    if (index !== -1) {
      return arr[index];
    }
    return undefined;
  },

  getChildName: function(path) {
    var i = path.lastIndexOf('/');
    if (i === -1) {
      return path;
      // throw new Error('Path has no child');
    }
    return path.substr(i + 1);
  },

  getParentPath: function(path) {
    var i = path.lastIndexOf('/');
    if (i === -1) {
      return '';
    }
    return path.slice(0, i);
  },

  getChildPath: function(parentPath, childName) {
    if (common.isBlank(parentPath)) {
      return childName;
    }
    return parentPath + '/' + childName;
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

  getParentIdentity: function(data) {
    var required = common.requirePermit(data, { root: 's', path: 's' });
    if (common.isBlank(required['path'])) {
      return { root: 'root', path: '' }
    } else {
      return { root: required['root'], path: common.getParentPath(required['path']) }
    }
  },

  dateToString: function(date) {
    if (typeof date === 'undefined') {
      date = new Date();
    }
    return String(date.getFullYear() + '-' +
      common.intToFixedString(date.getMonth() + 1, 2) + '-' +
      common.intToFixedString(date.getDate(), 2) + '_' +
      common.intToFixedString(date.getHours(), 2) + '-' +
      common.intToFixedString(date.getMinutes(), 2));
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
    for (let i = 0; i < format.length; i++) {
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

    for (let i = lastArgIndex + 1; i < arguments.length; i++) {
      ret += ' ' + arguments[i];
    }

    return ret;
  },

  requirePermit: function(data, keys) {
    return common.permit(common.req(data, keys), keys);
  },

  reqArray: function(data, keys) {
    var ret = [];
    for (var i in arr) {
      var data = arr[i];
      ret[i] = common.req(data, keys);
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
      return common.reqArray(data, keys);
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
          if (common.isPrimitive(type)) {
            ok = common.isValidPrimitiveType(val, type);
          } else {
            ok = common.req(val, type);
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
      for (let i = 1; i < arguments.length; i++) {
        keys.push(arguments[i]);
      }
    }
    if (Array.isArray(data)) {
      return common.permitArray(data, keys);
    } else {
      var ret = {};
      if (Array.isArray(keys)) {
        for (let i in keys) {
          let k = keys[i];
          let val = data[k];
          if (typeof val !== 'undefined') {
            ret[k] = val;
          }
        }
      } else {
        for (let k in keys) {
          let type = keys[k];
          let val = data[k];
          if (typeof val !== 'undefined') {
            var ok = false;
            if (common.isPrimitive(type)) {
              ok = common.isValidPrimitiveType(val, type);
            } else {
              ret[k] = common.permit(val, type);
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
    for (let i in arr) {
      let data = arr[i];
      ret[i] = common.permit(data, keys);
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
            return prev && common.isPrimitive(curr);
          });
        } else {
          ok = common.isPrimitive(val);
        }
        break;
      case 'i':
        ok = common.isInt(val);
        break;
      case 'r':
        ok = common.isReal(val);
        break;
      case 'o':
        ok = common.isObject(val);
        break;
      case 'a':
        ok = true;
        break;
    }
    return ok;
  }
};

if (typeof module !== 'undefined') {
  module.exports = common;
}

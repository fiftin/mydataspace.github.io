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

function Entities(myda) {
  this.myda = myda;
}

Entities.prototype.request = function(eventName, data) {
  return new Promise(function(resolve, reject) {
    myda.request(eventName, data, resolve, reject);
  });
};

Entities.prototype.create = function(path, fields) {
  return this.request('entities.create', {
    root: this.myda.root,
    path: path,
    fields: fields
  });
};

Entities.prototype.get = function(path, options) {
  var data = {
    root: this.myda.root,
    path: path
  };
  return this.request('entities.get', data);
};

Entities.prototype.delete = function(path) {
  return this.request('entities.delete', {
    root: this.myda.root,
    path: path
  });
};

Entities.prototype.change = function(path, fields) {
  return this.request('entities.change', {
    root: this.myda.root,
    path: path,
    fields: fields
  });
};

Entities.prototype.subscribe = function(filter, events) {
  return this.request('entities.unsubscribe', {
    root: this.myda.root,
    path: filter,
    events: events
  });
};

Entities.prototype.unsubscribe = function(filter) {
  return this.request('entities.unsubscribe', {
    root: this.myda.root,
    path: filter
  });
};

Entities.prototype.on = function(eventName, callback) {
  this.myda.on('entities.' + eventName + '.res', callback);
};

'use strict';

function Myda(options) {
  this.options = common.extend({
		apiURL: 'http://api-mydatasp.rhcloud.com',
		websocketURL: 'http://api-mydatasp.rhcloud.com:8000',
    connected: function() {
      // console.log('Maybe you forgot to specify connected-event handler');
    }
  }, options);
  this.root = options.root;
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

  this.entities = new Entities(this);

  this.on('connected', this.options.connected);

  window.addEventListener('message', function(e) {
    if (e.data.message === 'authResult') {
      localStorage.setItem('authToken', e.data.result);
      this.emit('authenticate', { token: e.data.result });
      e.source.close();
    }
  }.bind(this));
}

Myda.prototype.getAuthProviders = function() {
  var ret = common.copy(this.authProviders);
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
  var ret = common.copy(prov);
  ret.url = ret.url.replace('{{api_url}}', encodeURIComponent(this.options.apiURL));
  ret.url = ret.url.replace('{{permission}}', this.options.permission);
  ret.url = ret.url.replace('{{client_id}}', this.options.clientId);
  return ret;
};

Myda.prototype.connect = function() {
  this.socket = io(this.options.websocketURL, {
    // secure: true,
    'force new connection' : true,
    'reconnectionAttempts': 'Infinity', //avoid having user reconnect manually in order to prevent dead clients after a server restart
    'timeout' : 10000, //before connect_error and connect_timeout are emitted.
    'transports' : ['websocket']
  });

  this.on('connect', function () {
    this.connected = true;
    if (common.isPresent(localStorage.getItem('authToken'))) {
      this.emit('authenticate', { token: localStorage.getItem('authToken') });
    }
    this.callListeners('connected');
  }.bind(this));

  this.on('authenticated', function() {
    this.loggedIn = true;
    this.callListeners('login');
  }.bind(this));

  this.on('disconnect', function() {
    this.connected = false;
    this.loggedIn = false;
    this.subscriptions = [];
    this.lastRequestId = 10000;
    this.requests = {};
  }.bind(this));

  this.on('entities.err', function(data) {
    this.handleResponse(data, 'fail');
  }.bind(this), false);
  this.on('apps.err', function(data) {
    this.handleResponse(data, 'fail');
  }.bind(this), false);
  this.on('users.err', function(data) {
    this.handleResponse(data, 'fail');
  }.bind(this), false);
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

Myda.prototype.request = function(eventName, data, successCallback, failCallback) {
  var options = {
    success: successCallback || function() {},
    fail: failCallback || function() {}
  };
  if (Array.isArray(data)) {
    if (data.length > 0) {
      data = { datas: data };
    } else {
      successCallback();
      return;
    }
  }
  var responseEventName = eventName + '.res';
  // Store request information to array
  this.lastRequestId++;
  data.requestId = this.lastRequestId;
  this.requests[data.requestId] = {
    options: options,
    eventName: responseEventName
  };

  // Init response handler
  if (this.subscriptions.indexOf(responseEventName) === -1) {
    this.subscriptions.push(responseEventName);
    this.socket.on(responseEventName, function(data) {
      this.handleResponse(data, 'success');
    }.bind(this));
  }

  // Send request
  this.emit(eventName, data);
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
    data = data.datas;
  }
  if (formatterArr != null) {
    for (let i in formatterArr) {
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

Myda.prototype.registerFormatter = function(eventName, formatter) {
  if (!(eventName in this.formatters)) {
    this.formatters[eventName] = [];
  }
  this.formatters[eventName].push(formatter);
};

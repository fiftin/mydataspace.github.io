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
    cdnURL:  'https://cdn.mydataspace.net',
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

  this.registerFormatter('entities.change', new EntityUnsimplifier());
  this.registerFormatter('entities.create', new EntityUnsimplifier());

  if (this.options.simpleFormat !== false) {
    this.registerFormatter('entities.get.res', new EntitySimplifier());
    this.registerFormatter('entities.change.res', new EntitySimplifier());
    this.registerFormatter('entities.create.res', new EntitySimplifier());
    this.registerFormatter('entities.getRoots.res', new EntitySimplifier());
    this.registerFormatter('entities.getMyRoots.res', new EntitySimplifier());
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

Myda.prototype.connect = function(forceConnect) {
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
  if (this.socket) {
    this.socket.disconnect();
  }
  this.connected = false;
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

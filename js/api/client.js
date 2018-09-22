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
    connected: []
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

MDSClient.prototype.trySendAuthRequest = function () {
  var self = this;

  if (!self.options.useLocalStorage || !MDSCommon.isPresent(localStorage.getItem('authToken'))) {
    return false;
  }

  self.emit('authenticate', { token: localStorage.getItem('authToken') });

  return true;
};


/**
 *
 * @returns {Promise}
 */
MDSClient.prototype.connect = function() {
  var self = this;

  return new Promise(function(resolve, reject) {
    var root = self.options.resolveRootFromLocation ? self.getRoot() : undefined;
    if (self.connected) {
      resolve(root);
      return;
    }

    if (self.connecting) {
      self.once('connect', function () {
        resolve(root);
      });
      return;
    }

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
      self.connected = true;
      self.connecting = false;

      self.trySendAuthRequest();

      self.subscriptions.forEach(function(subscription) {
        self.socket.on(subscription, function(data) {
          self.handleResponse(data, 'success');
        });
      });

      self.callListeners('connected');
      resolve(root);
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
    if (!listeners.hasOwnProperty(i)) {
      continue;
    }
    var listener = listeners[i];
    if (listener.once) {
      listeners.splice(i, 1);
    }
    listener(args);
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

MDSClient.prototype.login = function(providerName) {
  var self = this;

  if (providerName === undefined) {
    return new Promise(function (resolve, reject) {
      if (self.isLoggedIn()) {
        resolve();
        return;
      }

      if (!self.trySendAuthRequest()) {
        reject(new Error('Can not auth, not auth token provided'));
        return;
      }

      self.once('login', function () {
        resolve();
      });

      self.once('unauthorized', function () {
        reject(new Error('Auth error'));
      });
    });
  }

  var authProvider = this.getAuthProvider(providerName);
  var authWindow =
    this.popupCenter(authProvider.url, 'Login over ' + providerName, 640, authProvider.loginWindow.height);
  authWindow.focus();
  var authCheckInterval = setInterval(function() {
    authWindow.postMessage({ message: 'requestAuthResult' }, '*');
  }, 1000);
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

MDSClient.prototype.once = function(eventName, callback, ignoreRequestErrors) {
  var wrappedCallback = this.formatAndCallIgnoreRequestErrors.bind(this, eventName, callback, ignoreRequestErrors);

  if (typeof this.listeners[eventName] !== 'undefined') {
    wrappedCallback.once = true;
    this.listeners[eventName].push(wrappedCallback);
    return;
  }

  if (typeof this.socket === 'undefined') {
    throw new Error('You must connect to server before subscribe to events');
  }

  this.socket.once(eventName, wrappedCallback);
};


MDSClient.prototype.on = function(eventName, callback, ignoreRequestErrors) {
  var wrappedCallback = this.formatAndCallIgnoreRequestErrors.bind(this, eventName, callback, ignoreRequestErrors);
  wrappedCallback.orig = callback;
  if (typeof this.listeners[eventName] !== 'undefined') {
    this.listeners[eventName].push(wrappedCallback);
    return;
  }

  if (typeof this.socket === 'undefined') {
    throw new Error('You must connect to server before subscribe to events');
  }

  this.socket.on(eventName, wrappedCallback);
};


MDSClient.prototype.off = function(eventName, callback) {
  if (typeof this.listeners[eventName] !== 'undefined') {
    var listeners = this.listeners[eventName];

    for (var i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i].orig === callback) {
        listeners.splice(i, 1);
      }
    }

    return;
  }

  if (typeof this.socket === 'undefined') {
    throw new Error('You must connect to server before subscribe to events');
  }

  // this.socket.off(eventName, callback);
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

MDSClient.prototype.getRoot = function (root) {
  if (!root) {
    var m = !this.options.resolveRootFromLocation || typeof window === 'undefined' ? null : window.location.hostname.match(/^(.*)\.web20\.site$/);
    if (!m) {
      throw new Error('Root can not be resolved automatically. Please specify root name.');
    }
    root = m[1];
  }
  return new Entities(this, root);
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

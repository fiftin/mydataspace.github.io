MyDataSpace = {
  initialized: false,
  connected: false,
  loggedIn: false,
  requests: {},
  subscriptions: [],
  lastRequestId: 10000,
  listeners: {
    login: [],
    logout: [],
    connected: []
  },
  authProviders: {
    facebook: {
      title: 'Connect to Facebook',
      icon: 'facebook',
      url: 'https://www.facebook.com/dialog/oauth?client_id=827438877364954&scope=email&redirect_uri=http://api-mydatasp.rhcloud.com/auth?authProvider=facebook&display=popup',
      loginWindow: {
        height: 400
      }
    },
    // google: {
    //   title: 'Connect to Google',
    //   icon: 'google-plus',
    //   url: 'https://accounts.google.com/o/oauth2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.me%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fplus.profile.emails.read&response_type=code&client_id=821397494321-s85oh989s0ip2msnock29bq1gpprk07f.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Fapi-mydatasp.rhcloud.com%2Fauth%3FauthProvider%3Dgoogle',
    //   loginWindow: {
    //     height: 800
    //   }
    // },
  },

  init: function(options) {
    if (MyDataSpace.initialized) {
      console.warn('An attempt to re-initialize the MyDataSpace');
      return;
    }
    MyDataSpace.options = common.extend({
      host: 'http://api-mydatasp.rhcloud.com:8000',
      connected: function() {
        console.log('Maybe you forgot to specify connected-event handler');
      }
    }, options);
    MyDataSpace.on('connected', options.connected);
    window.addEventListener('message', function(e) {
      if (e.data.message === 'authResult') {
        localStorage.setItem('authToken', e.data.result);
        MyDataSpace.emit('authenticate', { token: e.data.result });
        e.source.close();
      }
    });
    MyDataSpace.initialized = true;
  },

  connect: function(done) {
    MyDataSpace.socket = io(MyDataSpace.options.host, {
      // secure: true,
      'force new connection' : true,
      'reconnectionAttempts': 'Infinity', //avoid having user reconnect manually in order to prevent dead clients after a server restart
      'timeout' : 10000, //before connect_error and connect_timeout are emitted.
      'transports' : ['websocket']
    });

    MyDataSpace.on('connect', function () {
      MyDataSpace.connected = true;
      if (common.isPresent(localStorage.getItem('authToken'))) {
        MyDataSpace.emit('authenticate', { token: localStorage.getItem('authToken') });
      }
      MyDataSpace.callListeners('connected');
    });

    MyDataSpace.on('authenticated', function() {
      MyDataSpace.loggedIn = true;
      MyDataSpace.callListeners('login');
    });

    MyDataSpace.on('disconnect', function() {
      MyDataSpace.connected = false;
      MyDataSpace.loggedIn = false;
      MyDataSpace.subscriptions = [];
      MyDataSpace.lastRequestId = 10000;
      MyDataSpace.requests = {};
    });

    MyDataSpace.on('entities.err', function(data) {
      MyDataSpace.handleResponse(data, 'fail');
    });
  },

  callListeners: function(eventName, args) {
    var listeners = MyDataSpace.listeners[eventName];
    if (typeof listeners === 'undefined') {
      throw new Error('Listener not exists');
    }
    for (var i in listeners) {
      listeners[i](args);
    }
  },

  /**
   * Close the websocket.
   * You need re-initialize listeners after that!
   */
  disconnect: function() {
    MyDataSpace.socket.disconnect();
    MyDataSpace.socket = null;
  },

  login: function(providerName) {
    var authProvider = MyDataSpace.authProviders[providerName];
    var authWindow = window.open(authProvider.url, '', 'width=640, height=' + authProvider.loginWindow.height);
    authWindow.focus();
    var authCheckInterval = setInterval(function() {
      authWindow.postMessage({ message: 'requestAuthResult' }, '*');
    }, 1000);
  },

  logout: function() {
    localStorage.removeItem('authToken');
    MyDataSpace.disconnect();
    MyDataSpace.connect();
    MyDataSpace.callListeners('logout');
  },

  isLoggedIn: function() {
    return MyDataSpace.loggedIn;
  },

  isConnected: function() {
    return MyDataSpace.connected;
  },

  emit: function(eventName, data) {
    if (typeof MyDataSpace.socket === 'undefined') {
      throw new Error('You must connect to server before emit data');
    }
    MyDataSpace.socket.emit(eventName, data);
  },

  on: function(eventName, callback) {
    if (typeof MyDataSpace.listeners[eventName] !== 'undefined') {
      MyDataSpace.listeners[eventName].push(callback);
      return;
    }
    if (typeof MyDataSpace.socket === 'undefined') {
      throw new Error('You must connect to server before subscribe to events');
    }
    MyDataSpace.socket.on(eventName, callback);
  },

  request: function(eventName, data, successCallback, failCallback) {
    var options = {
      success: successCallback || function() {},
      fail: failCallback || function() {}
    };
    // Store request information to array
    MyDataSpace.lastRequestId++;
    data.requestId = MyDataSpace.lastRequestId;
    MyDataSpace.requests[data.requestId] = {
      options: options
    }

    // Init response handler
    var responseEventName = eventName + '.res';
    if (MyDataSpace.subscriptions.indexOf(responseEventName) === -1) {
      MyDataSpace.subscriptions.push(responseEventName);
      MyDataSpace.on(responseEventName, function(data) {
        MyDataSpace.handleResponse(data, 'success');
      });
    }

    // Send request
    MyDataSpace.emit(eventName, data);
  },

  handleResponse: function(data, callbackName) {
    if (typeof data.requestId === 'undefined') {
      return;
    }
    var req = MyDataSpace.requests[data.requestId];
    if (typeof req === 'undefined') {
      return;
    }
    delete MyDataSpace.requests[data.requestId];
    if (typeof req.options !== 'undefined' && callbackName in req.options) {
      var callback = req.options[callbackName];
      callback(data);
    }
  }

};

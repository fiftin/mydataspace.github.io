MyDataSpace = {
  loggedIn: false,
  connected: false,
  requests: {},
  subscriptions: [],
  lastRequestId: 10000,

  connect: function(done) {
    MyDataSpace.socket = io.connect('http://localhost:8080');
    MyDataSpace.on('connect', function () {
      MyDataSpace.connected = true;
      done();
    });

    MyDataSpace.on('authenticated', function() {
      MyDataSpace.loggedIn = true;
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

  disconnect: function() {
    MyDataSpace.socket.disconnect();
    MyDataSpace.socket = null;
  },

  reconnect: function(done) {
    MyDataSpace.disconnect();
    MyDataSpace.connect(done);
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

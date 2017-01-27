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

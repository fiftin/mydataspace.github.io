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

Entities.prototype.request = function (eventName, data) {
  var d;
  var self = this;
  if (self.root) {
    if (data.root) {
      throw new Error('You can not specify root in request because it already specified in object');
    }
    if (Array.isArray(data)) {
      d = data.map(function (item) {
        return MDSCommon.extend(item, {root: self.root });
      });
    } else {
      d = MDSCommon.extend(data, {root: self.root });
    }
  } else {
    d = data;
  }
  return this.client.request(eventName, d);
};

Entities.prototype.create = function (data) {
  return this.request('entities.create', data);
};

Entities.prototype.get = function (data) {
  if (typeof data === 'string') {
    data = { path: data };
  }
  return this.request('entities.get', data);
};

Entities.prototype.getMyChildren = function (data) {
  if (typeof data === 'string') {
    data = { path: data };
  }
  return this.request('entities.getMyChildren', data);
};

Entities.prototype.getWithMeta = function (data) {
  if (typeof data === 'string') {
    data = { path: data };
  }
  return this.request('entities.getWithMeta', data);
};

Entities.prototype.getAll = function (data) {
  if (typeof data === 'string') {
    data = { path: data };
  }
  data.children = true;
  return this.get(data);
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

Entities.prototype.onLogin = function (callback) {
  this.client.on('login', callback);
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


Entities.prototype.once = function(eventName, callback) {
  var self = this;
  var cb = self.root ? function (data) {
    if (data.root === self.root) {
      callback(data);
    }
  } : callback;
  this.client.once('entities.' + eventName + '.res', cb);
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

Entities.prototype.getAuthProvider = function (providerName) {
  return this.client.getAuthProvider(providerName);
};

Entities.prototype.connect = function () {
  return this.client.connect();
};

Entities.prototype.disconnect = function () {
  return this.client.disconnect();
};

Entities.prototype.popupCenter = function (url, title, w, h) {
  return this.client.popupCenter(url, title, w, h);
};

Entities.prototype.login = function (providerName) {
  return this.client.login(providerName);
};

Entities.prototype.logout = function () {
  return this.client.logout();
};

Entities.prototype.isLoggedIn = function () {
  return this.client.isLoggedIn();
};

Entities.prototype.isConnected = function () {
  return this.client.isConnected();
};

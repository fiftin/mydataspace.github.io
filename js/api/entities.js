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
  if (this.root) {
    if (data.root) {
      throw new Error('You can not specify root in request because it already specified in object');
    }
    d = MDSCommon.extend(data, {root: this.root });
  } else {
    d = data;
  }
  return this.client.request(eventName, d);
};

Entities.prototype.create = function (data) {
  return this.request('entities.create', data);
};

Entities.prototype.get = function (data) {
  return this.request('entities.get', data);
};

Entities.prototype.getAll = function (data) {
  if (typeof data === 'string') {
    data = {
      path: data
    };
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

Entities.prototype.on = function(eventName, callback) {
  var self = this;
  var cb = self.root ? function (data) {
    if (data.root === self.root) {
      callback(data);
    }
  } : callback;
  this.client.on('entities.' + eventName + '.res', cb);
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

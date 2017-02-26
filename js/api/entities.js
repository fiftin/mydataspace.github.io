function Entities(myda) {
  this.myda = myda;
}

Entities.prototype.request = function(eventName, data) {
  return new Promise(function(resolve, reject) {
    this.myda.request(eventName, data, resolve, reject);
  }.bind(this));
};

Entities.prototype.create = function(path, fields) {
  return this.request('entities.create', {
    root: this.myda.root,
    path: path,
    fields: fields
  });
};

Entities.prototype.get = function(path, fields) {
  var data = {
    root: this.myda.root,
    path: path,
    fields: fields
  };
  return this.request('entities.get', data);
};

Entities.prototype.getChildren = function(path, options, limit) {
  var data = {
    root: this.myda.root,
    path: path,
    children: [],
    limit: limit
  };
  if (typeof options === 'string') {
    options = { search: options }
  }
  return this.request('entities.get', MDSCommon.extend(data, options))
         .then(function(data) { return data.children });
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
  return this.request('entities.subscribe', {
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
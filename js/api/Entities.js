function Entities(myda) {
  this.myda = myda;
}

Entities.prototype.request = function(eventName, data) {
  var myda = this.myda;
  return new Promise(function(resolve, reject) {
    myda.request('entities.create', {
      root: myda.root,
      path: path,
      fields: fields
    }, resolve, reject);
  });
}

Entities.prototype.create = function(entity, fields) {
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
  return this.request('entities.data', data);
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

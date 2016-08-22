function Entities(myda) {
  this.myda = myda;
}

Entities.prototype.create = function(entity, fields) {
  return this.myda.request('entities.create', {
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
  return this.myda.request('entities.data', data);
};

Entities.prototype.delete = function(path) {
  return this.myda.request('entities.delete', {
    root: this.myda.root,
    path: path
  });
};

Entities.prototype.change = function(path, fields) {
  return this.myda.request('entities.change', {
    root: this.myda.root,
    path: path,
    fields: fields
  });
};

Entities.prototype.subscribe = function(filter, events) {
  return this.myda.request('entities.unsubscribe', {
    root: this.myda.root,
    path: filter,
    events: events
  });
};

Entities.prototype.unsubscribe = function(filter) {
  return this.myda.request('entities.unsubscribe', {
    root: this.myda.root,
    path: filter
  });
};

Entities.prototype.on = function(eventName, callback) {
  this.myda.on('entities.' + eventName + '.res', callback);
};

/**
 * Wrapper for Myda requests for work with entities.
 * Version 2.1
 * @param parent Instance of Myda class.
 * @param {string} [root] Root name if you want to work only with one root.
 * @constructor
 */
function Entities(parent, root) {
  this.parent = parent;
  this.root = root;
}

/**
 *
 * @param pathOrData
 * @param options
 * @return {*}
 */
Entities.prototype.getRootPathData = function(pathOrData, options) {
  var data;
  if (typeof pathOrData === 'string') {
    data = {
      root: this.root,
      path: pathOrData
    };
  } else {
    data = pathOrData;
  }

  MDSCommon.extendOf(data, options);

  if (data.root == null) {
    MDSCommon.extendOf(pathOrData, { root: this.root })
  }

  return data;
};

/**
 * @deprecated Now this method equals to Myda.request.
 */
Entities.prototype.request = function(eventName, data) {
  return this.parent.request(eventName, data);
};

/**
 *
 * @param pathOrData Path to entity or data of request.
 * @param fields Fields of new entity. It is only relevant if the pathOrData is string.
 */
Entities.prototype.create = function(pathOrData, fields) {
  return this.request('entities.create', this.getRootPathData(pathOrData, { fields: fields }));
};

/**
 *
 * @param pathOrOptions
 * @param [fields]
 */
Entities.prototype.get = function(pathOrOptions, fields) {
  return this.request('entities.get', this.getRootPathData(pathOrOptions, { fields: fields }));
};

/**
 * @deprecated Use get method with option children:true. This method returns incomplete information
 *             if you use search string.
 *
 * @param {string} pathOrData Path to entity children of that you want to get.
 * @param [optionsOrSearch] Search string or options for request.
 * @param {number} [limit] Max number of children in result.
 */
Entities.prototype.getChildren = function(pathOrData, optionsOrSearch, limit) {
  var options = MDSCommon.extend({
    children: [],
    limit: limit
  }, typeof options === 'string' ? { search: optionsOrSearch } : optionsOrSearch);
  return this.request('entities.get', this.getRootPathData(pathOrData, options)).then(function(data) { return data.children; });
};

Entities.prototype.delete = function(pathOrData) {
  return this.request('entities.delete', this.getRootPathData(pathOrData));
};

Entities.prototype.change = function(pathOrData, fields) {
  return this.request('entities.change', this.getRootPathData(pathOrData, { fields: fields }));
};

Entities.prototype.subscribe = function(filterOrOptions, events) {
  return this.request('entities.subscribe', this.getRootPathData(filterOrOptions, { events: events }));
};

Entities.prototype.unsubscribe = function(filterOrOptions) {
  return this.request('entities.unsubscribe', this.getRootPathData(filterOrOptions));
};

/**
 * @deprecated Use onChange, onDelete, onRename or onCreate.
 */
Entities.prototype.on = function(eventName, callback) {
  this.parent.on('entities.' + eventName + '.res', callback);
};

Entities.prototype.onChange = function(callback) {
  this.parent.on('entities.change.res', callback);
};

Entities.prototype.onDelete = function(callback) {
  this.parent.on('entities.delete.res', callback);
};

Entities.prototype.onRename = function(callback) {
  this.parent.on('entities.rename.res', callback);
};

Entities.prototype.onCreate = function(callback) {
  this.parent.on('entities.create.res', callback);
};

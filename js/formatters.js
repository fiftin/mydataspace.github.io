'use strict';

function EntityRecursiveFormatter(fieldsFormatter) {
  this.fieldsFormatter = fieldsFormatter;
};

EntityRecursiveFormatter.prototype.format = function(data) {
  var datas;
  if (Array.isArray(data)) {
    datas = data;
  } else if (data.datas == null) {
    datas = [data];
  } else {
    datas = data.datas;
  }
  for (var i in datas) {
    this.formatEntity(datas[i]);
  }
};

EntityRecursiveFormatter.prototype.formatEntity = function(entity) {
  if (entity != null && entity.children != null) {
    if (!Array.isArray(entity.children)) {
      throw new Error('children field must be array');
    }
    for (var i in entity.children) {
      this.formatEntity(entity.children[i]);
    }
  }
  this.fieldsFormatter.format(entity);
  if (this.childrenFormatter) {
    this.childrenFormatter.format(entity);
  }
};

function EntityFieldsSimplifier() {}
function EntityChildrenSimplifier() {}
function EntityFieldsUnsimplifier() {}

EntityFieldsSimplifier.prototype.format = function(data) {
  var res = {};
  if (data != null && data.fields != null) {
    if (!Array.isArray(data.fields)) {
      return;
      // throw new Error('fields must be array');
    }
    for (var i in data.fields) {
      var field = data.fields[i];
      res[field.name] = field.value;
    }
  }
  data.fields = res;
};

EntityChildrenSimplifier.prototype.format = function(data) {
  var res = {};
  if (data != null && data.children != null) {
    if (!Array.isArray(data.children)) {
      throw new Error('children field must be array');
    }
    for (var i in data.children) {
      var child = data.children[i];
      var childName = MDSCommon.getPathName(child.path)
      res[childName] = child;
    }
  }
  data.children = res;
};

EntityFieldsUnsimplifier.prototype.format = function(data) {
  var res = [];
  if (data != null && data.fields != null) {
    if (Array.isArray(data.fields)) {
      res.push(...data.fields);
    } else {
      for (var key in data.fields) {
        res.push({
          name: key,
          value: data.fields[key],
          type: 's'
        });
      }
    }
  }
  data.fields = res;
};

function EntitySimplifier() {
  EntityRecursiveFormatter.call(this, new EntityFieldsSimplifier());
}

function EntityUnsimplifier() {
  EntityRecursiveFormatter.call(this, new EntityFieldsUnsimplifier());
}

EntitySimplifier.prototype = Object.create(EntityRecursiveFormatter.prototype);
EntityUnsimplifier.prototype = Object.create(EntityRecursiveFormatter.prototype);




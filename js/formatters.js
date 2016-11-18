'use strict';

function EntitySimplifier() {
  this.fieldsSimplifier = new EntityFieldsSimplifier();
  // this.childrenSimplifier = new EntityChildrenSimplifier();
}

function EntityFieldsSimplifier() {}
// function EntityChildrenSimplifier() {}

EntityFieldsSimplifier.prototype.format = function(data) {
  var res = {};
  if (data != null && data.fields != null) {
    if (!Array.isArray(data.fields)) {
      throw new Error('fields field must be array, ' + (typeof data.fields) + ' received.');
    }
    for (let i in data.fields) {
      let field = data.fields[i];
      res[field.name] = field.value;
    }
  }
  data.fields = res;
};
//
// EntityChildrenSimplifier.prototype.format = function(data) {
//   var res = {};
//   if (data != null && data.children != null) {
//     if (!Array.isArray(data.children)) {
//       throw new Error('children field must be array');
//     }
//     for (let i in data.children) {
//       let child = data.children[i];
//       let childName = MDSCommon.getPathName(child.path)
//       res[childName] = child;
//     }
//   }
//   data.children = res;
// };

EntitySimplifier.prototype.format = function(data) {
  var datas;
  if (Array.isArray(data)) {
    datas = data;
  } else if (data.datas == null) {
    datas = [data];
  } else {
    datas = data.datas;
  }
  for (let i in datas) {
    this.formatEntity(datas[i]);
  }
};

EntitySimplifier.prototype.formatEntity = function(entity) {
  if (entity != null && entity.children != null) {
    if (!Array.isArray(entity.children)) {
      throw new Error('children field must be array');
    }
    for (let i in entity.children) {
      this.formatEntity(entity.children[i]);
    }
  }
  this.fieldsSimplifier.format(entity);
  // this.childrenSimplifier.format(entity);
};

function EntitySimplifier() {
  this.fieldsSimplifier = new EntityFieldsSimplifier();
  this.childrenSimplifier = new EntityChildrenSimplifier();
}

function EntityFieldsSimplifier() {}
function EntityChildrenSimplifier() {}

EntityFieldsSimplifier.prototype.format = function(data) {
  var res = {};
  if (data != null && data.fields != null) {
    if (!Array.isArray(data.fields)) {
      throw new Error('fields field must be array');
    }
    for (var field of data.fields) {
      res[field.name] = field.value;
    }
  }
  data.fields = res;
}

EntityChildrenSimplifier.prototype.format = function(data) {
  var res = {};
  if (data != null && data.children != null) {
    if (!Array.isArray(data.children)) {
      throw new Error('children field must be array');
    }
    for (var child of data.children) {
      var childName = common.getChildName(child.path)
      res[childName] = child;
    }
  }
  data.children = res;
}

EntitySimplifier.prototype.format = function(data) {
  var datas;
  if (Array.isArray(data)) {
    datas = data;
  } else if (data.datas == null) {
    datas = [data];
  } else {
    datas = data.datas;
  }
  for (let datum of datas) {
    this.formatEntity(datum);
  }
}

EntitySimplifier.prototype.formatEntity = function(entity) {
  if (entity != null && entity.children != null) {
    if (!Array.isArray(entity.children)) {
      throw new Error('children field must be array');
    }
    for (var child of entity.children) {
      this.formatEntity(child);
    }
  }
  this.fieldsSimplifier.format(entity);
  this.childrenSimplifier.format(entity);
}

function EntitySimplifier() {
  this.fieldsSimplifier = new EntityFieldsSimplifier();
  this.childrenSimplifier = new EntityChildrenSimplifier();
}

function EntityFieldsSimplifier() {}
function EntityChildrenSimplifier() {}

EntityFieldsSimplifier.prototype.format = function(data) {
  var res = {};
  if (common.isPresent(data.fields)) {
    for (var field of data.fields) {
      res[field.name] = field.value;
    }
  }
  data.fields = res;
}

EntityChildrenSimplifier.prototype.format = function(data) {
  var res = {};
  if (common.isPresent(data.children)) {
    for (var child of data.children) {
      var childName = common.getChildName(child.path)
      res[childName] = child;
    }
  }
  data.children = res;
}

EntitySimplifier.prototype.format = function(data) {
  var datas = data.datas == null ? [data] : data.datas;
  for (let datum of datas) {
    this.formatEntity(datum);
  }
}

EntitySimplifier.prototype.formatEntity = function(entity) {
  if (common.isPresent(entity.children)) {
    for (var child of entity.children) {
      this.formatEntity(child);
    }
  }
  this.fieldsSimplifier.format(entity);
  this.childrenSimplifier.format(entity);
}

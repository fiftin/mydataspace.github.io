/**
 * Created with JetBrains PhpStorm.
 * User: fifti
 * Date: 15.08.16
 * Time: 13:59
 * To change this template use File | Settings | File Templates.
 */
function EntityList() {

}

EntityList.prototype.onCreate = function(data) {
  var parentId = UIHelper.parentId(UIHelper.idFromData(data));
  var entity = UIHelper.entityFromData(data);
  if (this.getRootId() === parentId) {
    $$('entity_list').add(entity, 1);
    $$('entity_list').select(entity.id);
  }
};

EntityList.prototype.listen = function() {
  Mydataspace.on('entities.delete.res', function(data) {
    var entityId = UIHelper.idFromData(data);

    if ($$('entity_list').getFirstId() === entityId) { // Parent item "."
      return;
    }

    if ($$('entity_list').getItem(entityId) == null) {
      return;
    }

    if (entityId === this.getCurrentId()) { // Select other item if selected item is deleted.
      let nextId = $$('entity_list').getPrevId(entityId) || $$('entity_list').getNextId(entityId);
      $$('entity_list').select(nextId);
    }

    $$('entity_list').remove(entityId);
  }.bind(this));

  Mydataspace.on('entities.create.res', this.onCreate.bind(this));
};

EntityList.prototype.setRootId = function(id) {
  if (this.rootId === id) {
    return;
  }
  this.rootId = id;

  // var subscription = UIHelper.dataFromId(id);
  // var childrenSubscription = UIHelper.dataFromId(id);
  // childrenSubscription.path += '/*';
  // Mydataspace.emit('entities.subscribe', subscription);
  // Mydataspace.emit('entities.subscribe', childrenSubscription);

  this.refreshData();
};

EntityList.prototype.getRootId = function() {
  return this.rootId;
};

EntityList.prototype.setCurrentId = function(id) {
   this.currentId = id;
};

EntityList.prototype.getCurrentId = function() {
  return this.currentId;
};

/**
 * Reload data (from server) of entity list.
 * Uses entityList_fill internally.
 */
EntityList.prototype.refreshData = function() {
  var identity = UIHelper.dataFromId(this.getRootId());
  var search = $$('entity_list__search').getValue();
  if (common.isPresent(search)) {
    identity['filterByName'] = search;
  }
  $$('entity_list').disable();
  Mydataspace.request('entities.getChildren', identity, function(data) {
    var showMoreChildId =
      UIHelper.childId(this.getRootId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);
    var entityId = UIHelper.idFromData(data);
    var children = data.children.filter(x => x.root !== 'root' || x.path !== '').map(UIHelper.entityFromData);
    if (this.getRootId() === entityId) {
      if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
        children[children.length - 1] = {
          id: UIHelper.childId(entityId, UIHelper.ENTITY_LIST_SHOW_MORE_ID),
          value: STRINGS.SHOW_MORE
        }
      }
      this.fill(entityId, children);
      $$('entity_list').addCss(showMoreChildId, 'entity_list__show_more_item');
    }
    $$('entity_list').enable();
  }.bind(this), function(err) { UI.error(err); });
};

/**
 * Fills entity list by items from children array.
 *
 * @param parentEntityId Root entity (selected in entity tree).
 *                       Displays as '.' in entity list.
 * @param children Items of entity list.
 */
EntityList.prototype.fill = function(parentEntityId, children) {
  $$('entity_list').clearAll();
  for (var i in children) {
    $$('entity_list').add(children[i], -1);
  }
  $$('entity_list').add({ id: parentEntityId,  value: '.' }, 0);
  $$('entity_list').select(parentEntityId);
};

/**
 * Creates new entity by data received from the 'New Entity' form.
 * @param formData data received from form by method getValues.
 */
EntityList.prototype.createByFormData = function(formData) {
  var newEntityId = UIHelper.childId(this.getRootId(), formData.name);
  var data = UIHelper.dataFromId(newEntityId);
  data.fields = [];
  data.othersCan = formData.othersCan;
  Mydataspace.emit('entities.create', data);
};

EntityList.prototype.addChildren = function(children) {
  var showMoreChildId =
    UIHelper.childId(this.getRootId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);

  var startIndex;
  if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
    delete children[children.length - 1];
    startIndex = this.count() + 1;
  } else {
    $$('entity_list').remove(showMoreChildId);
    startIndex = this.count() + 2;
  }

  var offset = 0;
  for (var i in children) {
    $$('entity_list').add(children[i], startIndex + offset);
    offset++;
  }
};

EntityList.prototype.showMore = function() {
  var req = UIHelper.dataFromId(this.getRootId());
  req.offset = this.count();
  Mydataspace.request('entities.getChildren', req, function(data) {
    var children = data.children.map(UIHelper.entityFromData);
    this.addChildren(children);
  }.bind(this));
};

/**
 * Calculates number of items of entity list.
 * @returns {number} Number of items in entity list.
 */
EntityList.prototype.count = function() {
  var lastId = $$('entity_list').getLastId();
  var lastIndex = $$('entity_list').getIndexById(lastId);
  if (lastId.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID)) {
    return lastIndex - 1;
  }
  return lastIndex;
};

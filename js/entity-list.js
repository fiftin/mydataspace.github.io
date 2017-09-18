/**
 * Created with JetBrains PhpStorm.
 * User: fifti
 * Date: 15.08.16
 * Time: 13:59
 * To change this template use File | Settings | File Templates.
 */
function EntityList() {

}

/**
 * Hide/show toolbar buttons according passed state - readonly or not.
 */
EntityList.prototype.setReadOnly = function(isReadOnly) {
  $$('entity_tree__new_root_version_list').clearAll();
  $$('entity_tree__new_root_version_list').parse(UIControls.getChangeVersionPopupData(isReadOnly));
  UIHelper.setVisible('ADD_ENTITY_LABEL', !isReadOnly);
  UIHelper.setVisible('NEW_VERSION_LABEL', !isReadOnly && Identity.isRootId(this.getRootId()));
};


EntityList.prototype.onCreate = function(data) {
  var parentId = Identity.parentId(Identity.idFromData(data));
  var entity = Identity.entityFromData(data);
  if (this.getRootId() === parentId) {
    $$('entity_list').add(entity, 1);
    $$('entity_list').select(entity.id);
  }
};


EntityList.prototype.changeItems = function(applyForData) {
  var nextId;
  var id = $$('entity_list').getFirstId();
  while (id) {
    var index = $$('entity_list').getIndexById(id);
    $$('entity_list').copy(id, index, null, {
      newId: id === UIHelper.ENTITY_LIST_SHOW_MORE_ID
                    ? UIHelper.ENTITY_LIST_SHOW_MORE_ID
                    : Identity.idFromData(applyForData(Identity.dataFromId(id)))
    });
    nextId = $$('entity_list').getNextId(id);
    $$('entity_list').remove(id);
    id = nextId;
  }
};


/**
 * Listen delete/create/rename events to update items in list.
 */
EntityList.prototype.listen = function() {
  var self = this;

  Mydataspace.on('entities.delete.res', function(data) {
    var entityId = Identity.idFromData(data);

    if ($$('entity_list').getFirstId() === entityId) { // Parent item "."
      return;
    }

    if ($$('entity_list').getItem(entityId) == null) {
      return;
    }

    if (entityId === self.getCurrentId()) { // Select other item if selected item is deleted.
      var nextId = $$('entity_list').getPrevId(entityId) || $$('entity_list').getNextId(entityId);
      $$('entity_list').select(nextId);
    }

    $$('entity_list').remove(entityId);
  });

  Mydataspace.on('entities.create.res', self.onCreate.bind(this));
  Mydataspace.on('entities.rename.res', function(data) {
    self.changeItems(Identity.renameData.bind(null, data));
  });
};


/**
 * Set Id of entity witch items displayed in list. This method reloading data.
 */
EntityList.prototype.setRootIdWithoutRefresh = function(id) {
  if (this.rootId === id) {
    return;
  }

  if (this.rootId != null) {
    Mydataspace.emit('entities.unsubscribe', MDSCommon.extend(Identity.dataFromId(this.rootId), {
      events: ['entities.rename.res']
    }));
  }

  this.rootId = id;

  if (id != null) {
    Mydataspace.emit('entities.subscribe', MDSCommon.extend(Identity.dataFromId(id), {
      events: ['entities.rename.res']
    }));
  }
};


/**
 * Set Id of entity witch items displayed in list. This method reloading data.
 */
EntityList.prototype.setRootId = function(id) {
  this.setRootIdWithoutRefresh(id);
  this.refresh();
};


/**
 * Id of entity witch items displayed in list.
 */
EntityList.prototype.getRootId = function() {
  return this.rootId;
};


/**
 * Set item selected in list.
 */
EntityList.prototype.setCurrentId = function(id) {
  this.currentId = id;
};


/**
 * Get item selected in list.
 */
EntityList.prototype.getCurrentId = function() {
  return this.currentId;
};


/**
 * Reload data (from server) of entity list.
 * Uses entityList_fill internally.
 * @param {string} [newRootId]
 */
EntityList.prototype.refresh = function(newRootId) {
  var self = this;

  if (newRootId != null) {
    self.setRootIdWithoutRefresh(newRootId);
  }

  $$('entity_tree__new_entity_list').clearAll();
  $$('entity_tree__new_entity_list').parse(UIControls.getNewEntityPopupData(self.getRootId()));

  var req = Identity.dataFromId(self.getRootId());
  var search = $$('entity_list__search').getValue();

  if (MDSCommon.isPresent(search)) {
    if (search.indexOf('*') === search.length - 1) {
      req['filterByName'] = search.substring(0, search.length - 1);
    } else {
      req['search'] = search;
    }
  }
  $$('entity_list').disable();
  Mydataspace.request('entities.getChildren', req, function(data) {
    var showMoreChildId =
      Identity.childId(self.getRootId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);
    var entityId = Identity.idFromData(data);
    var children = data.children.filter(function(x) {
      return (x.root !== 'root' || x.path !== '') && UIHelper.IGNORED_PATHS.indexOf(x.path) < 0;
    }).map(Identity.entityFromData);
    if (self.getRootId() === entityId) {
      if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
        children[children.length - 1] = {
          id: Identity.childId(entityId, UIHelper.ENTITY_LIST_SHOW_MORE_ID),
          value: STRINGS.SHOW_MORE
        }
      }
      self.fill(entityId, children, data);
      $$('entity_list').addCss(showMoreChildId, 'entity_list__show_more_item');
    }
    self.setReadOnly(!data.mine);
    
    var versionLabel = $$('NEW_VERSION_LABEL');
    var versionLabelText = versionLabel.data.label.split('<span')[0];
    versionLabelText += '<span class="version_btn__version">' + (MDSCommon.findValueByName(data.fields, '$version') || 0) + '</span>';
    versionLabel.define('label', versionLabelText);
    versionLabel.refresh();

    $$('entity_list').enable();
  }, function(err) { UI.error(err); });
};


/**
 * Fills entity list by items from children array.
 *
 * @param parentEntityId Root entity (selected in entity tree).
 *                       Displays as '.' in entity list.
 * @param children Items of entity list.
 * @param data
 */
EntityList.prototype.fill = function(parentEntityId, children, data) {
  $$('entity_list').clearAll();
  for (var i in children) {
    $$('entity_list').add(children[i], -1);
  }
  $$('entity_list').add({ id: parentEntityId,  value: '.', count: data.numberOfChildren }, 0);
  $$('entity_list').select(parentEntityId);
};


/**
 * Creates new entity by data received from the 'New Entity' form.
 * @param formData data received from form by method getValues.
 */
EntityList.prototype.createByFormData = function(formData) {
  var newEntityId = Identity.childId(this.getRootId(), formData.name);
  var data = Identity.dataFromId(newEntityId);
  data.fields = [];
  data.othersCan = formData.othersCan;
  Mydataspace.emit('entities.create', data);
};


EntityList.prototype.addChildren = function(children) {
  var showMoreChildId =
    Identity.childId(this.getRootId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);

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
  var self = this;
  var req = Identity.dataFromId(this.getRootId());
  var search = $$('entity_list__search').getValue();
  if (MDSCommon.isPresent(search)) {
    req['search'] = search;
  }
  req.offset = self.count();
  $$('entity_list').disable();
  Mydataspace.request('entities.getChildren', req, function(data) {
    var children = data.children.filter(function(child) {
      return UIHelper.IGNORED_PATHS.indexOf(child.path) < 0;
    }).map(Identity.entityFromData);
    self.addChildren(children);
    $$('entity_list').enable();
  });
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

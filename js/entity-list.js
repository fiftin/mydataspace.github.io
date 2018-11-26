/**
 * Created with JetBrains PhpStorm.
 * User: fifti
 * Date: 15.08.16
 * Time: 13:59
 * To change this template use File | Settings | File Templates.
 */
function EntityList() {

}

EntityList.prototype.updateBreadcrumbs = function () {
  var breadcrumbs = document.getElementById('entity_list_breadcrumbs');
  if (!breadcrumbs) {
    return;
  }

  var data = Identity.dataFromId(this.getCurrentId());
  var items = [data.root].concat(data.path === '' ? [] : data.path.split('/'));
  var html = '';
  var id = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    if (i === 0) {
      id = item;
    } else if (i === 1) {
      id += ':' + item;
    } else {
      id += '/' + item;
    }

    var action = i === items.length - 1 ? '$$(\'entity_list_new_menu\').show(this);' : '$$(\'entity_tree\').select(\'' + id + '\'); return false;';

    html += (i === 0 ? '' : '<span class="admin-breadcrumbs__separator"><i class="fa fa-angle-right"></i></span>') +
      '<a href="javascript: void(0);" class="admin-breadcrumbs__link" onclick="' + action + '">' +
        item +
        (i === items.length - 1 ? '<i style="margin-left: 5px;" class="fa fa-caret-down"></i>' : '') +
      '</a>';
  }
  breadcrumbs.innerHTML = html;
};

/**
 * Hide/show toolbar buttons according passed state - readonly or not.
 */
EntityList.prototype.setReadOnly = function(isReadOnly) {
  $$('entity_tree__new_root_version_list').clearAll();
  $$('entity_tree__new_root_version_list').parse(UIControls.getChangeVersionPopupData(isReadOnly));
  UIHelper.setVisible('NEW_VERSION_LABEL', !isReadOnly && Identity.isWebsiteId(this.getCurrentId()));
  this.isReadOnly = isReadOnly;
};

/**
 * Listen delete/create/rename events to update items in list.
 */
EntityList.prototype.listen = function() {
  var self = this;

  Mydataspace.on('entities.delete.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var entityId = Identity.idFromData(data);

      if ($$('entity_list').getFirstId() === entityId) { // Parent item "."
        self.setCurrentId(null);
        return;
      }

      if ($$('entity_list').getItem(entityId) == null) {
        return;
      }

      // ignore event if root item deleted
      if (entityId === self.getCurrentId()) {
        this.setCurrentId(null);
        return;
      }

      if (entityId === self.getSelectedId()) { // Select other item if selected item is deleted.
        var nextId = $$('entity_list').getPrevId(entityId) || $$('entity_list').getNextId(entityId);
        $$('entity_list').select(nextId);
      }

      $$('entity_list').remove(entityId);
    }
  });

  Mydataspace.on('entities.create.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var parentId = Identity.parentId(Identity.idFromData(data));
      var entity = Identity.entityFromData(data);
      if (self.getCurrentId() === parentId) {
        if ($$('entity_list').getItem(entity.id)) {
          continue;
        }
        $$('entity_list').add(entity, 1);
        $$('entity_list').select(entity.id);
      }
    }
  });

  Mydataspace.on('entities.rename.res', function(data) {
    var id = Identity.idFromData(data);
    if ($$('entity_list').getFirstId() === id) { // can't rename ".." (current) entity, which children displayed in list
      return;
    }

    var item = $$('entity_list').getItem(id);

    if (!item) {
      return;
    }

    var index = $$('entity_list').getIndexById(id);
    var entity = Identity.entityFromData(MDSCommon.extend(item.associatedData, {
      path: MDSCommon.getChildPath(MDSCommon.getParentPath(item.associatedData.path), data.name)
    }));

    $$('entity_list').add(entity, index);
    $$('entity_list').remove(id);
  });
};


/**
 * Set Id of entity witch items displayed in list. This method reloading data.
 */
EntityList.prototype.setCurrentIdWithoutRefresh = function(id) {
  this.currentId = id;
};


/**
 * Set Id of entity witch items displayed in list. This method reloading data.
 */
EntityList.prototype.setCurrentId = function(id) {
  this.setCurrentIdWithoutRefresh(id);
  this.refresh();
};


/**
 * Id of entity witch items displayed in list.
 */
EntityList.prototype.getCurrentId = function() {
  return this.currentId;
};



/**
 * Get item selected in list.
 */
EntityList.prototype.getSelectedId = function() {
  return $$('entity_list').getSelectedId();
};


/**
 * Reload data (from server) of entity list.
 * Uses entityList_fill internally.
 * @param {string} [newRootId]
 */
EntityList.prototype.refresh = function(newRootId) {
  var self = this;

  if (newRootId != null) {
    self.setCurrentIdWithoutRefresh(newRootId);
  }

  if (self.getCurrentId() == null) {
    return;
  }

  self.updateBreadcrumbs();

  $$('entity_tree__new_entity_list').clearAll();
  $$('entity_tree__new_entity_list').parse(UIControls.getNewEntityPopupData(self.getCurrentId()));

  var req = Identity.dataFromId(self.getCurrentId());
  var search = $$('entity_list__search').getValue();

  if (MDSCommon.isPresent(search)) {
    if (search.indexOf('*') === search.length - 1) {
      req['filterByName'] = search.substring(0, search.length - 1);
    } else {
      req['search'] = search;
    }
  }
  req.children = true;
  req.orderChildrenBy = '$createdAt DESC';

  $$('entity_list').disable();
  Mydataspace.request('entities.get', req, function(data) {
    if (!self.getCurrentId()) {
      $$('entity_list').enable();
      return;
    }
    var showMoreChildId =
      Identity.childId(self.getCurrentId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);


    var entityId = Identity.idFromData(data);
    var children = data.children.filter(function(x) {
      return (x.root !== 'root' || x.path !== '') &&
        UIConstants.IGNORED_PATHS.indexOf(x.path) < 0 &&
        (UIConstants.IGNORED_WHEN_EMPTY_PATHS.indexOf(x.path) < 0);
    }).map(Identity.entityFromData);
    if (self.getCurrentId() === entityId) {
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
  }, function(err) {
    $$('entity_list').enable();
    UI.error(err);
  });
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


EntityList.prototype.addChildren = function(children) {
  var showMoreChildId =
    Identity.childId(this.getCurrentId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);

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
  var req = Identity.dataFromId(this.getCurrentId());
  var search = $$('entity_list__search').getValue();
  if (MDSCommon.isPresent(search)) {
    req['search'] = search;
  }
  req.offset = self.count();
  req.children = true;
  $$('entity_list').disable();
  Mydataspace.request('entities.get', req, function(data) {
    var children = data.children.filter(function(child) {
      return UIConstants.IGNORED_PATHS.indexOf(child.path) < 0;
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
  if (UIHelper.isListShowMore(lastId)) {
    return lastIndex - 1;
  }
  return lastIndex;
};

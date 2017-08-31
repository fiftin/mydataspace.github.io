function EntityTree() {

}

EntityTree.prototype.setReadOnly = function(isReadOnly) {
  if (isReadOnly) {
    $$('ADD_ROOT_LABEL').hide();
  } else {
    $$('ADD_ROOT_LABEL').show();
  }
};

EntityTree.prototype.getCurrentId = function() {
  return this.currentId;
};

EntityTree.prototype.setCurrentId = function(id) {
  if (this.currentId != null) {
    Mydataspace.emit('entities.unsubscribe', MDSCommon.extend(Identity.dataFromId(this.currentId), {
      events: ['entities.changes.res', 'entities.rename.res']
    }));
  }

  this.currentId = id;

  if (id != null) {
    Mydataspace.emit('entities.subscribe', MDSCommon.extend(Identity.dataFromId(id), {
      events: ['entities.changes.res', 'entities.rename.res']
    }));
  }
};

EntityTree.prototype.resolveChildren = function(id) {
  return new Promise(function(resolve, reject) {
    var firstChildId = $$('entity_tree').getFirstChildId(id);
    if (firstChildId != null && firstChildId !== Identity.childId(id, UIHelper.ENTITY_TREE_DUMMY_ID)) {
      resolve();
      return;
    }
    // Load children to first time opened node.
    Mydataspace.request('entities.getChildren', Identity.dataFromId(id), function(data) {
      var entityId = Identity.idFromData(data);
      var children = data.children.filter(function(x) {
        return (x.root !== 'root' || x.path !== '') && UIHelper.IGNORED_PATHS.indexOf(x.path) < 0;
      }).map(Identity.entityFromData);
      UI.entityTree.setChildren(entityId, children);
      resolve();
    }, function(err) {
      reject(err);
    });
  });
};

EntityTree.prototype.setCurrentIdToFirst = function() {
  var firstId = $$('entity_tree').getFirstId();
  this.setCurrentId(firstId);
  return firstId;
};

EntityTree.prototype.onCreate = function(data) {
  var parentId = Identity.parentId(Identity.idFromData(data));
  var entity = Identity.entityFromData(data);
  if (parentId === 'root') {
    $$('entity_tree').remove(entity.id);
    $$('entity_tree').add(entity, 0);
    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      this.setChildren(entity.id, entity.data);
    }
    $$('entity_tree').select(entity.id);
    UI.entityList.refreshData();
  } else if (!MDSCommon.isNull($$('entity_tree').getItem(parentId)) &&
    MDSCommon.isNull($$('entity_tree').getItem(Identity.childId(parentId, UIHelper.ENTITY_TREE_DUMMY_ID)))) {
    $$('entity_tree').add(entity, 0, parentId);
    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      this.setChildren(entity.id, entity.data);
    }
    this.resolveChildren(parentId).then(function() {
      $$('entity_tree').open(entity.id);
    });
  }
};

/**
 * Initializes event listeners.
 */
EntityTree.prototype.listen = function() {
  var self = this;
  Mydataspace.on('entities.delete.res', function(data) {
    var entityId = Identity.idFromData(data);

    if ($$('entity_tree').getItem(entityId) == null) {
      return;
    }

    if (entityId === self.getCurrentId()) { // Select other item if selected item is deleted.
      var nextId = $$('entity_tree').getPrevSiblingId(entityId) ||
                   $$('entity_tree').getNextSiblingId(entityId) ||
                   $$('entity_tree').getParentId(entityId);
      $$('entity_tree').select(nextId);
    }

    $$('entity_tree').remove(entityId);
  });

  Mydataspace.on('entities.create.res', this.onCreate.bind(this));
  Mydataspace.on('entities.change.res', function(data) {
    var id = Identity.idFromData(data);
    if (id !== self.currentId) {
      return;
    }
    if ($$('entity_tree').getItem(id) == null) {
      return;
    }
    $$('entity_tree').updateItem(id, Identity.entityFromData(data));
  });

  Mydataspace.on('entities.rename.res', function(data) {
    var id = Identity.idFromData(data);
    if (id !== self.currentId) {
      return;
    }

    if ($$('entity_tree').getItem(id) == null) {
      return;
    }

    var parentId = $$('entity_tree').getParentId(id);

    var newId = self.cloneItem(id, parentId, Identity.renameData.bind(null, data));

    self.setCurrentId(newId);
    $$('entity_tree').remove(id);
  });
};

/**
 * Create a copy of entity with all children.
 * @param id            Id of entity for clone.
 * @param parentId      Id of entity witch must be parent of created copy.
 * @param applyForData
 */
EntityTree.prototype.cloneItem = function(id, parentId, applyForData) {
  var currentParentId = $$('entity_tree').getParentId(id);
  var index = $$('entity_tree').getIndexById(id);

  if (MDSCommon.isPresent(currentParentId) && currentParentId !== 0) {
    var dummyId = Identity.childId(currentParentId, UIHelper.ENTITY_TREE_DUMMY_ID);
    var showMoreId = Identity.childId(currentParentId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
    var newSyntheticId;
    switch (id) {
      case dummyId:
        newSyntheticId = Identity.childId(parentId, UIHelper.ENTITY_TREE_DUMMY_ID);
        break;
      case showMoreId:
        newSyntheticId = Identity.childId(parentId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
        break;
    }
  }

  if (newSyntheticId != null) {
    $$('entity_tree').copy(id, index, null, {
      newId: newSyntheticId,
      parent: parentId
    });
    return;
  }

  var item = $$('entity_tree').getItem(id);
  var data = applyForData(item.associatedData);
  var newId = $$('entity_tree').add(Identity.entityFromData(data), index, parentId);
  var childId = $$('entity_tree').getFirstChildId(id);
  while (childId) {
    this.cloneItem(childId, newId, applyForData);
    childId = $$('entity_tree').getNextSiblingId(childId);
  }
  return newId;
};

EntityTree.getViewOnlyRoot = function() {
  return window.location.hash.substring(1).split('/')[0];
};

EntityTree.prototype.handleFormattedData = function(formattedData) {
  $$('entity_tree').clearAll();
  this.currentId = null;
  $$('entity_tree').parse(formattedData);
  $$('entity_tree').enable();
};

EntityTree.prototype.requestRoots = function(onlyMine, reqData, selectedId) {
  var req = onlyMine ? 'entities.getMyRoots' : 'entities.getRoots';
  var self = this;
  Mydataspace.request(req, reqData, function(data) {
    // convert received data to treeview format and load its to entity_tree.
    self.handleFormattedData(data['roots'].map(Identity.entityFromData));
    if (selectedId) {
      self.setCurrentId(selectedId);
    }
    UI.pages.updatePageState('data');
  }, function(err) {
    UI.error(err);
    $$('entity_tree').enable();
  });
};

EntityTree.prototype.updateRouteBySearch = function() {
  // var search = $$('entity_tree__search').getValue();
  // var icon = $$('entity_tree__root_scope')._settings['icon'];
  // if (icon === 'database' && search === '') {
  //   return;
  // }
  // switch (icon) {
  //   case 'user':
  //     if (MDSCommon.isBlank(search)) {
  //       search = 'me:*';
  //     } else {
  //       search = 'me:*' + search + '*';
  //     }
  //     break;
  //   case 'globe':
  //     if (MDSCommon.isBlank(search)) {
  //       search = '*';
  //     } else {
  //       search = '*' + search + '*';
  //     }
  //     break;
  //   case 'database':
  //     break;
  // }
  // var prefix = '';
  // var lang = localStorage.getItem('language');
  // if (MDSCommon.isPresent(lang) && lang.toLowerCase() !== 'en') {
  //   prefix = '/' + lang.toLowerCase();
  // }
  // window.location.href = prefix + '/#' + search;
};

EntityTree.prototype.refresh = function(root) {
  var self = this;
  $$('entity_tree').disable();

  if (MDSCommon.isBlank(root) && Router.isEmpty()) {
    if (Mydataspace.isLoggedIn()) {
      self.requestRoots(true, {});
    }
  } else if (MDSCommon.isBlank(root) && Router.isSearch()) {
    self.requestRoots(Router.isMe(), {
      search: Router.getSearch()
    });
  } else if (MDSCommon.isBlank(root)  && Router.isFilterByName()) {
    self.requestRoots(Router.isMe(), {
      filterByName: Router.getSearch()
    });
  } else if (MDSCommon.isPresent(root)  || Router.isRoot()) {
    var requiredRoot = root || Router.getSearch();
    Mydataspace.request('entities.get', {
      root: requiredRoot,
      path: ''
    }, function(data) {
      // if (data.mine) {
      //   self.requestRoots(true, {}, data.root);
      // } else {
        // convert received data to treeview format and load its to entity_tree.
        self.handleFormattedData([Identity.entityFromData(data)]);
      // }
      UI.pages.updatePageState('data');
    }, function(err) {
      if (err.message === "Cannot read property 'Entity' of undefined") {
        UI.entityTree.refresh('notfound');
        return;
      }
      UI.error(err);
      $$('entity_tree').enable();
    });
  }
};

/**
 * Override entity's children recursively.
 */
EntityTree.prototype.setChildren = function(entityId, children) {
  var self = this;
  var dummyChildId = Identity.childId(entityId, UIHelper.ENTITY_TREE_DUMMY_ID);
  var showMoreChildId = Identity.childId(entityId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
  var firstChildId = $$('entity_tree').getFirstChildId(entityId);
  if (firstChildId != null && firstChildId !== dummyChildId) {
    return;
  }
  if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
    children[children.length - 1] = {
      id: Identity.childId(entityId, UIHelper.ENTITY_TREE_SHOW_MORE_ID),
      value: STRINGS.SHOW_MORE
    }
  }
  children.reverse().forEach(function(entity) {
    $$('entity_tree').add(entity, 0, entityId);
    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }
  });
  if (firstChildId !== null) {
    $$('entity_tree').remove(firstChildId);
  }
  $$('entity_tree').addCss(showMoreChildId, 'entity_tree__show_more_item');
};

/**
 *
 * @param entityId
 * @param children
 */
EntityTree.prototype.addChildren = function(entityId, children) {
  var self = this;
  var showMoreChildId = Identity.childId(entityId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
  if (!$$('entity_tree').exists(showMoreChildId)) {
    return;
  }
  var offset;
  if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
    delete children[children.length - 1];
    offset = 1;
  } else {
    $$('entity_tree').remove(showMoreChildId);
    offset = 0;
  }
  children.forEach(function(entity) {
    var nChildren = self.numberOfChildren(entityId);
    $$('entity_tree').add(entity, nChildren - offset, entityId);
    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }
  });
};

/**
 * Request and and add more items to entity.
 * @param id Id of parent entity.
 */
EntityTree.prototype.showMore = function(id) {

  var self = this;
  var req = Identity.dataFromId(id);
  req.offset = self.numberOfChildren(id);
  Mydataspace.request('entities.getChildren', req, function(data) {
    var entityId = Identity.idFromData(data);
    var children = data.children.filter(function(child) {
      return UIHelper.IGNORED_PATHS.indexOf(child.path) < 0;
    }).map(Identity.entityFromData);
    self.addChildren(entityId, children);
  });
};

EntityTree.prototype.numberOfChildren = function(id) {
  var n = 0;
  var prevChildId = null;
  var childId = $$('entity_tree').getFirstChildId(id);
  while (childId != null && prevChildId !== childId) {
    n++;
    prevChildId = childId;
    childId = $$('entity_tree').getNextSiblingId(childId);
  }
  return n;
};

EntityTree.prototype.lastChildId = function(id) {
  var prevChildId = null;
  var childId = $$('entity_tree').getFirstChildId(id);
  while (childId != null && prevChildId !== childId) {
    prevChildId = childId;
    childId = $$('entity_tree').getNextSiblingId(childId);
  }
  return prevChildId;
};

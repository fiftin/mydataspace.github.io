function EntityTree() {
}


/**
 *
 * @param entityIdOrData
 * @param isReturnId
 * @returns {*}
 */
EntityTree.prototype.findRoot = function(entityIdOrData, isReturnId) {
  var wantedData = typeof entityIdOrData === 'string' ? Identity.dataFromId(entityIdOrData) : entityIdOrData;
  var id = $$('entity_tree').getFirstId();
  var data = Identity.dataFromId(id);
  while (data.root !== wantedData.root) {
    id = $$('entity_tree').getNextSiblingId(id);
    if (!id) {
      return null;
    }
    data = Identity.dataFromId(id);
  }
  return isReturnId ? id : data;
};


EntityTree.prototype.setReadOnly = function(isReadOnly) {
  UIHelper.setVisible('ADD_ROOT_LABEL', !isReadOnly);
};


EntityTree.prototype.getCurrentId = function() {
  return this.currentId;
};


EntityTree.prototype.setCurrentId = function(id) {
  // if (this.currentId != null) {
  //   var unsubscribeData = MDSCommon.extend(Identity.dataFromId(this.currentId));
  //   Mydataspace.request('entities.unsubscribe', unsubscribeData);
  //   if (unsubscribeData.path !== '') {
  //     unsubscribeData.path += '/';
  //   }
  //   unsubscribeData.path += '*';
  //   Mydataspace.request('entities.unsubscribe', unsubscribeData);
  // }

  this.currentId = id;

  if (id != null) {
    var subscribeData = MDSCommon.extend(Identity.dataFromId(id));
    Mydataspace.request('entities.subscribe', subscribeData);
    if (subscribeData.path !== '') {
      subscribeData.path += '/';
    }
    subscribeData.path += '*';
    Mydataspace.request('entities.subscribe', subscribeData);
  }
};



EntityTree.prototype.createNewEmptyVersion = function(description) {
  var self = this;
  var currentData = Identity.dataFromId(UI.entityTree.currentId);

  return Mydataspace.entities.create({
    root: currentData.root,
    path: '',
    version: currentData.version,
    fields: [
      { name: '$newVersion', value: true, type: 'b' },
      { name: '$newVersionDescription', value: description, type: 's' }
    ]
  }).then(function(data) {
    var entity = Identity.entityFromData(data);
    var oldVersion = MDSCommon.findValueByName(data.fields || [], '$oldVersion');

    var oldId;
    if (oldVersion != null) {
      oldId = oldVersion === 0 ? data.root : data.root + '?' + oldVersion;
    }

    var i = 0;
    if (oldId != null && $$('entity_tree').getItem(oldId)) {
      i = $$('entity_tree').getBranchIndex(oldId);
    }

    if (oldId) {
      $$('entity_tree').remove(oldId);
    }

    $$('entity_tree').add(entity, i, null);

    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }

    $$('entity_tree').select(entity.id);
    $$('entity_tree').open(entity.id);
    UI.entityList.refresh(entity.id);
    UI.entityForm.refresh();
  });
};

/**
 * Change current version of root.
 * @param {string} rootId Existing Root ID which version you want to change.
 * @param {int} version Version you want to have.
 */
EntityTree.prototype.changeCurrentRootVersion = function(rootId, version) {
  var rootData = Identity.dataFromId(UI.entityList.getRootId());
  var self = this;
  Mydataspace.entities.change({
    root: rootData.root,
    path: '',
    version: rootData.version,
    fields: [{ name: '$version', value: version, type: 'i' }]
  }).then(function(data) {
    var entity = Identity.entityFromData(data);
    var i = $$('entity_tree').getBranchIndex(rootId);
    $$('entity_tree').remove(rootId);
    $$('entity_tree').add(entity, i, null);
    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }
    $$('entity_tree').select(entity.id);
    $$('entity_tree').open(entity.id);
    UI.entityList.refresh(entity.id);
    UI.entityForm.refresh();
  }).catch(function(err) {
    UI.error(err);
  });
};


/**
 * View another version of passed root.
 * @param {string} rootId Existing Root ID which version you want to view.
 * @param {int} version Version you want to view.
 */
EntityTree.prototype.viewRootVersion = function(rootId, version) {
  var data = Identity.dataFromId(rootId);
  var self = this;
  Mydataspace.entities.get({
    root: data.root,
    path: '',
    version: version,
    children: true
  }).then(function(data) {
    var entity = Identity.entityFromData(data);


    var i = $$('entity_tree').getBranchIndex(rootId);

    $$('entity_tree').remove(rootId);

    $$('entity_tree').add(entity, i, null);


    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }

    $$('entity_tree').select(entity.id);
    $$('entity_tree').open(entity.id);
    UI.entityList.refresh(entity.id);
    UI.entityForm.refresh();

  }).catch(function(err) {
    UI.error(err);
  });
};


/**
 * Check if children of entity are loaded.
 * Load children from server if children didn't loaded yet.
 * @param id Parent entity ID
 */
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
        return (x.root !== 'root' || x.path !== '') && UIConstants.IGNORED_PATHS.indexOf(x.path) < 0;
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


/**
 * Initializes event listeners.
 */
EntityTree.prototype.listen = function() {
  var self = this;

  Mydataspace.on('entities.create.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var parentId = Identity.parentId(Identity.idFromData(data));
      var entity = Identity.entityFromData(data);
      var oldVersion = MDSCommon.findValueByName(data.fields || [], '$oldVersion');

      if (oldVersion == null &&
        $$('entity_tree').getItem(Identity.childId(parentId, UIHelper.ENTITY_TREE_DUMMY_ID)) == null) {

        // simply add new entity to tree and no more
        $$('entity_tree').add(entity, 0, parentId === 'root' ? null : parentId);

        if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
          self.setChildren(entity.id, entity.data);
        }

        if (parentId === 'root') {
          $$('entity_tree').select(entity.id);
          $$('entity_tree').open(entity.id);
        }

        self.resolveChildren(entity.id).then(function() { $$('entity_tree').open(entity.id); });
      }
    }
  });


  Mydataspace.on('entities.delete.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var entityId;
      if (data.path === '') {
        var rootData = self.findRoot(data);
        if (rootData == null) {
          return;
        }
        entityId = Identity.idFromData(MDSCommon.extend(data, {version: rootData.version}));
      } else {
        entityId = Identity.idFromData(data);
        if ($$('entity_tree').getItem(entityId) == null) {
          return;
        }
      }

      if (entityId === self.getCurrentId()) { // Select other item if selected item is deleted.
        var nextId = $$('entity_tree').getPrevSiblingId(entityId) ||
          $$('entity_tree').getNextSiblingId(entityId) ||
          $$('entity_tree').getParentId(entityId);
        if (nextId) {
          $$('entity_tree').select(nextId);
    }
      }

      $$('entity_tree').remove(entityId);
    }
  });


  Mydataspace.on('entities.change.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var oldVersion = MDSCommon.findValueByName(data.fields || [], '$oldVersion');

      // User only changed current version. Ignore it.
      if (data.path === '' && oldVersion != null) {
        return;
      }

      // Update changed entity view
      var entity = Identity.entityFromData(data);
      var item = $$('entity_tree').getItem(entity.id);
      if (item == null) {
        return;
      }
      $$('entity_tree').updateItem(entity.id, entity);
    }
  });


  Mydataspace.on('entities.rename.res', function(data) {
    var rootData = self.findRoot(data);
    if (rootData == null) {
      return;
    }

    var id = Identity.idFromData(MDSCommon.extend(data, { version: rootData.version }));
    if ($$('entity_tree').getItem(id) == null) {
      return;
    }

    var parentId = $$('entity_tree').getParentId(id);
    var newId = self.cloneItem(id, parentId, Identity.renameData.bind(null, data));
    if (self.getCurrentId() === id) {
      self.setCurrentId(newId);
      $$('entity_tree').select(newId);
    }

    $$('entity_tree').remove(id);

    var subscribeData = MDSCommon.permit(data, ['root', 'path']);
    //Mydataspace.entities.unsubscribe(subscribeData);
    Mydataspace.entities.subscribe(MDSCommon.extend(subscribeData, { path: MDSCommon.getChildPath(MDSCommon.getParentPath(data.path), data.name) }));
    if (subscribeData.path != '') {
      subscribeData.path += '/';
    }
    subscribeData.path += '*';
    //Mydataspace.entities.unsubscribe(subscribeData);
    Mydataspace.entities.subscribe(MDSCommon.extend(subscribeData, { path: MDSCommon.getChildPath(MDSCommon.getParentPath(data.path), data.name) }));
  });
};


/**
 * Create a copy of entity with all children.
 * @param {string} id               Id of entity for clone.
 * @param {string} parentId         Id of entity witch must be parent of created copy.
 * @param {function} applyForData   Function applied for associatedData of each entity.
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


// EntityTree.getViewOnlyRoot = function() {
//   return window.location.hash.substring(1).split('/')[0];
// };


/**
 * Load data to Tree component.
 * @param formattedData Data which should be loaded.
 */
EntityTree.prototype.loadFormattedData = function(formattedData) {
  $$('entity_tree').clearAll();
  this.currentId = null;
  $$('entity_tree').parse(formattedData);
  $$('entity_tree').enable();
};


EntityTree.prototype.requestRoots = function(onlyMine, reqData, selectedId) {
  var req = onlyMine ? 'entities.getMyRoots' : 'entities.getRoots';
  var self = this;
  Mydataspace.request(req, reqData, function(data) {
    // convert received data to TreeView format and load its to entity_tree.
    self.loadFormattedData(data['roots'].map(Identity.entityFromData));
    if (selectedId) {
      self.setCurrentId(selectedId);
    }
    UI.pages.updatePageState('data');
  }, function(err) {
    UI.error(err);
    $$('entity_tree').enable();
  });
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
    var search = Router.getSearch();
    if (Array.isArray(search)) {
      search = search[0];
    }
    var requiredRoot = root || search;
    Mydataspace.request('entities.get', {
      root: requiredRoot,
      path: '',
      version: Router.getVersion()
    }, function(data) {
      self.loadFormattedData([Identity.entityFromData(data)]);
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
      return UIConstants.IGNORED_PATHS.indexOf(child.path) < 0;
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

/**
 * Find last child ID
 * @param {string} parentId ID of entity which last child you want to find
 * @returns {*} Last child ID or null
 */
EntityTree.prototype.lastChildId = function(parentId) {
  var prevChildId = null;
  var childId = $$('entity_tree').getFirstChildId(parentId);
  while (childId != null && prevChildId !== childId) {
    prevChildId = childId;
    childId = $$('entity_tree').getNextSiblingId(childId);
  }
  return prevChildId;
};

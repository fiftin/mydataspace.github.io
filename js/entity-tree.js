/**
 * @class
 */
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

EntityTree.prototype.getSelectedId = function() {
  return $$('entity_tree').getSelectedId();
};


EntityTree.prototype.setCurrentId = function(id) {
  if (this.currentId != null) {
    var unsubscribeData = MDSCommon.extend(Identity.dataFromId(this.currentId));
    Mydataspace.entities.subscribe(unsubscribeData);
    if (unsubscribeData.path !== '') {
      unsubscribeData.path += '/';
    }
    unsubscribeData.path += '*';
    Mydataspace.entities.subscribe(unsubscribeData);
  }

  this.currentId = id;

  if (id != null) {
    var subscribeData = MDSCommon.extend(Identity.dataFromId(id));
    Mydataspace.entities.subscribe(subscribeData);
    if (subscribeData.path !== '') {
      subscribeData.path += '/';
    }
    subscribeData.path += '*';
    Mydataspace.entities.subscribe(subscribeData);
  }
};

EntityTree.prototype.createNewEmptyVersion = function(description) {
  var self = this;
  var currentData = Identity.dataFromId(UI.entityTree.currentId);

  return Mydataspace.entities.create({
    sourceRoot: currentData.root,
    sourcePath: '',
    sourceVersion: currentData.version,
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
  var rootData = Identity.dataFromId(UI.entityList.getCurrentId());
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
 * View another version of passed website.
 * @param {string} rootId Existing Root ID which version you want to view.
 * @param {int} version Version you want to view.
 */
EntityTree.prototype.viewRootVersion = function(oldWebsiteId, version) {
  var rootData = Identity.dataFromId(oldWebsiteId);
  var self = this;
  Mydataspace.entities.get({
    root: rootData.root,
    path: 'website',
    version: version,
    children: true
  }).then(function(data) {
    var entity = Identity.entityFromData(data);

    var i = $$('entity_tree').getBranchIndex(oldWebsiteId);

    $$('entity_tree').remove(oldWebsiteId);

    $$('entity_tree').add(entity, i, Identity.rootId(oldWebsiteId));

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
 * @param {string} id Parent entity ID
 * @param {boolean} [selectIndexFile]
 */
EntityTree.prototype.resolveChildren = function(id, selectIndexFile) {
  return new Promise(function(resolve, reject) {
    var firstChildId = $$('entity_tree').getFirstChildId(id);
    if (firstChildId != null && firstChildId !== Identity.childId(id, UIHelper.ENTITY_TREE_DUMMY_ID)) {
      resolve();
      return;
    }
    // Load children to first time opened node.
    Mydataspace.request('entities.get', MDSCommon.extend(Identity.dataFromId(id), { children: true }), function(data) {
      var entityId = Identity.idFromData(data);

      var files = data.fields.filter(function (field) { return field.name.indexOf('.') >= 0; }).map(function (field) {
        return {
          id: entityId + '#' + field.name,
          value: field.name,
          associatedData: {},
          data: {}
        };
      });

      var children = data.children.filter(function(x) {
        return (x.root !== 'root' || x.path !== '') && UIConstants.IGNORED_PATHS.indexOf(x.path) < 0;
      }).map(Identity.entityFromData);

      UI.entityTree.setChildren(id, files.concat(children));

      if (selectIndexFile) {
        for (var i in files) {
          if (/^index\.[\w-]+$/.test(files[i].value)) {
            $$('entity_tree').select(files[i].id);
            break;
          }
        }
      }

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

      if (parentId !== 'root' && $$('entity_tree').getItem(parentId) == null) {
        continue;
      }

      var entity = Identity.entityFromData(data);

      if ($$('entity_tree').getItem(entity.id) != null) {
        // already exists
        continue;
      }

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


      // Update files in directory has been opened

      var dummyChildId = Identity.childId(entity.id, UIHelper.ENTITY_TREE_DUMMY_ID);
      var firstChildId = $$('entity_tree').getFirstChildId(entity.id);
      if (firstChildId != null && firstChildId === dummyChildId) {
        continue;
      }

      var currentFileIds = self.getFileIds(entity.id);

      res.fields.forEach(function (field) {
        if (field.name.indexOf('.') === -1) {
          return;
        }
        var fileId = entity.id + '#' + field.name;

        var currentFileIndex = currentFileIds.indexOf(fileId);

        if (currentFileIndex >= 0) {
          currentFileIds.splice(currentFileIndex, 1);
          return;
        }

        $$('entity_tree').add({
          id: fileId,
          value: field.name,
          associatedData: {},
          data: {}
        }, 0, entity.id);
      });

      currentFileIds.forEach(function (fileId) {
        $$('entity_tree').remove(fileId);
        if ($$('script_editor_' + fileId)) {
          $$('script_editor').removeView('script_editor_' + fileId);
        }
      });
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

  return Mydataspace.request(req, reqData).then(function(data) {
    // convert received data to TreeView format and load its to entity_tree.
    self.loadFormattedData(data['roots'].map(Identity.entityFromData));
    if (selectedId) {
      self.setCurrentId(selectedId);
    }
    UI.pages.updatePageState('data');
    return data;
  }, function(err) {
    UI.error(err);
    $$('entity_tree').enable();
  });
};


EntityTree.prototype.refresh = function(root) {
  var self = this;
  $$('entity_tree').disable();

  var newRootSkeleton = Router.getNewRootSkeleton();
  if (newRootSkeleton) {
    if (Mydataspace.isLoggedIn()) {
      Router.clear();
      self.requestRoots(true, {}).then(function (data) {
        if (!data) {
          return;
        }
        var prefix = '';
        if (MDSCommon.isPresent(data.roots)) {
          $$('add_root_window').show();
          prefix = '2';
        }
        no_items__selectTemplate(newRootSkeleton, prefix);
      });
    }
  } else if (MDSCommon.isBlank(root) && Router.isEmpty()) {
    if (Mydataspace.isLoggedIn()) {
      self.requestRoots(true, {});
    }
  } else if (MDSCommon.isBlank(root) && Router.isSearch()) {
    self.requestRoots(Router.isMe(), {
      search: Router.getSearch()
    });
  } else if (MDSCommon.isBlank(root) && Router.isFilterByName()) {
    self.requestRoots(Router.isMe(), {
      filterByName: Router.getSearch()
    });

  } else if (MDSCommon.isPresent(root) || Router.isRoot()) {
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
  req.children = true;
  Mydataspace.request('entities.get', req, function(data) {
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

EntityTree.prototype.getFileIds = function (id) {
  var ret = [];
  var prevChildId = null;
  var childId = $$('entity_tree').getFirstChildId(id);
  while (childId != null && prevChildId !== childId && Identity.isFileId(childId)) {
    ret.push(childId);
    prevChildId = childId;
    childId = $$('entity_tree').getNextSiblingId(childId);
  }
  return ret;
};


EntityTree.prototype.editFile = function (id) {
  var fileName = Identity.getFileNameFromId(id);
  var fileExtInfo = UIHelper.getExtensionInfoForFile(fileName);
  var editorId = 'script_editor_' + id;

  if (!$$(editorId)) {
    $$('$multiline-tabbar1').show();
    $$('script_editor').addView({
      header: fileName,
      close: true,
      css: 'script_editor__tab',
      body: {
        id: editorId,
        rows: [{ view: 'toolbar',
          css: 'script_editor__toolbar',
          elements: [
            { view: 'template',
              borderless: true,
              // id: 'entity_list_breadcrumbs',
              css: 'entity_list__breadcrumbs',
              template: '<div class="admin-breadcrumbs" id="entity_list_breadcrumbs"></div>'
            },
            { view: 'button',
              type: 'icon',
              icon: 'save',
              // id: 'SAVE_ENTITY_LABEL_2',
              label: STRINGS.SAVE_ENTITY,
              autowidth: true,
              tooltip: 'Ctrl + S',
              on: {
                onItemClick: function () {
                  var editor = $$(editorId + '_ace').editor;
                  var request = MDSCommon.extend(Identity.dataFromId(id, {ignoreField: true}), {
                    fields: [{
                      name: Identity.getFileNameFromId(id),
                      type: 'j',
                      value: editor.getValue()
                    }]
                  });
                  Mydataspace.request('entities.change', request).then(function (data) {
                    $('div[button_id="' + editorId + '"]').removeClass('script_editor__tab--dirty');
                    // TODO: unlock editor
                  }, function (err) {
                    // TODO: handle sating error
                  });
                }
              }
            },
            { view: 'button',
              type: 'icon',
              icon: 'search',
              // id: 'SCRIPT_EDITOR_FIND_LABEL_1',
              label: STRINGS.SCRIPT_EDITOR_FIND,
              autowidth: true,
              tooltip: 'Ctrl + F',
              on: {
                onItemClick: function () {
                  var editor = $$(editorId + '_ace').editor;
                  editor.execCommand('find');
                }
              }
            },
            { view: 'button',
              type: 'icon',
              icon: 'sort-alpha-asc',
              // id: 'SCRIPT_EDITOR_REPLACE_LABEL_1',
              label: STRINGS.SCRIPT_EDITOR_REPLACE,
              autowidth: true,
              tooltip: 'Ctrl + H',
              on: {
                onItemClick: function () {
                  var editor = $$(editorId + '_ace').editor;
                  editor.execCommand('replace');
                }
              }
            } //, {}
          ]
        }, {
          view: 'ace-editor',
          mode: fileExtInfo.mode,
          id: editorId + '_ace',
          show_hidden: true,
          on: {
            onReady: function (editor) {
              editor.getSession().setTabSize(2);
              editor.getSession().setUseSoftTabs(true);
              editor.getSession().setUseWorker(false);
              editor.commands.addCommand({
                name: 'save',
                bindKey: {win: 'Ctrl-S'},
                exec: function (editor) {
                  var request = MDSCommon.extend(Identity.dataFromId(id, {ignoreField: true}), {
                    fields: [{
                      name: Identity.getFileNameFromId(id),
                      type: 'j',
                      value: editor.getValue()
                    }]
                  });

                  Mydataspace.request('entities.change', request).then(function (data) {
                    var $tab = $('div[button_id="' + editorId + '"]');
                    $tab.removeClass('script_editor__tab--dirty');
                    $tab.removeClass('script_editor__tab--error');
                    editor.getSession().clearAnnotations();
                  }, function (err) {
                    if (err.name === 'CodeError') {
                      $('div[button_id="' + editorId + '"]').addClass('script_editor__tab--error');
                      editor.getSession().setAnnotations([{
                        row: err.line - 1,
                        column: err.column,
                        text: err.message,
                        type: 'error'
                      }]);
                    } else {
                      $('div[button_id="script_editor_' + id + '"]').addClass('script_editor__tab--error');
                      UI.error(err);
                    }
                  });
                }
              });
            }
          }
        }]
      }
    });

    Mydataspace.request('entities.get', Identity.dataFromId(id)).then(function (data) {
      $$(editorId + '_ace').setValue(data.fields[0].value);
      $$(editorId + '_ace').editor.on('change', function () {
        $('div[button_id="' + editorId + '"]').addClass('script_editor__tab--dirty');
      });
    });
  }
  $$('script_editor').show();
  $$('script_editor').setValue(editorId);

  var fileParentId = Identity.getEntityIdFromFileId(id);
  UI.entityList.updateBreadcrumbs(id);
  UI.setCurrentId(fileParentId);
};
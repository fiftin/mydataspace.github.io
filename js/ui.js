UI = {
  //
  // Entity form
  //

  entityForm_updateToolbar: function() {
    if (!$$('entity_form').isDirty()) {
      $$('entity_form__save_button').disable();
    } else {
      $$('entity_form__save_button').enable();
    }
  },

  /**
   * Marks entity form as unchanged.
   */
  entityForm_setClean: function() {
    $$('entity_form').setDirty(false);
    UI.entityForm_updateToolbar();
    $$('entity_form').enable();
  },

  /**
   * Marks entity form as changed.
   */
  entityForm_setDirty: function() {
    $$('entity_form').setDirty(true);
    UI.entityForm_updateToolbar();
  },

  entityForm_save: function() {
    var dirtyData = webix.CodeParser.expandNames($$('entity_form').getDirtyValues());
    var existingData =
      webix.CodeParser.expandNames(
        Object.keys($$('entity_form').elements).reduce(function(ret, current) {
          ret[current] = '';
          return ret;
        }, {}));
    var oldData = webix.CodeParser.expandNames($$('entity_form')._values);
    common.extendOf(dirtyData, UIHelper.dataFromId($$('entity_list').getSelectedId()));
    dirtyData.fields = UIHelper.getFieldsForSave(dirtyData.fields, Object.keys(existingData.fields || {}), oldData.fields);
    $$('entity_form').disable();
    if (typeof dirtyData.childPrototype !== 'undefined') {
      dirtyData.childPrototype = UIHelper.dataFromId(dirtyData.childPrototype);
    }
    Mydataspace.request('entities.change', dirtyData, function(res) {
      $$('entity_form').enable();
      UI.entityForm_setClean();
    }, function(err) {
      $$('entity_form').enable();
      UI.error(err);
    });
  },

  /**
   * Removes all fields from the form.
   */
  entityForm_clear: function() {
    var rows = $$('entity_form').getChildViews();
    for (var i = rows.length - 1; i >= UIHelper.NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM; i--) {
      var row = rows[i];
      if (typeof row !== 'undefined') {
        $$('entity_form').removeView(row.config.id);
      }
    }
    $$('entity_form__no_fields').show();
    $$('entity_form__run_script_button').hide();
  },

  entityForm_addFields: function(fields, setDirty) {
    for (var i in fields) {
      UI.entityForm_addField(fields[i], setDirty);
    }
  },

  entityForm_addField: function(data, setDirty) {
    if (typeof $$('entity_form__' + data.name) !== 'undefined') {
      throw new Error('Field with this name already exists');
    }
    $$('entity_form__no_fields').hide();
    if (typeof setDirty === 'undefined') {
      setDirty = false;
    }
    if (setDirty) {
      var values = webix.copy($$('entity_form')._values);
    }
    if ((data.type === 'j' || data.type === 'u') && !$$('entity_form__run_script_button').isVisible()) {
      $$('entity_form__run_script_button').show();
    }
    $$('entity_form').addView({
      id: 'entity_form__' + data.name,
      cols: [
        { view: 'text',
          value: data.name,
          name: 'fields.' + data.name + '.name',
          hidden: true
        },
        { view: data.type === 'j' ? 'textarea' : 'text',
          label: data.name,
          name: 'fields.' + data.name + '.value',
          id: 'entity_form__' + data.name + '_value',
          value: data.value,
          labelWidth: UIHelper.LABEL_WIDTH,
          height: 32,
          css: 'entity_form__text_label',
          on: {
            onFocus: function() {
              if (data.type === 'j') {
                UI.editScriptFieldId = 'entity_form__' + data.name + '_value';
                $$('edit_script_window__title').setValue(data.name);
                $$('edit_script_window').show();
              }
            }
          }
        },
        { view: 'select',
          width: 70,
          options: UIHelper.getFieldTypesAsArrayOfIdValue(),
          value: data.type,
          id: 'entity_form__' + data.name + '_type',
          name: 'fields.' + data.name + '.type',
          on: {
            onChange: function(newv, oldv) {
              if (newv === 'j' || oldv === 'j') {
                var oldValues = webix.copy($$('entity_form')._values);
                webix.ui(
                  { view: newv === 'j' ? 'textarea' : 'text',
                    label: data.name,
                    name: 'fields.' + data.name + '.value',
                    id: 'entity_form__' + data.name + '_value',
                    value: data.value,
                    labelWidth: UIHelper.LABEL_WIDTH,
                    height: 32,
                    css: 'entity_form__text_label',
                    on: {
                      onFocus: function() {
                        if (newv === 'j') {
                          UI.editScriptFieldId = 'entity_form__' + data.name + '_value';
                          $$('edit_script_window').show();
                        }
                      }
                    }
                  },
                  $$('entity_form__' + data.name),
                  $$('entity_form__' + data.name + '_value')
                );
                $$('entity_form')._values = oldValues;
              }
            }
          }
        },
        { view: 'button',
          type: 'icon',
          icon: 'remove',
          width: 25,
          click: function() {
            UI.entityForm_deleteField(data.name);
          }
        }
      ]
    });
    if (setDirty) {
      $$('entity_form')._values = values;
      UI.entityForm_updateToolbar();
    }
  },

  entityForm_deleteField: function(name) {
    var values = webix.copy($$('entity_form')._values);
    $$('entity_form').removeView('entity_form__' + name);
    $$('entity_form')._values = values;
    UI.entityForm_setDirty();
    var rows = $$('entity_form').getChildViews();
    if (rows.length === UIHelper.NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM) {
      $$('entity_form__no_fields').show();
    }

    let hasScripts = false;
    let fields = $$('entity_form').getValues().fields;
    for (let fieldName in fields) {
      let field = fields[fieldName];
      if (field.type === 'j' || field.type === 'u') {
        hasScripts = true;
        break;
      }
    }
    if (!hasScripts) {
      $$('entity_form__run_script_button').hide();
    }
  },

  /**
   * Reload data (from server) of entity list.
   * Uses entityList_fill internally.
   */
  entityList_refreshData: function() {
    var identity = UIHelper.dataFromId(UI.entityTree_getSelectedId());
    var search = $$('entity_list__search').getValue();
    if (common.isPresent(search)) {
      identity['filterByName'] = search;
    }
    $$('entity_list').disable();
    Mydataspace.request('entities.getChildren', identity, function(data) {
      var showMoreChildId =
        UIHelper.childId(UI.entityTree_getSelectedId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);
      var entityId = UIHelper.idFromData(data);
      var children = data.children.map(UIHelper.entityFromData);
      if (UI.entityTree_getSelectedId() === entityId) {
        if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
          children[children.length - 1] = {
            id: UIHelper.childId(entityId, UIHelper.ENTITY_LIST_SHOW_MORE_ID),
            value: STRINGS.SHOW_MORE
          }
        }
        UI.entityList_fill(entityId, children);
        $$('entity_list').addCss(showMoreChildId, 'entity_list__show_more_item');
      }
    }, function(err) { UI.error(err); });
  },

  /**
   * Fills entity list by items from children array.
   *
   * @param parentEntityId Root entity (selected in entity tree).
   *                       Displays as '.' in entity list.
   * @param children Items of entity list.
   */
  entityList_fill: function(parentEntityId, children) {
    $$('entity_list').clearAll();
    for (var i in children) {
      $$('entity_list').add(children[i], -1);
    }
    $$('entity_list').add({ id: parentEntityId,  value: '.' }, 0);
    $$('entity_list').select(parentEntityId);
  },

  entityList_addChildren: function(children) {
    var showMoreChildId =
      UIHelper.childId(UI.entityTree_getSelectedId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);
    if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
      delete children[children.length - 1];
    } else {
      $$('entity_list').remove(showMoreChildId);
    }
    var startIndex = UI.entityList_count() + 1;
    var offset = 0;
    for (var i in children) {
      $$('entity_list').add(children[i], startIndex + offset);
      offset++;
    }
  },

  entityList_showMore: function() {
    var req = UIHelper.dataFromId(UI.entityTree_getSelectedId());
    req.offset = UI.entityList_count();
    Mydataspace.request('entities.getChildren', req, function(data) {
      var children = data.children.map(UIHelper.entityFromData);
      UI.entityList_addChildren(children);
    });
  },

  /**
   * Calculates number of items of entity list.
   * @returns {number} Number of items in entity list.
   */
  entityList_count: function() {
    var lastId = $$('entity_list').getLastId();
    var lastIndex = $$('entity_list').getIndexById(lastId) - 1;
    if (lastId.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID)) {
      return lastIndex;
    }
    return lastIndex + 1;
  },

  entityList_getSelectedId: function() {
    return UI.entityList_selectedId;
  },

  //
  // Entity list
  //

  /**
   * Override entity's children of nodes recursively.
   */
  entityTree_setChildren: function(entityId, children) {
    var dummyChildId = UIHelper.childId(entityId, UIHelper.ENTITY_TREE_DUMMY_ID);
    var showMoreChildId = UIHelper.childId(entityId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
    var firstChildId = $$('entity_tree').getFirstChildId(entityId);
    if (firstChildId != null && firstChildId !== dummyChildId) {
      return;
    }
    if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
      children[children.length - 1] = {
        id: UIHelper.childId(entityId, UIHelper.ENTITY_TREE_SHOW_MORE_ID),
        value: STRINGS.SHOW_MORE
      }
    }
    children.reverse().forEach(function(entity) {
      $$('entity_tree').add(entity, 0, entityId);
      if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
        UI.entityTree_setChildren(entity.id, entity.data);
      }
    });
    if (firstChildId !== null) {
      $$('entity_tree').remove(firstChildId);
    }
    $$('entity_tree').addCss(showMoreChildId, 'entity_tree__show_more_item');
  },

  entityTree_addChildren: function(entityId, children) {
    var showMoreChildId = UIHelper.childId(entityId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
    if (!$$('entity_tree').exists(showMoreChildId)) {
      return;
    }
    if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
      delete children[children.length - 1];
    } else {
      $$('entity_tree').remove(showMoreChildId);
    }
    children.reverse().forEach(function(entity) {
      var nChildren = UI.entityTree_numberOfChildren(entityId);
      $$('entity_tree').add(entity, nChildren - 1, entityId);
      if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
        UI.entityTree_setChildren(entity.id, entity.data);
      }
    });
  },

  entityTree_showMore: function(id) {
    var req = UIHelper.dataFromId(id);
    req.offset = UI.entityTree_numberOfChildren(id);
    Mydataspace.request('entities.getChildren', req, function(data) {
      var entityId = UIHelper.idFromData(data);
      var children = data.children.map(UIHelper.entityFromData);
      UI.entityTree_addChildren(entityId, children);
    });
  },

  entityTree_numberOfChildren: function(id) {
    var n = 0;
    var prevChildId = null;
    var childId = $$('entity_tree').getFirstChildId(id);
    while (childId != null && prevChildId !== childId) {
      n++;
      prevChildId = childId;
      childId = $$('entity_tree').getNextSiblingId(childId);
    }
    return n;
  },

  entityTree_lastChildId: function(id) {
    var prevChildId = null;
    var childId = $$('entity_tree').getFirstChildId(id);
    while (childId != null && prevChildId !== childId) {
      prevChildId = childId;
      childId = $$('entity_tree').getNextSiblingId(childId);
    }
    return prevChildId;
  },

  entityTree_getSelectedId: function() {
    return UI.entityTree_selectedId;
  },

  //
  // Apps
  //

  refreshApps: function() {
    Mydataspace.emit('apps.getAll', {});
  },

  appForm_save: function() {
    Mydataspace.emit('apps.change', $$('app_form').getValues());
  },

  appForm_updateToolbar: function() {

  },

  //
  //
  //

  error: function(err) {
    webix.message({ type: 'error', text: err.message || err.name });
    switch (err.name) {
      case 'NotAuthorizedErr':
        break;
    }
  },

  /**
   * Reload data from the server.
   */
  refresh: function() {
    Mydataspace.emit('entities.getMyRoots', {});
    Mydataspace.emit('users.getMyProfile', {});
  },

  clear: function() {
    $$('entity_list').clearAll();
    $$('entity_tree').clearAll();
  },

  initConnection: function() {
    Mydataspace.on('login', function() {
      $$('menu__item_list').select($$('menu__item_list').getFirstId());
      $$('login_panel').hide();
      $$('admin_panel').show();
      UI.refresh();
    });

    Mydataspace.on('logout', function() {
      $$('menu').hide();
      $$('login_panel').show();
      $$('admin_panel').hide();
      UI.clear();
    });

    Mydataspace.on('entities.create.res', function(data) {
      $$('add_root_window').hide();
      $$('add_entity_window').hide();
      UIControls.removeSpinnerFromWindow($$('add_root_window'));
      UIControls.removeSpinnerFromWindow($$('add_entity_window'));
      $$('add_root_form').enable();
      $$('add_entity_form').enable();

      var parentId = UIHelper.parentId(UIHelper.idFromData(data));
      var entity = UIHelper.entityFromData(data);
      if ($$('entity_list').getSelectedId() === parentId) {
        $$('entity_list').add(entity);
      }
      if (parentId === 'root') {
        $$('entity_tree').add(entity, 0);
        if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
          UI.entityTree_setChildren(entity.id, entity.data);
        }
      } else if (!common.isNull($$('entity_tree').getItem(parentId)) &&
          common.isNull($$('entity_tree').getItem(UIHelper.childId(parentId, UIHelper.ENTITY_TREE_DUMMY_ID)))) {
        $$('entity_tree').add(entity, 0, parentId);
        if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
          UI.entityTree_setChildren(entity.id, entity.data);
        }
      }
    });

    Mydataspace.on('entities.getMyRoots.res', function(data) {
      $$('entity_tree').clearAll();
      // convert received data to treeview format and load its to entity_tree.
      var formattedData = data.map(UIHelper.entityFromData);
      $$('entity_tree').parse(formattedData);
    });

    Mydataspace.on('users.getMyProfile.res', function(data) {
      if (common.isBlank(data['avatar'])) {
        data['avatar'] = '/images/no-avatar.png';
      }
      $$('profile').setValues(data);
    });

    Mydataspace.on('entities.delete.res', function(data) {
      var entityId = UIHelper.idFromData(data);
      $$('entity_list').remove(entityId);
      $$('entity_tree').remove(entityId);
    });

    Mydataspace.on('entities.getWithMeta.res', function(data) {
      if (UIHelper.idFromData(data) === $$('entity_list').getSelectedId()) {
        var formData = {
          name: UIHelper.nameFromData(data),
          type: data.type,
          description: data.description,
          childPrototype: UIHelper.idFromData(data.childPrototype)
        }
        UI.entityForm_clear();
        $$('entity_form').setValues(formData);
        UI.entityForm_addFields(data.fields);
        UI.entityForm_setClean();
      }
    });

    Mydataspace.on('entities.err', UI.error);

    Mydataspace.on('apps.create.res', function(data) {
      $$('add_app_window').hide();
      $$('app_list').add({
        id: data.clientId,
        value: data.name
      });
      $$('app_list').select(data.clientId);
    });

    Mydataspace.on('apps.change.res', function(data) {
      $$('app_form').setValues(data);
      $$('entity_form').setDirty(false);
    });

    Mydataspace.on('apps.delete.res', function(data) {
      $$('app_list').remove(data.clientId);
    });

    Mydataspace.on('apps.get.res', function(data) {
      $$('app_form').setValues(data);
      $$('entity_form').setDirty(false);
    });

    Mydataspace.on('apps.getAll.res', function(data) {
      var items = data.map(function(x) {
        return {
          id: x.clientId,
          value: x.name
        }
      });
      $$('app_list').clearAll();
      for (var i in items) {
        $$('app_list').add(items[i], -1);
      }
      if (items.length > 0) {
        $$('app_list').select(items[0].id);
      }
    });

    Mydataspace.on('apps.err', UI.error);

  },

  /**
   * Initialize UI only once!
   */
  rendered: false,
  render: function() {
    if (UI.rendered) {
      return;
    }
    UI.rendered = true;


    window.addEventListener('message', function(e) {
      if (e.data.message === 'getScripts') {
        var fields = $$('entity_form').getValues().fields;
        if (typeof fields === 'undefined') {
          fields = {};
        }
        var values = Object.keys(fields).map(function(key) { return fields[key]; });
        values.sort(function(a, b) {
          if (a.type === 'j' && b.type === 'u') {
            return 1;
          } else if (a.type === 'u' && b.type === 'j') {
            return -1;
          } else if (a.type === 'j' && b.type === 'j') {
            if (a.name.toUpperCase() === '__MAIN__') {
              return 1;
            } else if (b.name.toUpperCase() === '__MAIN__') {
              return -1;
            }
            return 0;
          }
          return 0;
        });
        e.source.postMessage({ message: 'fields', fields: values }, '*');
      }
    });

    webix.ui({
      view: 'window',
      id: 'edit_script_window',
      modal: true,
      width: 1000,
      position: 'center',
      head: false,
      on: {
        onShow: function() {
          $$('edit_script_window__editor').setValue($$(UI.editScriptFieldId).getValue());
          $$('edit_script_window__cancel_button').define('hotkey', 'escape');
        }
      },
      body: {
        rows: [
          { view: 'toolbar',
            elements: [
              { view: 'label',
                label: STRINGS.EDIT_SCRIPT,
                width: 100
              },
              { view: 'label',
                id: 'edit_script_window__title'
              },
              {},
              { view: 'button',
                type: 'icon',
                icon: 'save',
                label: STRINGS.SAVE_ENTITY,
                width: 120,
                click: function() {
                  $$(UI.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                  UI.entityForm_save();
                }
              },
              { view: 'button',
                type: 'icon',
                icon: 'play',
                label: STRINGS.RUN_SCRIPT,
                width: 120,
                click: function() {
                  $$(UI.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                  var runScriptWindow = UIHelper.popupCenter('/run_script.html', 'Run Script', 600, 400);
                }
              },
              { view: 'button',
                type: 'icon',
                icon: 'times',
                label: 'Close',
                id: 'edit_script_window__cancel_button',
                width: 100,
                click: function() {
                  $$(UI.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                  $$('edit_script_window').hide();
                }
              }
            ]
          },
          { view: 'ace-editor',
            id: 'edit_script_window__editor',
            theme: 'monokai',
            mode: 'javascript',
            height: 600,
            on: {
              onReady: function(editor) {
                editor.getSession().setTabSize(2);
                editor.getSession().setUseSoftTabs(true);
                // editor.getSession().setUseWrapMode(true);
                editor.getSession().setUseWorker(false);
                // editor.execCommand('find')
                editor.commands.addCommand({
                  name: 'save',
                  bindKey: { win: 'Ctrl-S' },
                  exec: function(editor) {
                    $$(UI.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                    UI.entityForm_save();
                  }
                });
              }
            }
          }
        ]
      }
    });

    // 'Add new root' window
    webix.ui({
        view: 'window',
        id: 'add_root_window',
        width: 300,
        position: 'center',
        modal: true,
        head: 'New Root',
        on: UIControls.getOnForFormWindow('add_root'),
        body: {
          view: 'form',
          id: 'add_root_form',
          borderless: true,
          on: {
            onSubmit: function() {
              if (!$$('add_root_form').validate()) {
                return;
              }
              // Send request to create new root entity
              var data = $$('add_root_form').getValues();
              data.path = '';
              data.fields = [];
              Mydataspace.emit('entities.create', data);
            }
          },
          elements: [
            { view: 'text', label: 'Name', required: true, name: 'root', labelWidth: UIHelper.LABEL_WIDTH },
            UIControls.getEntityTypeSelectTemplate(),
            UIControls.getSubmitCancelForFormWindow('add_root')
          ]
        }
    });

    // 'Add new entity' window
    webix.ui({
        view: 'window',
        id: 'add_entity_window',
        width: 300,
        position: 'center',
        modal: true,
        head: 'New Entity',
        on: UIControls.getOnForFormWindow('add_entity'),
        body: {
          view: 'form',
          id: 'add_entity_form',
          borderless: true,
          on: {
            onSubmit: function() {
              if (!$$('add_entity_form').validate()) {
                return;
              }
              var formData = $$('add_entity_form').getValues();
              var newEntityId = UIHelper.childId(UI.entityTree_getSelectedId(), formData.name);
              var data = UIHelper.dataFromId(newEntityId);
              data.fields = [];
              data.type = formData.type;
              Mydataspace.emit('entities.create', data);
            }
          },
          elements: [
            { view: 'text', required: true, label: 'Name', name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
            UIControls.getEntityTypeSelectTemplate(),
            UIControls.getSubmitCancelForFormWindow('add_entity')
          ]
        }
    });

    // 'Add new field' window
    webix.ui({
      view: 'window',
      id: 'add_field_window',
      width: 300,
      position: 'center',
      modal: true,
      head: 'New Field',
      on: UIControls.getOnForFormWindow('add_field'),
      body: {
        view: 'form',
        id: 'add_field_form',
        borderless: true,
        on: {
          onSubmit: function() {
            if (!$$('add_field_form').validate()) {
              return;
            }
            UI.entityForm_addField($$('add_field_form').getValues(), true);
            setTimeout(function() { $$('add_field_window').hide() }, 100);
          }
        },
        elements: [
          { view: 'text', required: true, label: 'Name', name: 'name' },
          UIControls.getFieldTypeSelectTemplate(),
          { view: 'text', label: 'Value', name: 'value' },
          UIControls.getSubmitCancelForFormWindow('add_field')
        ],
        rules: {
          name: function(value) { return typeof $$('entity_form__' + value) === 'undefined' },
          value: function(value) {
            var values = $$('add_field_form').getValues();
            var typeInfo = UIHelper.FIELD_TYPES[values.type];
            return typeof typeInfo !== 'undefined' && typeInfo.isValidValue(value);
          }
        }
      }
    });

    //
    // 'Add new app' window
    //
    webix.ui({
        view: 'window',
        id: 'add_app_window',
        width: 300,
        position: 'center',
        modal: true,
        head: 'New App',
        on: UIControls.getOnForFormWindow('add_app'),
        body: {
          view: 'form',
          id: 'add_app_form',
          borderless: true,
          on: {
            onSubmit: function() {
              if (!$$('add_app_form').validate()) {
                return;
              }
              // Send request to create new app
              var data = $$('add_app_form').getValues();
              data.path = '';
              data.fields = [];
              Mydataspace.emit('apps.create', data);
            }
          },
          elements: [
            { view: 'text', label: 'Name', required: true, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
            UIControls.getSubmitCancelForFormWindow('add_app')
          ]
        }
    });

    //
    // Left side menu
    //
		webix.ui({
			view: 'sidemenu',
			id: 'menu',
			width: 200,
			position: 'right',
			state: function(state) {
				var toolbarHeight = 47;
				state.top = toolbarHeight;
				state.height -= toolbarHeight;
			},
			body: {
        rows: [
          { view: 'template',
            borderless: true,
            id: 'profile',
            css: 'profile',
            autoheight: true,
            template: '<div class="profile__img_wrap"><img class="profile__img" src="#avatar#" /></div><div class="profile__name">#name#</div>',
            data: {
              avatar: '/images/no-avatar.png',
              name: 'No name'
            }
          },
          { view: 'list',
            id: 'menu__item_list',
            borderless: true,
            scroll: false,
            css: 'menu__item_list',
            template: '<span class="webix_icon fa-#icon#"></span> #value#',
            data:[
              { id: 'my-data', value: 'My Data', icon: 'database' },
              { id: 'my-apps', value: 'My Apps', icon: 'cogs' },
              { id: 'logout', value: 'Sign out', icon: 'sign-out' }
            ],
            select: true,
            type: { height: 40 },
            on: {
              onSelectChange: function () {
                switch (this.getSelectedId()) {
                  case 'my-data':
                    $$('my_data_panel').show();
                    $$('my_apps_panel').hide();
                    break;
                  case 'my-apps':
                    $$('my_data_panel').hide();
                    $$('my_apps_panel').show();
                    UI.refreshApps();
                    break;
                  case 'logout':
                    Mydataspace.logout();
                    break;
                  default:
                    throw new Error('Elligal menu item id');
                }
              }
            }
          }
        ]
      }
    });

    var authProviders =
      Object.keys(Mydataspace.getAuthProviders())
            .map(function(providerName) { return UIControls.getLoginButtonView(providerName); });
    authProviders.unshift({});
    authProviders.push({});
    authProviders.push({});
    webix.ui({
      id: 'login_panel',
      rows: [
        { type: 'header', template: 'my data space' },
        { cols: [ {}, { rows: authProviders}, {} ]}
      ]
    });

    //
    // Admin panel
    //
    webix.ui({
      id: 'admin_panel',
      hidden: true,
      rows: [
        { cols: [
            { type: 'header', template: 'my data space' },
            { view: 'icon',
              icon: 'bars',
              id: 'menu_button',
              css: 'menu_button',
              click: function() {
                if( $$('menu').config.hidden) {
                  $$('menu').show();
                }
                else
                  $$('menu').hide();
              }
            }
          ]
        },

        //
        // My Apps Page
        //
        { id: 'my_apps_panel',
          height: window.innerHeight - 46,
          hidden: true,
          cols: [
            // List of apps
            { rows: [
                { view: 'toolbar',
                  elements: [
                    { view: 'button',
                      type: 'icon',
                      icon: 'plus',
                      label: 'New App',
                      width: 100,
                      click: function() {
                        $$('add_app_window').show();
                      }
                    },
                    { view: 'button',
                      type: 'icon',
                      icon: 'refresh',
                      label: 'Refresh',
                      width: 100,
                      click: function() {
                        UI.refreshApps();
                      }
                    },
                    {}
                  ]
                },
                { view: 'list',
                  id: 'app_list',
                  select: true,
                  template: '<div>#value#</div>',
                  on: {
                    onSelectChange: function (ids) {
                      Mydataspace.emit(
                        'apps.get',
                        { clientId: ids[0] });
                    }
                  }
                }
              ]
            },
            { view: 'resizer' },
            // Selected app edit
            { rows: [
              { view: 'toolbar',
                cols: [
                  { view: 'button',
                    type: 'icon',
                    icon: 'save',
                    label: 'Save',
                    id: 'app_form__save_button',
                    width: 70,
                    click: function() {
                      UI.appForm_save();
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'refresh',
                    label: 'Refresh App',
                    width: 120,
                    click: function() {
                      Mydataspace.emit(
                        'apps.get',
                        { clientId: $$('app_list').getSelectedId() });
                    }
                  },
                  {},
                  { view: 'button',
                    type: 'icon',
                    icon: 'remove',
                    label: 'Delete',
                    width: 100,
                    click: function() {
                      webix.confirm({
                        title: 'Delete App',
                        text: 'You really want delete this app?',
                        ok: 'Yes',
                        cancel: 'No',
                        callback: function(result) {
                          if (result) {
                            Mydataspace.request(
                              'apps.delete',
                              { clientId: $$('app_list').getSelectedId() });
                          }
                        }
                      });
                    }
                  }
                ]
              },
              { view: 'form',
                id: 'app_form',
                complexData: true,
                scroll: true,
                elements: [
                  { view: 'text', label: 'Name', name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'textarea', label: 'Decription', height: 100, name: 'description', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'text', label: 'Logo URL', name: 'logoURL', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'text', label: 'Site URL', name: 'url', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'text', label: 'Clien ID', name: 'clientId', readonly:true, labelWidth: UIHelper.LABEL_WIDTH }
                ],
                on: {
                  onChange: function() { UI.appForm_updateToolbar() }
                }
              }
            ]}
          ]
        },

        //
        // My Data Page
        //
        { id: 'my_data_panel',
          height: window.innerHeight - 46,
          cols: [
            { rows: [
                { view: 'toolbar',
                  elements: [
                    { view: 'button',
                      type: 'icon',
                      icon: 'plus',
                      label: 'New Root',
                      width: 100,
                      click: function() {
                        $$('add_root_window').show();
                      }
                    },
                    { view: 'button',
                      type: 'icon',
                      icon: 'refresh',
                      label: 'Refresh',
                      width: 100,
                      click: function() {
                        UI.refresh();
                      }
                    },
                    {}
                  ]
                },
                { view: 'tree',
                  id: 'entity_tree',
                  gravity: 0.4,
                  select: true,
                  on: {
                    onAfterLoad: function() {
                      UI.entityTree_selectedId = $$('entity_tree').getFirstId();
                      $$('entity_tree').select(UI.entityTree_getSelectedId());
                    },
                    onBeforeOpen: function(id) {
                      var firstChildId = $$('entity_tree').getFirstChildId(id);
                      if (firstChildId != null && firstChildId !== UIHelper.childId(id, UIHelper.ENTITY_TREE_DUMMY_ID)) {
                        return;
                      }
                      // Load children to first time opened node.
                      Mydataspace.request('entities.getChildren', UIHelper.dataFromId(id), function(data) {
                        var entityId = UIHelper.idFromData(data);
                        var children = data.children.map(UIHelper.entityFromData);
                        UI.entityTree_setChildren(entityId, children);
                      });
                    },
                    onSelectChange: function(ids) {
                      var id = ids[0];
                      if (id.endsWith(UIHelper.ENTITY_TREE_SHOW_MORE_ID)) {
                        $$('entity_tree').select(UI.entityTree_getSelectedId());
                      } else {
                        UI.entityTree_selectedId = $$('entity_tree').getSelectedId();
                        UI.entityList_refreshData();
                      }
                    },
                    onBeforeSelect: function(id, selection) {
                      if (id.endsWith(UIHelper.ENTITY_TREE_SHOW_MORE_ID)) {
                        UI.entityTree_showMore(UIHelper.parentId(id));
                      }
                    }
                  }
                }
              ]
            },
            { view: 'resizer' },
            { rows: [
                { view: 'toolbar',
                  cols: [
                    { view: 'button',
                      type: 'icon',
                      icon: 'plus',
                      label: 'New Entity',
                      width: 110,
                      click: function() {
                        $$('add_entity_window').show();
                      }
                    },
                    { view: 'search',
                      id: 'entity_list__search',
                      align: 'center',
                      placeholder: 'Search...',
                      on: {
                        onKeyPress: function(code, e) {
                          if (code === 13 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                            UI.entityList_refreshData();
                            return false;
                          }
                        }
                      }
                    }
                  ]
                },
                { view: 'list',
                  id: 'entity_list',
                  select: true,
                  template: '<div>#value#</div>',
                  on: {
                    onBeforeSelect: function(id, selection) {
                      if (id.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID)) {
                        UI.entityList_showMore();
                      } else {
                        UI.entityList_selectedId = id;
                      }
                    },
                    onSelectChange: function (ids) {
                      var id = ids[0];
                      if (id.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID)) {
                        $$('entity_list').select(UI.entityList_getSelectedId());
                      } else {
                        Mydataspace.emit(
                          'entities.getWithMeta',
                          UIHelper.dataFromId(UI.entityList_getSelectedId()));
                      }
                    }
                  }
                }
              ]
            },
            { view: 'resizer' },
            { rows: [
              { view: 'toolbar',
                cols: [
                  { view: 'button',
                    type: 'icon',
                    icon: 'save',
                    id: 'entity_form__save_button',
                    width: 30,
                    click: function() {
                      UI.entityForm_save();
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'refresh',
                    id: 'entity_form__refresh_button',
                    width: 30,
                    click: function() {
                      $$('entity_form').disable();
                      Mydataspace.emit(
                        'entities.getWithMeta',
                        UIHelper.dataFromId($$('entity_list').getSelectedId()));
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'plus',
                    label: 'Add Fields',
                    width: 100,
                    click: function() {
                      $$('add_field_window').show();
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'play',
                    label: 'Run Script',
                    width: 100,
                    id: 'entity_form__run_script_button',
                    hidden: true,
                    click: function() {
                      var runScriptWindow = UIHelper.popupCenter('/run_script.html', 'Run Script', 600, 400);
                    }
                  },
                  {},
                  { view: 'button',
                    type: 'icon',
                    icon: 'remove',
                    width: 30,
                    click: function() {
                      webix.confirm({
                        title: 'Delete Entity',
                        text: 'You really want delete this entity?',
                        ok: 'Yes',
                        cancel: 'No',
                        callback: function(result) {
                          if (result) {
                            Mydataspace.request(
                              'entities.delete',
                              UIHelper.dataFromId($$('entity_list').getSelectedId()));
                          }
                        }
                      });
                    }
                  }
                ]
              },
              { view: 'form',
                id: 'entity_form',
                css: 'entity_form',
                complexData: true,
                scroll: true,
                elements: [
                  { view: 'text', label: 'Name', name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
                  UIControls.getEntityTypeSelectTemplate(),
                  { view: 'text', label: 'Description', name: 'description', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'text', label: 'Child Proto', name: 'childPrototype', labelWidth: UIHelper.LABEL_WIDTH },
                  { template: 'Fields', type: 'section' },
                  { view: 'label', label: 'No field exists', id: 'entity_form__no_fields', align: 'center' }
                ],
                on: {
                  onChange: function() { UI.entityForm_updateToolbar() }
                }
              }
            ]}
          ]
        }
      ]
    });

    webix.event(window, 'resize', function(e) {
      $$('admin_panel').define({
        width: window.innerWidth,
        height: window.innerHeight
      });
      $$('my_data_panel').define({
        height: window.innerHeight - 46
      });
      $$('my_apps_panel').define({
        height: window.innerHeight - 46
      });
      $$('admin_panel').resize();
    });
  }
};

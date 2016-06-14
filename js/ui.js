UI = {
  entityForm_updateToolbar: function() {
    if (!$$('entity_form').isDirty()) {
      $$('entity_form__save_button').disable();
    } else {
      $$('entity_form__save_button').enable();
    }
  },

  entityForm_setClean: function() {
    $$('entity_form').setDirty(false);
    UI.entityForm_updateToolbar();
  },

  entityForm_setDirty: function() {
    $$('entity_form').setDirty(true);
    UI.entityForm_updateToolbar();
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
    $$('entity_form').addView({
      id: 'entity_form__' + data.name,
      cols: [
        { view: 'text',
          value: data.name,
          name: 'fields.' + data.name + '.name',
          hidden: true
        },
        { view: 'text',
          label: data.name,
          name: 'fields.' + data.name + '.value',
          value: data.value,
          labelWidth: UIHelper.LABEL_WIDTH
        },
        { view: 'select',
          width: 80,
          options: UIHelper.getFieldTypesAsArrayOfIdValue(),
          value: data.type,
          name: 'fields.' + data.name + '.type'
        },
        { view: 'button',
          type: 'icon',
          icon: 'remove',
          width: 30,
          click: function() {
            UI.entityForm_deleteField(data.name);
          }
        },
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
  },

  entityList_refreshData: function() {
    var data = UIHelper.dataFromId($$('entity_tree').getSelectedId());
    var seatch = $$('entity_list__search').getValue();
    if (common.isPresent(seatch)) {
      data['search'] = seatch;
    }
    Mydataspace.emit('entities.getChildren', data);
  },

  entityList_fill: function(entityId, children) {
    $$('entity_list').clearAll();
    for (var i in children) {
      $$('entity_list').add(children[i], 0);
    }
    $$('entity_list').add({ id: entityId,  value: '.' }, 0);
    $$('entity_list').select(entityId);
  },

  entityTree_setChildren: function(entityId, children) {
    var firstChildId = $$('entity_tree').getFirstChildId(entityId);
    var dummyChildId = UIHelper.childId(entityId, 'dummy');
    if (firstChildId !== null && firstChildId !== dummyChildId) {
      return;
    }
    children.forEach(function(entity) {
      var tmpId = $$('entity_tree').add(entity, 0, entityId);
      if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
        UI.entityTree_setChildren(entity.id, entity.data);
      }
    });
    if (firstChildId !== null) {
      $$('entity_tree').remove(firstChildId);
    }
  },

  runScriptWindow_run: function() {
    $$('run_script_window__iframe_stop').enable();
    $$('run_script_window__iframe_run').disable();
    var iframe = $$('run_script_window__iframe').getIframe();
    iframe.contentDocument.getElementById('run_script__state').classList.add('fa-spin');
    iframe.contentDocument.getElementById('run_script__state_wrap').classList.add('run_script__state_wrap--run');
    iframe.contentDocument.getElementById('run_script__console').classList.add('run_script__console--run');
    iframe.contentWindow.console = {
      log: function(message) {
        var div = iframe.contentDocument.createElement('div');
        div.classList.add('run_script__console_record');
        div.innerText = message;
        iframe.contentDocument.getElementById('run_script__console').appendChild(div);
      },
      scriptComplete: function() {
        UI.runScriptWindow_stop();
      }
    };
  },

  runScriptWindow_stop: function() {
    $$('run_script_window__iframe_stop').disable();
    $$('run_script_window__iframe_run').enable();
    $$('run_script_window__iframe').getIframe().src = '';
    $$('run_script_window__iframe').load('/run_script.html');
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
      $$('data_panel').show();
      UI.refresh();
    });

    Mydataspace.on('logout', function() {
      $$('menu').hide();
      $$('login_panel').show();
      $$('data_panel').hide();
      UI.clear();
    });

    // Initialize event listeners
    Mydataspace.on('entities.create.res', function(data) {
      $$('add_root_window').hide();
      $$('add_entity_window').hide();
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
          common.isNull($$('entity_tree').getItem(UIHelper.childId(parentId, 'dummy')))) {
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

    Mydataspace.on('entities.getChildren.res', function(data) {
      var entityId = UIHelper.idFromData(data);
      var children = data.children.map(UIHelper.entityFromData);
      UI.entityTree_setChildren(entityId, children);
      if ($$('entity_tree').getSelectedId() === entityId) {
        UI.entityList_fill(entityId, children);
      }
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
              var newEntityId = UIHelper.childId($$('entity_tree').getSelectedId(), formData.name);
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

    // Run Script Window
    webix.ui({
      view: 'window',
      id: 'run_script_window',
      width: 500,
      height: 400,
      position: 'center',
      modal: true,
      head: 'Run Script',
      on: {
        onHide: function() {
          UI.runScriptWindow_stop();
        },
        onShow: function() {
          $$('run_script_window__iframe').load('/run_script.html');
        },
      },
      body:{
        rows: [
          { view: 'iframe', id: 'run_script_window__iframe' },
          { view: 'toolbar',
            elements: [
              { view: 'button',
                type: 'icon',
                icon: 'play',
                label: 'Run Script',
                width: 100,
                id: 'run_script_window__iframe_run',
                click: function() {
                  UI.runScriptWindow_run();
                  var fields = $$('entity_form').getValues().fields;
                  if (typeof fields === 'undefined') {
                    fields = {};
                  }
                  var values = Object.keys(fields).map(key => fields[key]);
                  values.sort((a, b) => {
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
                  for (let field of values) {
                    if (field.type !== 'j' && field.type !== 'u') {
                      continue;
                    }
                    var iframe = $$('run_script_window__iframe').getIframe();
                    var script = iframe.contentDocument.createElement('script');
                    if (field.type === 'j') {
                      script.innerHTML = field.value;
                    } else {
                      script.src = field.value;
                    }
                    iframe.contentDocument.body.appendChild(script);
                  }
                }
              },
              { view: 'button',
                type: 'icon',
                icon: 'stop',
                label: 'Stop Script',
                width: 100,
                disabled: true,
                id: 'run_script_window__iframe_stop',
                click: function() {
                  UI.runScriptWindow_stop();
                }
              },
              {},
              { view: 'button',
                type: 'icon',
                icon: 'remove',
                label: 'Close',
                width: 100,
                click: function() {
                  $$('run_script_window').hide();
                }
              },
            ]
          },
        ]
      },
    });


    // Left side menu
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
            template: '<span class="webix_icon fa-#icon#"></span> #value#',
            data:[
              // { id: 1, value: 'Profile', icon: 'user' },
              { id: 'my-data', value: 'My Data', icon: 'database' },
              // { id: 5, value: 'Settings', icon: 'cog' },
              { id: 'logout', value: 'Sign out', icon: 'sign-out' }
            ],
            select: true,
            type: { height: 40 },
            on: {
              onSelectChange:function () {
                switch (this.getSelectedId()) {
                  case 'my-data':
                    // UI.refresh();
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
            .map(providerName => UIControls.getLoginButtonView(providerName));
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

    // Init Webix UI
    webix.ui({
      id: 'data_panel',
      hidden: true,
      rows: [
        { cols: [
            { type: 'header', template: 'my data space' },
            { view: 'icon',
              icon: 'bars',
              id: 'menu_button',
              click: function() {
                if( $$('menu').config.hidden) {
                  $$('menu').show();
                }
                else
                  $$('menu').hide();
              }
            },
          ]
        },
        { cols: [
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
                    onBeforeOpen: function(id) {
                      Mydataspace.request(
                        'entities.getChildren', UIHelper.dataFromId(id));
                    },
                    onSelectChange:function () {
                      UI.entityList_refreshData();
                    }
                  }
                },
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
                    },
                  ]
                },
                { view: 'list',
                  id: 'entity_list',
                  select: true,
                  template: '<div>#value#</div>',
                  on: {
                    onSelectChange:function () {
                      Mydataspace.emit('entities.getWithMeta', UIHelper.dataFromId($$('entity_list').getSelectedId()));
                    }
                  }
                },
              ]
            },
            { view: 'resizer' },
            { rows: [
              { view: 'toolbar',
                cols: [
                  { view: 'button',
                    type: 'icon',
                    icon: 'save',
                    label: 'Save',
                    id: 'entity_form__save_button',
                    width: 90,
                    click: function() {
                      var dirtyData = webix.CodeParser.expandNames($$('entity_form').getDirtyValues());
                      var existingData =
                        webix.CodeParser.expandNames(
                          Object.keys($$('entity_form').elements).reduce((ret, current) => {
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
                        webix.message({ type: 'error', text: err.message || err.name });
                        $$('entity_form').enable();
                      });
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'refresh',
                    label: 'Refresh',
                    width: 100,
                    click: function() {
                      Mydataspace.emit(
                        'entities.getWithMeta',
                        UIHelper.dataFromId($$('entity_list').getSelectedId()));
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'plus',
                    label: 'Add Fields',
                    width: 120,
                    click: function() {
                      $$('add_field_window').show();
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'play',
                    label: 'Run Script',
                    width: 120,
                    click: function() {
                      $$('run_script_window').show();
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
                  },
                ]
              },
              { view: 'form',
                id: 'entity_form',
                complexData: true,
                scroll: true,
                elements: [
                  { view: 'text', label: 'Name', name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
                  UIControls.getEntityTypeSelectTemplate(),
                  { view: 'text', label: 'Decription', name: 'description', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'text', label: 'Child Proto', name: 'childPrototype', labelWidth: UIHelper.LABEL_WIDTH },
                  { template: 'Fields', type: 'section' },
                  { view: 'label', label: 'No field exists', id: 'entity_form__no_fields', align: 'center', }
                ],
                on: {
                  onChange: function() { UI.entityForm_updateToolbar() }
                }
              },
            ]}
          ]
        }
      ]
    });
  },
};

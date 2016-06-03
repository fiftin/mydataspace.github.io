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
    for (var i = rows.length - 1; i >= 5; i--) {
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
        },
        { view: 'select',
          width: 80,
          options: [
            { id: 's', value: 'String' },
            { id: 'i', value: 'Integer' },
            { id: 'r', value: 'Real' },
          ],
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
    if (rows.length === 5) {
      $$('entity_form__no_fields').show();
    }
  },

  entityList_refresh: function() {
    var data = UIHelper.dataFromId($$('entity_tree').getSelectedId());
    var seatch = $$('entity_list__search').getValue();
    if (common.isPresent(seatch)) {
      data['search'] = seatch;
    }
    MyDataSpace.emit('entities.getChildren', data);
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

  /**
   * Reload data from the server.
   */
  refresh: function() {
    MyDataSpace.emit('entities.getMyRoots', {});
    MyDataSpace.emit('users.getMyProfile', {});
  },

  clear: function() {
    $$('entity_list').clearAll();
    $$('entity_tree').clearAll();
  },

  initConnection: function() {
    MyDataSpace.on('login', function() {
      $$('menu__item_list').select($$('menu__item_list').getFirstId());
      $$('login_panel').hide();
      $$('data_panel').show();
      UI.refresh();
    });

    MyDataSpace.on('logout', function() {
      $$('menu').hide();
      $$('login_panel').show();
      $$('data_panel').hide();
      UI.clear();
    });

    // Initialize event listeners
    MyDataSpace.on('entities.create.res', function(data) {
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

    MyDataSpace.on('entities.getMyRoots.res', function(data) {
      $$('entity_tree').clearAll();
      // convert received data to treeview format and load its to entity_tree.
      var formattedData = data.map(UIHelper.entityFromData);
      $$('entity_tree').parse(formattedData);
    });

    MyDataSpace.on('users.getMyProfile.res', function(data) {
      if (common.isBlank(data['avatar'])) {
        data['avatar'] = '/images/no-avatar.png';
      }
      $$('profile').setValues(data);
    });

    MyDataSpace.on('entities.delete.res', function(data) {
      var entityId = UIHelper.idFromData(data);
      $$('entity_list').remove(entityId);
      $$('entity_tree').remove(entityId);
    });

    MyDataSpace.on('entities.getChildren.res', function(data) {
      var entityId = UIHelper.idFromData(data);
      var children = data.children.map(UIHelper.entityFromData);
      UI.entityTree_setChildren(entityId, children);
      if ($$('entity_tree').getSelectedId() === entityId) {
        UI.entityList_fill(entityId, children);
      }
    });

    MyDataSpace.on('entities.getWithMeta.res', function(data) {
      if (UIHelper.idFromData(data) === $$('entity_list').getSelectedId()) {
        var formData = {
          name: UIHelper.nameFromData(data),
          type: data.type,
          description: data.description,
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
              MyDataSpace.emit('entities.create', data);
            }
          },
          elements: [
            { view: 'text', label: 'Name', required: true, name: 'root' },
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
              MyDataSpace.emit('entities.create', data);
            }
          },
          elements: [
            { view: 'text', required: true, label: 'Name', name: 'name' },
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
                    MyDataSpace.logout();
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
      Object.keys(MyDataSpace.authProviders)
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
                      MyDataSpace.request(
                        'entities.getChildren', UIHelper.dataFromId(id));
                    },
                    onSelectChange:function () {
                      UI.entityList_refresh();
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
                    { view: 'search', id: 'entity_list__search', align: 'center', placeholder: 'Search...', id: 'search' },
                  ]
                },
                { view: 'list',
                  id: 'entity_list',
                  select: true,
                  template: '<div>#value#</div>',
                  on: {
                    onSelectChange:function () {
                      MyDataSpace.emit('entities.getWithMeta', UIHelper.dataFromId($$('entity_list').getSelectedId()));
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
                      MyDataSpace.request('entities.change', dirtyData, function(res) {
                        $$('entity_form').enable();
                        UI.entityForm_setClean();
                      }, function(err) {
                        alert('err');
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
                      MyDataSpace.emit('entities.getWithMeta', UIHelper.dataFromId($$('entity_list').getSelectedId()));
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
                            MyDataSpace.request(
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
                  { view: 'text', label: 'Name', name: 'name' },
                  UIControls.getEntityTypeSelectTemplate(),
                  { view: 'text', label: 'Decription', name: 'description' },
                  { template: 'Fields', type: 'section', id: 'entity_form__splitter' },
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

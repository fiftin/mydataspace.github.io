UI = {
  entityForm: new EntityForm(),

  entityList: new EntityList(),

  entityTree: new EntityTree(),

  refresh: function() {
    UI.entityTree.refresh();
    Mydataspace.emit('users.getMyProfile', {});
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

  error: function(err) {
    webix.message({ type: 'error', text: err.message || err.name });
    switch (err.name) {
      case 'NotAuthorizedErr':
        break;
    }
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
    });

    UI.entityForm.listen();
    UI.entityList.listen();
    UI.entityTree.listen();

    Mydataspace.on('entities.create.res', function() {
      $$('add_root_window').hide();
      $$('add_entity_window').hide();
      UIControls.removeSpinnerFromWindow($$('add_root_window'));
      UIControls.removeSpinnerFromWindow($$('add_entity_window'));
      $$('add_root_form').enable();
      $$('add_entity_form').enable();
    });

    Mydataspace.on('users.getMyProfile.res', function(data) {
      if (common.isBlank(data['avatar'])) {
        data['avatar'] = '/images/no-avatar.png';
      }
      $$('profile').setValues(data);
    });

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
    Mydataspace.on('entities.err', UI.error);
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
          $$('edit_script_window__editor').setValue($$(UI.entityForm.editScriptFieldId).getValue());
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
                  $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                  UI.entityForm.save();
                }
              },
              { view: 'button',
                type: 'icon',
                icon: 'play',
                label: STRINGS.RUN_SCRIPT,
                width: 120,
                click: function() {
                  $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
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
                  $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
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
                    $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                    UI.entityForm.save();
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
              if ($$('add_entity_form').validate()) {
                var formData = $$('add_entity_form').getValues();
                var newEntityId = UIHelper.childId(UI.entityList.getRootId(), formData.name);
                var data = UIHelper.dataFromId(newEntityId);
                data.fields = [];
                data.type = formData.type;
                Mydataspace.request('entities.create', data, function() {
                  $$('add_entity_window').hide();
                  UIControls.removeSpinnerFromWindow($$('add_entity_window'));
                  $$('add_entity_form').enable();
                }, function(err) {
                  UIControls.removeSpinnerFromWindow($$('add_entity_window'));
                  $$('add_entity_form').enable();
                  for (let i in err.errors) {
                    let e = err.errors[i];
                    switch (e.type) {
                      case 'unique violation':
                        if (e.path === 'entities_root_path') {
                          $$('add_entity_form').elements.name.define('invalidMessage', 'Name already exists');
                          $$('add_entity_form').markInvalid('name', true);
                        }
                        break;
                    }
                  }
                });
              }
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
            UI.entityForm.addField($$('add_field_form').getValues(), true);
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
                        UI.entityTree.refresh();
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
                      $$('entity_tree').select(UI.entityTree.setCurrentIdToFirst());
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
                        UI.entityTree.setChildren(entityId, children);
                      });
                    },
                    onSelectChange: function(ids) {
                      var id = ids[0];
                      if (id.endsWith(UIHelper.ENTITY_TREE_SHOW_MORE_ID)) {
                        $$('entity_tree').select(UI.entityTree.getCurrentId());
                      } else {
                        UI.entityTree.setCurrentId(id);
                        UI.entityList.setRootId(id);
                        UI.entityForm.setSelectedId(id);
                      }
                    },
                    onBeforeSelect: function(id, selection) {
                      if (id.endsWith(UIHelper.ENTITY_TREE_SHOW_MORE_ID)) {
                        UI.entityTree.showMore(UIHelper.parentId(id));
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
                            UI.entityList.refreshData();
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
                        UI.entityList.showMore();
                      } else {
                        UI.entityList.setCurrentId(id);
                      }
                    },
                    onSelectChange: function (ids) {
                      var id = ids[0];
                      if (id.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID)) {
                        $$('entity_list').select(UI.entityList.getCurrentId());
                      } else {
                        UI.entityForm.setSelectedId(id);
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
                      UI.entityForm.save();
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'refresh',
                    id: 'entity_form__refresh_button',
                    width: 30,
                    click: function() {
                      UI.entityForm.refresh();
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
                            UI.entityForm.delete();
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
                  onChange: function() { UI.entityForm.updateToolbar() }
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

    window.addEventListener('error', function (e) {
      UI.error(e.error.message);
      return false;
    });
  }
};

UI = {
  entityForm: new EntityForm(),

  entityList: new EntityList(),

  entityTree: new EntityTree(),

  pages: new Pages(),

  updateLanguage: function() {

    var currentLang = localStorage.getItem('language') || 'EN';
    var strings = STRINGS_ON_DIFFERENT_LANGUAGES[currentLang];

    // Language swithcer

    for (var lang in STRINGS_ON_DIFFERENT_LANGUAGES) {
      var langButton = $$('menu__language_button_' + lang.toLowerCase());
      if (lang === currentLang) {
        webix.html.addCss(langButton.getNode(), 'menu__language_button--selected');
      } else {
        webix.html.removeCss(langButton.getNode(), 'menu__language_button--selected');
      }
    }

    // Labels

    for (var key in strings) {
      var label = $$(key + '_LABEL');
      if (label == null) {
        continue;
      }

      var i = 1;
      while (label != null) {
        label.define('label', strings[key]);
        label.refresh();
        label = $$(key + '_LABEL_' + i);
        i++;
      }
    }

    // Menu

    var menuItemList = $$('menu__item_list');
    var menuItemListSelectedId = menuItemList.getSelectedId();
    var data = [
      { id: 'data', value: strings.MY_DATA, icon: 'database' },
      { id: 'apps', value: strings.MY_APPS, icon: 'cogs' },
      { id: 'logout', value: strings.SIGN_OUT, icon: 'sign-out' }
    ];
    menuItemList.clearAll();
    for (var i in data) {
      menuItemList.add(data[i]);
    }
    menuItemList.select(menuItemListSelectedId);


    // Dialogs
    var dialogs = ['ADD_ROOT', 'ADD_ENTITY', 'ADD_FIELD'];
    for (var i in dialogs) {
      var dialogId = dialogs[i];
      var dialog = $$(dialogId.toLowerCase() + '_window');
      dialog.getHead().define('template', strings[dialogId]);
      dialog.getHead().refresh();
      $$(dialogId.toLowerCase() + '_window__create_button').setValue(strings.CREATE);
      $$(dialogId.toLowerCase() + '_window__cancel_button').setValue(strings.CANCEL);
    }

    // Comboboxes



    // Others

    $$('entity_form__fields_title').define('template', strings.FIELDS);
    $$('entity_form__fields_title').refresh();

    $$('entity_list__search').define('placeholder', strings.SEARCH);
    $$('entity_list__search').refresh();
  },

  /**
   * Notify user about error.
   * @param err Object in format:
   *            { name: 'Exception name', message: 'Error message' }
   *            Error object can also contains next fields:
   *            - errors - array of errors if several errors happens.
   */
  error: function(err) {
    switch (err.name) {
      case 'NotAuthorizedErr':
        break;
      default:
        webix.message({ type: 'error', text: err.message || err.name });
        break;
    }
  },

  refresh: function() {
    Mydataspace.emit('users.getMyProfile', {});
    UI.pages.refreshPage('apps', true);
    UI.pages.refreshPage('data', true);
  },

  //
  // Apps
  //

  refreshApps: function() {
    $$('app_list').disable();
    Mydataspace.request('apps.getAll', {}, function() {
      $$('app_list').enable();
    }, function(err) {
      $$('app_list').enable();
      UI.error(err);
    });
  },

  appForm_save: function() {
    $$('app_form').disable();
    Mydataspace.request('apps.change', $$('app_form').getValues(), function() {
      $$('app_form').enable();
    }, function(err) {
      $$('app_form').enable();
      UI.error(err);
    });
  },

  appForm_updateToolbar: function() {
    if (!$$('app_form').isDirty()) {
      $$('app_form__save_button').disable();
    } else {
      $$('app_form__save_button').enable();
    }
  },

  appForm_setClean: function() {
    $$('app_form').setDirty(false);
    UI.appForm_updateToolbar();
    $$('app_form').enable();
  },

  appForm_setData: function(data) {
    $$('app_form').setValues(data);
    UI.appForm_setClean();
  },

  initConnection: function() {
    Mydataspace.on('login', function() {
      $('#bootstrap').hide();
      $('#webix').show();
      UI.updateSize();
      UI.refresh();
    });

    Mydataspace.on('logout', function() {
      $$('menu').hide();
      $('#webix').hide();
      $('#bootstrap').show();
      document.getElementById('no_items').style.display = 'none';
    });

    UI.entityForm.listen();
    UI.entityList.listen();
    UI.entityTree.listen();

    Mydataspace.on('users.getMyProfile.res', function(data) {
      if (common.isBlank(data['avatar'])) {
        data['avatar'] = '/images/no-avatar.png';
      }
      $$('profile').setValues(data);
    });

    Mydataspace.on('entities.create.res', function() {
      setTimeout(function() {
        UI.pages.updatePageState('data');
      }, 10);
    });

    Mydataspace.on('entities.delete.res', function() {
      setTimeout(function() {
        UI.pages.updatePageState('data');
      }, 10);
    });

    Mydataspace.on('entities.getMyRoots.res', function() {
      setTimeout(function() {
        UI.pages.updatePageState('data');
      }, 10);
    });

    Mydataspace.on('apps.create.res', function(data) {
      $$('add_app_window').hide();
      $$('app_list').add({
        id: data.clientId,
        value: data.name
      });
      UI.pages.updatePageState('apps');
      $$('app_list').select(data.clientId);
    });

    Mydataspace.on('apps.change.res', function(data) {
      $$('app_form').setValues(data);
      $$('app_form').setDirty(false);
      UI.appForm_setData(data);
    });

    Mydataspace.on('apps.delete.res', function(data) {
      var nextId = $$('app_list').getPrevId(data.clientId) || $$('app_list').getNextId(data.clientId);
      if (nextId != null) {
        $$('app_list').select(nextId);
      }
      $$('app_list').remove(data.clientId);
      UI.pages.updatePageState('apps');
    });

    Mydataspace.on('apps.get.res', function(data) {
      UI.appForm_setData(data);
    });

    Mydataspace.on('apps.getAll.res', function(data) {
      var items = data.map(function(x) {
        return {
          id: x.clientId,
          value: x.name
        };
      });
      $$('app_list').clearAll();
      for (var i in items) {
        $$('app_list').add(items[i], -1);
      }
      var firstId = $$('app_list').getFirstId();
      if (firstId !== null) {
        $$('app_list').select(firstId);
      }
      $$('app_list').enable();
      UI.pages.updatePageState('apps');
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
                id: 'EDIT_SCRIPT_LABEL', label: STRINGS.EDIT_SCRIPT,
                width: 100
              },
              { view: 'label',
                id: 'edit_script_window__title'
              },
              {},
              { view: 'button',
                type: 'icon',
                icon: 'save',
                id: 'SAVE_ENTITY_LABEL', label: STRINGS.SAVE_ENTITY,
                width: 120,
                click: function() {
                  $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                  UI.entityForm.save();
                }
              },
              { view: 'button',
                type: 'icon',
                icon: 'play',
                id: 'RUN_SCRIPT_LABEL', label: STRINGS.RUN_SCRIPT,
                width: 120,
                click: function() {
                  $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                  UIHelper.popupCenter('/run_script.html', 'Run Script', 600, 400);
                }
              },
              { view: 'button',
                type: 'icon',
                icon: 'times',
                id: 'CLOSE_LABEL', label: STRINGS.CLOSE,
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
        head: STRINGS.ADD_ROOT,
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
              Mydataspace.request('entities.create', data, function() {
                $$('add_root_window').hide();
                UIControls.removeSpinnerFromWindow('add_root_window');
              }, function(err) {
                UIControls.removeSpinnerFromWindow('add_root_window');
                if (err.errors != null) {
                  for (let i in err.errors) {
                    let e = err.errors[i];
                    switch (e.type) {
                      case 'unique violation':
                        if (e.path === 'entities_root_path') {
                          $$('add_root_form').elements.root.define('invalidMessage', 'Name already exists');
                          $$('add_root_form').markInvalid('root', true);
                        }
                        break;
                    }
                  }
                } else {
                  if (err.message.startsWith('ER_DATA_TOO_LONG:')) {
                    $$('add_root_form').elements.root.define('invalidMessage', 'Too long');
                    $$('add_root_form').markInvalid('root', true);
                  } else {
                    UI.error(err);
                  }
                }
              });
            }
          },
          elements: [
            { view: 'text', id: 'NAME_LABEL', label: STRINGS.NAME, required: true, name: 'root', labelWidth: UIHelper.LABEL_WIDTH },
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
        head: STRINGS.ADD_ENTITY,
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
                  UIControls.removeSpinnerFromWindow('add_entity_window');
                }, function(err) {
                  UIControls.removeSpinnerFromWindow('add_entity_window');
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
            { view: 'text', required: true, id: 'NAME_LABEL_1', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
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
      head: STRINGS.ADD_FIELD,
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
            setTimeout(function() {
              $$('add_field_window').hide();
            }, 100);
          }
        },
        elements: [
          { view: 'text', required: true, id: 'NAME_LABEL_2', label: STRINGS.NAME, name: 'name' },
          UIControls.getFieldTypeSelectTemplate(),
          { view: 'text', id: 'VALUE_LABEL', label: STRINGS.VALUE, name: 'value' },
          UIControls.getSubmitCancelForFormWindow('add_field', false)
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
        head: STRINGS.NEW_APP,
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
              Mydataspace.request('apps.create', data, function() {
                UIControls.removeSpinnerFromWindow('add_app_window');
              }, function() {
                ;
              });
            }
          },
          elements: [
            { view: 'text', id: 'NAME_LABEL_3', label: STRINGS.NAME, required: true, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
            { view: 'text', id: 'SITE_URL_LABEL', label: STRINGS.SITE_URL, required: true, name: 'url', labelWidth: UIHelper.LABEL_WIDTH },
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
              { id: 'data', value: STRINGS.MY_DATA, icon: 'database' },
              { id: 'apps', value: STRINGS.MY_APPS, icon: 'cogs' },
              { id: 'logout', value: STRINGS.SIGN_OUT, icon: 'sign-out' }
            ],
            select: true,
            type: { height: 40 },
            on: {
              onSelectChange: function () {
                switch (this.getSelectedId()) {
                  case 'data':
                    UI.pages.setCurrentPage('data');
                    break;
                  case 'apps':
                    UI.pages.setCurrentPage('apps');
                    break;
                  case 'logout':
                    Mydataspace.logout();
                    break;
                  default:
                    throw new Error('Illegal menu item id');
                }
              }
            }
          }
        ]
      }
    });

    //
    // Admin panel
    //
    webix.ui({
      id: 'admin_panel',
      container: 'admin_panel',
      rows: [
        { cols: [
            { type: 'header', template: 'my data space' },
            { view: 'button',
              width: 110,
              css: 'menu__language_button menu__language_button--get_started',
              id: 'GET_STARTED_LABEL',
              label: STRINGS.GET_STARTED,
              click: function() {
                location.href = 'get-started';
              }
            },
            { view: 'button',
              width: 90,
              css: 'menu__language_button',
              id: 'DEMOS_LABEL',
              label: STRINGS.DEMOS,
              click: function() {
                location.href = 'demos';
              }
            },
            { view: 'button',
              width: 120,
              css: 'menu__language_button',
              id: 'DOCS_LABEL',
              label: STRINGS.DOCS,
              click: function() {
                location.href = 'docs';
              }
            },
            { width: 20, css: 'menu__spacer' },
            { view: 'button',
              width: 30,
              id: 'menu__language_button_en',
              css: 'menu__language_button ' + (LANGUAGE === 'EN' ? 'menu__language_button--selected' : ''),
              label: 'EN',
              click: function() {
                localStorage.setItem('language', 'EN');
                UI.updateLanguage();
              }
            },
            { view: 'button',
              width: 30,
              id: 'menu__language_button_ru',
              css: 'menu__language_button ' + (LANGUAGE === 'RU' ? 'menu__language_button--selected' : ''),
              label: 'RU',
              click: function() {
                localStorage.setItem('language', 'RU');
                UI.updateLanguage();
              }
            },
            { width: 20, css: 'menu__spacer' },
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
                      id: 'NEW_APP_LABEL', label: STRINGS.NEW_APP,
                      width: 120,
                      click: function() {
                        $$('add_app_window').show();
                      }
                    },
                    { view: 'button',
                      type: 'icon',
                      icon: 'refresh',
                      id: 'REFRESH_LABEL_1', label: STRINGS.REFRESH,
                      width: 100,
                      click: function() {
                        UI.pages.refreshPage('apps');
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
                      $$('app_form').disable();
                      Mydataspace.request(
                        'apps.get',
                        { clientId: ids[0] }, function() {
                          $$('app_form').enable();
                        }, function(err) {
                          $$('app_form').enable();
                          UI.error(err);
                        });
                    }
                  }
                }
              ]
            },
            {
              view: 'resizer',
              id: 'my_apps_panel__resizer',
            },
            // Selected app edit
            { id: 'my_apps_panel__right_panel',
              rows: [
              { view: 'toolbar',
                cols: [
                  { view: 'button',
                    type: 'icon',
                    icon: 'save',
                    id: 'SAVE_LABEL', label: STRINGS.SAVE,
                    id: 'app_form__save_button',
                    width: 110,
                    click: function() {
                      UI.appForm_save();
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'refresh',
                    id: 'REFRESH_APP_LABEL', label: STRINGS.REFRESH_APP,
                    width: 120,
                    click: function() {
                      $$('app_form').disable();
                      Mydataspace.request(
                        'apps.get',
                        { clientId: $$('app_list').getSelectedId() }, function() {
                          $$('app_form').enable();
                        }, function(err) {
                          $$('app_form').enable();
                          UI.error(err);
                        });
                    }
                  },
                  {},
                  { view: 'button',
                    type: 'icon',
                    icon: 'remove',
                    id: 'DELETE_LABEL', label: STRINGS.DELETE,
                    width: 100,
                    click: function() {
                      webix.confirm({
                        title: STRINGS.DELETE_APP,
                        text: STRINGS.REALLY_DELETE_APP,
                        ok: STRINGS.YES,
                        cancel: STRINGS.NO  ,
                        callback: function(result) {
                          if (result) {
                            $$('app_form').disable();
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
                  { view: 'text', id: 'NAME_LABEL_4', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'textarea', id: 'DESCRIPTION_LABEL', label: STRINGS.DESCRIPTION, height: 100, name: 'description', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'text', id: 'LOGO_URL_LABEL', label: STRINGS.LOGO_URL, name: 'logoURL', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'text', id: 'SITE_URL_LABEL_1', label: STRINGS.SITE_URL, name: 'url', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'text', id: 'CLIENT_ID_LABEL', label: STRINGS.CLIENT_ID, name: 'clientId', readonly:true, labelWidth: UIHelper.LABEL_WIDTH }
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
            { id: 'my_data_panel__left_panel',
              rows: [
                { view: 'toolbar',
                  elements: [
                    { view: 'button',
                      type: 'icon',
                      icon: 'plus',
                      id: 'ADD_ROOT_LABEL', label: STRINGS.ADD_ROOT,
                      width: 130,
                      click: function() {
                        $$('add_root_window').show();
                      }
                    },
                    { view: 'button',
                      type: 'icon',
                      icon: 'refresh',
                      id: 'REFRESH_LABEL', label: STRINGS.REFRESH,
                      width: 100,
                      click: function() {
                        UI.pages.refreshPage('data');
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
            {
              id: 'my_data_panel__resizer_1',
              view: 'resizer'
            },
            { id: 'my_data_panel__central_panel',
              rows: [
                { view: 'toolbar',
                  cols: [
                    { view: 'button',
                      type: 'icon',
                      icon: 'plus',
                      id: 'ADD_ENTITY_LABEL', label: STRINGS.ADD_ENTITY,
                      width: 110,
                      click: function() {
                        $$('add_entity_window').show();
                      }
                    },
                    { view: 'search',
                      id: 'entity_list__search',
                      align: 'center',
                      placeholder: STRINGS.SEARCH,
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
            {
              id: 'my_data_panel__resizer_2',
              view: 'resizer'
            },
            { id: 'my_data_panel__right_panel',
              rows: [
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
                    id: 'ADD_FIELD_LABEL', label: STRINGS.ADD_FIELD,
                    width: 120,
                    click: function() {
                      $$('add_field_window').show();
                    }
                  },
                  { view: 'button',
                    type: 'icon',
                    icon: 'play',
                    id: 'RUN_SCRIPT_LABEL', label: STRINGS.RUN_SCRIPT,
                    width: 100,
                    id: 'entity_form__run_script_button',
                    hidden: true,
                    click: function() {
                      UIHelper.popupCenter('/run_script.html', 'Run Script', 600, 400);
                    }
                  },
                  {},
                  { view: 'button',
                    type: 'icon',
                    icon: 'remove',
                    width: 30,
                    click: function() {
                      webix.confirm({
                        title: STRINGS.DELETE_ENTITY,
                        text: STRINGS.REALLY_DELETE,
                        ok: STRINGS.YES,
                        cancel: STRINGS.NO,
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
                  { view: 'text', id: 'NAME_LABEL_5', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
                  UIControls.getEntityTypeSelectTemplate(),
                  { view: 'text', id: 'CHILD_PROTO_LABEL', label: STRINGS.CHILD_PROTO, name: 'childPrototype', labelWidth: UIHelper.LABEL_WIDTH },
                  { view: 'textarea', css: 'entity_form__description', height: 100, id: 'DESCRIPTION_LABEL_1', label: STRINGS.DESCRIPTION, name: 'description', labelWidth: UIHelper.LABEL_WIDTH },
                  { id: 'entity_form__fields_title', template: STRINGS.FIELDS, type: 'section' },
                  { view: 'label', id: 'NO_FIELDS_LABEL', label: STRINGS.NO_FIELDS, align: 'center' }
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
      UI.updateSize();
    });

    window.addEventListener('error', function (e) {
      UI.error(e.error.message);
      return false;
    });
  },

  updateSize: function() {
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
  }
};

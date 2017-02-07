UI = {

  entityForm: new EntityForm(),

  entityList: new EntityList(),

  entityTree: new EntityTree(),

  pages: new Pages(),

  VISIBLE_ON_SMALL_SCREENS: [
    'SIGN_OUT_LABEL'
  ],

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
      $$('SAVE_APP_LABEL').disable();
    } else {
      $$('SAVE_APP_LABEL').enable();
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
      document.getElementById('bootstrap').style.display = 'none';
      document.getElementById('webix').style.display = 'block';
      UI.updateSizes();
      UI.refresh();
      $$('SIGN_IN_LABEL').hide();
      $$('menu_button').show();
      $('#signin_modal').modal('hide');
    });

    Mydataspace.on('logout', function() {
      $$('menu').hide();
      if (!UIHelper.isViewOnly()) {
        document.getElementById('bootstrap').style.display = 'block';
        document.getElementById('webix').style.display = 'none';
      }
      document.getElementById('no_items').style.display = 'none';
      $$('SIGN_IN_LABEL').show();
      $$('menu_button').hide();
    });

    UI.entityForm.listen();
    UI.entityList.listen();
    UI.entityTree.listen();

    Mydataspace.on('users.getMyProfile.res', function(data) {
      if (MDSCommon.isBlank(data['avatar'])) {
        data['avatar'] = '/images/no_avatar.png';
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

    //
    // Communication with popup window of script runner.
    //
    window.addEventListener('message', function(e) {
      if (e.data.message === 'getScripts') {
        var fields = Fields.expandFields($$('entity_form').getValues().fields);
        if (typeof fields === 'undefined') {
          fields = {};
        }
        var values = Object.keys(fields).map(function(key) { return fields[key]; });
        values.sort(function(a, b) {
          if (a.type === 'j' && b.type !== 'j') {
            return 1;
          } else if (a.type !== 'j' && b.type === 'j') {
            return -1;
          } else if (a.type === 'j' && b.type === 'j') {
            if (a.name === 'main.js') {
              return 1;
            } else if (b.name === 'main.js') {
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
    	view: 'popup',
    	id: 'entity_form__field_type_popup',
        css: 'entity_form__field_type_popup',
    	width: 130,
    	body:{
    		view: 'list',
            id: 'entity_form__field_type_popup_list',
            class: 'entity_form__field_type_popup_list',
            borderless: true,
    		data:[
              { id: 's', value: 'String', icon: 'commenting' },
              { id: 'j', value: 'Text', icon: 'align-justify' },
              { id: 'i', value: 'Integer', icon: 'italic' },
              { id: 'r', value: 'Float', icon: 'calculator'  },
              { id: 'u', value: 'URL', icon: 'link' },
              { id: 'w', value: 'Secret', icon: 'lock' },

              // { id: 'b', value: 'Boolean', icon: 'check-square-o' },
              // { id: 'd', value: 'Date', icon: 'calendar-o' },
              // { id: 'm', value: 'Money', icon: 'dollar' },
              // { id: 'e', value: 'Email', icon: 'envelope' },
              // { id: 'p', value: 'Phone', icon: 'phone' },

              // { id: 'c', value: 'Custom', icon: 'pencil' },
              // { value: 'More...', icon: '' },
    		],
    		datatype: 'json',
    		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
    		autoheight: true,
    		select: true,
            on: {
              onItemClick: function(newv) {
                var fieldName = UI.entityForm.currentFieldName;
                var fieldId = 'entity_form__' + fieldName;
                var fieldValue = $$(fieldId + '_value').getValue();
                $$(fieldId + '_type_button').define('icon', Fields.FIELD_TYPE_ICONS[newv]);
                $$(fieldId + '_type_button').refresh();
                var oldv = $$(fieldId + '_type').getValue();
                $$(fieldId + '_type').setValue(newv);
                $$('entity_form__field_type_popup').hide();
                var oldValues = webix.copy($$('entity_form')._values);
                delete oldValues['fields.' + UI.entityForm.currentFieldName + '.value'];
                if (newv === 'j' || oldv === 'j') {
                  webix.ui(
                    { view: newv === 'j' ? 'textarea' : 'text',
                      label: fieldName,
                      name: 'fields.' + fieldName + '.value',
                      id: 'entity_form__' + fieldName + '_value',
                      value: fieldValue,
                      labelWidth: UIHelper.LABEL_WIDTH,
                      height: 32,
                      css: 'entity_form__text_label',
                      on: {
                        onFocus: function() {
                          if (newv === 'j') {
                            this.editScriptFieldId = 'entity_form__' + fieldName + '_value';
                            $$('edit_script_window').show();
                          }
                        }
                      }
                    },
                    $$('entity_form__' + fieldName),
                    $$('entity_form__' + fieldName + '_value')
                  );
                  if (newv === 'j') {
                    $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').disable();
                    var fieldIndexed = $$(fieldId + '_indexed').getValue();
                    $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS['fulltext']);
                    $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();
                  } else {
                    $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').enable();
                    $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS[fieldIndexed || 'none']);
                    $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();
                  }
                }
                $$('entity_form')._values = oldValues;
              }
            }
    	}
    });


    webix.ui({
    	view: 'popup',
    	id: 'entity_tree__root_scope_popup',
        css: 'entity_tree__root_scope_popup',
    	width: 130,
    	body:{
    		view: 'list',
            id: 'entity_tree__root_scope_popup_list',
            class: 'entity_tree__root_scope_popup_list',
            borderless: true,
    		data:[
              { id: 'user', value: 'Yours', icon: 'user' },
              { id: 'globe', value: 'All', icon: 'globe' },
              { id: 'edit', value: 'Custom', icon: 'edit' },
    		],
    		datatype: 'json',
    		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
    		autoheight: true,
    		select: true,
        on: {
          onItemClick: function(newv) {
            $$('entity_tree__root_scope_popup').hide();
            $$('entity_tree__root_scope').define('icon', newv);
            $$('entity_tree__root_scope').refresh();
          }
        }
    	}
    });

    webix.ui({
    	view: 'popup',
    	id: 'entity_form__field_indexed_popup',
        css: 'entity_form__field_indexed_popup',
    	width: 180,
    	body:{
    		view: 'list',
            id: 'entity_form__field_indexed_list',
            class: 'entity_form__field_indexed_list',
            borderless: true,
    		data:[
              { id: 'true', value: 'Search &amp; Order', icon: Fields.FIELD_INDEXED_ICONS['true'] },
              { id: 'fulltext', value: 'Fulltext Search', icon: Fields.FIELD_INDEXED_ICONS['fulltext'] },
              { id: 'none', value: 'None', icon: Fields.FIELD_INDEXED_ICONS['none'] },
    		],
    		datatype: 'json',
    		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
    		autoheight: true,
    		select: true,
        on: {
          onItemClick: function(newv) {
            $$('entity_form__field_indexed_popup').hide();
            $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS[newv]);
            $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();

          }
        }
    	}
    });

    webix.ui(UILayout.windows.editScript);
    webix.ui(UILayout.windows.addRoot);
    webix.ui(UILayout.windows.addEntity);
    webix.ui(UILayout.windows.addField);
    webix.ui(UILayout.windows.addApp);
		webix.ui(UILayout.sideMenu);

    //
    // Admin panel
    //
    webix.ui({
      id: 'admin_panel',
      container: 'admin_panel',
      rows: [
        UILayout.header,
        UILayout.apps,
        //
        // My Data Page
        //
        { id: 'my_data_panel',
          height: window.innerHeight - 46,
          cols: [
            UILayout.entityTree,
            {
              id: 'my_data_panel__resizer_1',
              view: 'resizer'
            },
            UILayout.entityList,
            {
              id: 'my_data_panel__resizer_2',
              view: 'resizer'
            },
            UILayout.entityForm
          ]
        }
      ]
    });

    UI.updateSizes();

    webix.event(window, 'resize', function(e) {
      UI.updateSizes();
    });

    window.addEventListener('error', function (e) {
      UI.error(e.error.message);
      return false;
    });

    function updateTreeSearchScope() {
      if (Router.isEmpty() || Router.isMe()) {
        $$('entity_tree__root_scope').define('icon', 'user');
        $$('entity_tree__search').setValue(Router.getSearch());
      } else if (Router.isRoot()) {
        $$('entity_tree__root_scope').define('icon', 'edit');
        $$('entity_tree__search').setValue(Router.getRoot());
      } else if (Router.isSearch()) {
        $$('entity_tree__root_scope').define('icon', 'globe');
        $$('entity_tree__search').setValue(Router.getSearch());
      }
      $$('entity_tree__root_scope').refresh();
    }

    updateTreeSearchScope();

    $(window).on('hashchange', function() {
      UI.pages.refreshPage('data', true);
      updateTreeSearchScope();
    });
  },

  updateSizes: function() {
    $$('admin_panel').define({
      width: window.innerWidth,
      height: window.innerHeight
    });
    $$('my_data_panel').define({
      height: window.innerHeight - UILayout.HEADER_HEIGHT + 2
    });
    $$('my_apps_panel').define({
      height: window.innerHeight - UILayout.HEADER_HEIGHT + 2
    });
    $$('edit_script_window').define({
      height: $$('my_data_panel__resizer_2').$height
    });
    $$('admin_panel').resize();
    $$('admin_panel').resize();
    $$('edit_script_window').resize();
  }
};

UI = {

  /**
   * @type {EntityForm}
   */
  entityForm: new EntityForm(),

  entityList: new EntityList(),

  entityTree: new EntityTree(),

  pages: new Pages(),

  VISIBLE_ON_SMALL_SCREENS: [
    'SIGN_OUT_LABEL'
  ],

  updateLanguage: function(newLanguage) {
    var currentLang;
    if (newLanguage) {
      currentLang = newLanguage.toUpperCase();
      if (window.localStorage) {
        window.localStorage.setItem('language', currentLang);
      }
    } else {
      var languageMatch = window.location.pathname.match(/^\/(\w\w)(\/.*)?$/);
      if (languageMatch) {
        currentLang = languageMatch[1].toUpperCase();
      } else {
        currentLang = (window.localStorage && window.localStorage.getItem('language')) || 'EN';
      }
    }

    var strings = STRINGS_ON_DIFFERENT_LANGUAGES[currentLang];

    // Language switcher

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

      // Must me in upper case
      if (key !== key.toUpperCase()) {
        continue;
      }

      // Value must be string
      if (typeof strings[key] !== 'string') {
        continue;
      }

      var label = $$(key + '_LABEL');
      if (label == null) {
        continue;
      }

      var i = 1;
      while (label != null) {
        var leftPart = strings[key].split('<span')[0];
        var rightPartIndex = label.data.label.indexOf('<span');
        var rightPart = rightPartIndex >= 0 ? label.data.label.substring(rightPartIndex) : '';
        label.define('label', leftPart + rightPart);
        label.refresh();
        label = $$(key + '_LABEL_' + i);
        i++;
      }
    }

    // Side Menu
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
    var dialogs = ['ADD_ROOT', 'ADD_ENTITY', 'ADD_FIELD', 'ADD_VERSION', 'ADD_WEBSITE'];
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

    // Override URL

    var a = document.createElement('a');
    a.href = window.location.href;
    var pathname = a.pathname.indexOf('/') === 0 ? a.pathname.substring(1) : a.pathname;
    var index = pathname.indexOf('/');
    if (index < 0) {
      index = pathname.length;
    }
    var firstPart = pathname.substring(0, index);
    if (!(firstPart.toUpperCase() in STRINGS_ON_DIFFERENT_LANGUAGES)) {
      index = 0;
    }

    var newLang = currentLang.toLowerCase() === 'en' ? '' : currentLang.toLowerCase();
    var pathWithoutLanguage = pathname.substring(index);
    a.pathname = newLang === '' ? pathWithoutLanguage : '/' + newLang + pathWithoutLanguage;
    if (a.pathname[a.pathname.length - 1] !== '/') {
      a.pathname += '/';
    }
    history.replaceState(
      {},
      document.getElementsByTagName("title")[0].innerHTML,
      a.href);

    // Change logo link
    document.getElementById('logo_link').href = '/' + newLang;

    // No items
    for (var no_item_id in strings.no_items) {
      var noItemsHTML;
      if (Array.isArray(strings.no_items[no_item_id])) {
        noItemsHTML = '<ul class="no_items__notice_list">';
        for (var i in strings.no_items[no_item_id]) {
          noItemsHTML += '<li>' + strings.no_items[no_item_id][i] + '</li>';
        }
        noItemsHTML += '</ul>';
      } else {
        noItemsHTML = strings.no_items[no_item_id];
      }
      var item = document.getElementById(no_item_id);
      if (item) {
        item.innerHTML = noItemsHTML;
      }
    }
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
      case 'NotAuthorized':
        break;
      default:
        var txt = err.message || err.name;
        if (txt) {
          webix.message({ type: 'error', text: txt });
        }
        break;
    }
    console.error(err);
  },

  info: function(message) {
    webix.message({ type: 'info', text: message, expire: 10000 });
  },

  refresh: function() {
    Mydataspace.emit('users.getMyProfile', {});
    UI.pages.refreshPage('apps', true);
    UI.pages.refreshPage('data', true);
  },

  /**
   * Handler of upload resource-file event for file input.
   * @param fileInput Input file
   * @param root Root for resource
   * @param type Type of resource - avatar, image or file
   * @param done Success upload feedback
   * @param fail Unsuccess upload feedback
   */
  uploadResource: function(fileInput, root, type, done, fail) {
    var formData = new FormData();
    if ((type === 'avatar' || type === 'image') && !fileInput.type.match('image.*')) {
      alert('Only images');
      return;
    }
    formData.append('root', root);
    formData.append('type', type);
    formData.append('file', fileInput);
    $.ajax({
      url: Mydataspace.options.apiURL + '/v1/entities/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      cache: false,
      headers: {
        authorization: 'Bearer ' + localStorage.getItem('authToken')
      }
    }).done(done).fail(fail);
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

  initConnection: function(withHeader) {
    Mydataspace.on('login', function() {
      if (isEmptyPathnameIgnoreLanguage(window.location.pathname)) {
        document.getElementById('bootstrap').style.display = 'none';
        document.getElementById('webix').style.display = 'block';
      }
      adminPanel_startWaiting(2000);
      UI.updateSizes();
      UI.refresh();
      if (withHeader) {
        $$('SIGN_IN_LABEL').hide();
        $$('menu_button').show();
      }
      $('#signin_modal').modal('hide');
      UI.entityTree.setReadOnly(false);
    });

    Mydataspace.on('logout', function() {
      if (!UIHelper.isViewOnly()) {
        document.getElementById('bootstrap').style.display = 'block';
        document.getElementById('webix').style.display = 'none';
      }
      document.getElementById('no_items').style.display = 'none';
      if (withHeader) {
        $$('menu').hide();
        $$('SIGN_IN_LABEL').show();
        $$('menu_button').hide();
      }
      UI.entityTree.setReadOnly(true);
    });

    UI.entityForm.listen();
    UI.entityList.listen();
    UI.entityTree.listen();

    Mydataspace.on('users.getMyProfile.res', function(data) {
      if (MDSCommon.isBlank(data['avatar'])) {
        data['avatar'] = '/images/no_avatar.svg';
      }
      $$('profile').setValues(data);
      $$('profile__authorizations').setValues(data);
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
      if ($$('app_list').getItem(data.clientId)) {
        $$('app_list').remove(data.clientId);
      }
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

  render: function(withHeader) {
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
        e.source.postMessage(MDSCommon.extend(Identity.dataFromId(UI.entityForm.selectedId), { message: 'fields', fields: values }), '*');
      }
    });


    //
    //
    //
    webix.ui(UILayout.popups.fieldIndexed);
    webix.ui(UILayout.popups.fieldType);
    webix.ui(UILayout.popups.searchScope);
    webix.ui(UILayout.popups.newRoot);
    webix.ui(UILayout.popups.newEntity);
    webix.ui(UILayout.popups.newRootVersion);


    webix.ui(UILayout.windows.editScript);
    webix.ui(UILayout.windows.addRoot);
    webix.ui(UILayout.windows.addEntity);
    webix.ui(UILayout.windows.cloneEntity);
    webix.ui(UILayout.windows.addTask);
    webix.ui(UILayout.windows.addProto);
    webix.ui(UILayout.windows.addResource);
    webix.ui(UILayout.windows.addField);
    webix.ui(UILayout.windows.addApp);
    webix.ui(UILayout.windows.changeVersion);
    webix.ui(UILayout.windows.addVersion);
    webix.ui(UILayout.windows.addWebsite);
    if (!withHeader) {
      UILayout.sideMenu.hidden = true;
      UILayout.sideMenu.height = 100;
    }
    webix.ui(UILayout.sideMenu);

    //
    // Admin panel
    //
    var rows = [];
    if (withHeader) {
      rows.push(UILayout.header);
    }
    rows.push(UILayout.apps);


    var dataPanels = [];
    dataPanels.push(UILayout.entityTree);

    if (window.parent === window && !webix.without_header) {
      dataPanels.push({
        id: 'my_data_panel__resizer_1',
        view: 'resizer'
      });
    }

    dataPanels.push(UILayout.entityList);
    dataPanels.push({
      id: 'my_data_panel__resizer_2',
      view: 'resizer'
    });
    dataPanels.push(UILayout.entityForm);
    rows.push({ id: 'my_data_panel',
      height: window.innerHeight - 46,
      cols: dataPanels
    });


    webix.ui({
      id: 'admin_panel',
      container: 'admin_panel',
      height: webix.without_header ? window.innerHeight - (50 + 85) : window.innerHeight,
      rows: rows
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
      // if (Router.isRoot() || Router.isFilterByName()) {
      //   $$('entity_tree__root_scope').define('icon', 'database');
      //   $$('entity_tree__search').setValue(Router.getSearch(true));
      // } else if ((Router.isEmpty() || Router.isMe())) {
      //   $$('entity_tree__root_scope').define('icon', 'user');
      //   $$('entity_tree__search').setValue(Router.getSearch());
      // } else {
      //   $$('entity_tree__root_scope').define('icon', 'globe');
      //   $$('entity_tree__search').setValue(Router.getSearch());
      // }
      // $$('entity_tree__root_scope').refresh();
    }

    updateTreeSearchScope();

    $(window).on('hashchange', function() {
      UI.pages.refreshPage('data', true);
      updateTreeSearchScope();
    });

    if (withHeader) {
      UI.updateLanguage();
    }
  },

  updateSizes: function() {
    var height = webix.without_header ? window.innerHeight - (50 + 85) : window.innerHeight;

    var editScriptWindowWidth =
      $$('admin_panel').$width -
      $$('my_data_panel__right_panel').$width -
      $$('my_data_panel__resizer_2').$width - 2;

    $$('edit_script_window').define({
      height: height,
      width: editScriptWindowWidth
    });

    $$('admin_panel').define({
      width: window.innerWidth,
      height: height
    });

    $$('my_data_panel').define({
      height: webix.without_header ? window.innerHeight - (50 + 85) : window.innerHeight - UILayout.HEADER_HEIGHT + 2
    });

    $$('edit_script_window').define({
      height: $$('my_data_panel__resizer_2').$height
    });
    $$('admin_panel').resize();
    $$('admin_panel').resize();
    $$('edit_script_window').resize();
  },

  showAccessToken: function() {
    Mydataspace.request('users.getMyAccessToken', {}, function(data) {
      document.getElementById('profile__access_key_wrap').innerHTML = '<div class="profile__access_key">' + data.accessToken + '</div>';
    }, function(err) {

    });
  },

  deleteEntity: function(entityId) {

  }
};

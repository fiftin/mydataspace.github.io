UIControls = {
  getFieldTypeSelectTemplate: function() {
    var options = [];
    for (var id in Fields.FIELD_TYPES) {
      options.push({ id: id, value: Fields.FIELD_TYPES[id].title });
    }
    return {
      view: 'combo',
      required: true,
      name: 'type',
      value: 's',
      // template:"#name#",
      label: STRINGS.TYPE,
      options: options
    };
  },

  getEntityTypeSelectTemplate: function() {
    return {
      view: 'combo',
      label: STRINGS.OTHERS_CAN,
      name: 'othersCan',
      value: 'view_children',
      options: [
        // { id: 'nothing', value: STRINGS.NOTHING },
        { id: 'read', value: STRINGS.ONLY_READ },
        // { id: 'view_children', value: STRINGS.READ_AND_VIEW_CHILDREN },
        { id: 'create_child', value: STRINGS.CREATE_ONE_CHILD },
        { id: 'create_children', value: STRINGS.CREATE_CHILDREN }
      ],
      labelWidth: UIHelper.LABEL_WIDTH
    };
  },
  /**
   * Returns object with initialized event handlers for typical modal dialog.
   */
  getOnForFormWindow: function(id) {
    var formId = id + '_form';
    var windowId = id + '_window';
    return {
      onHide: function() {
        $$(formId).clearValidation();
        $$(formId).setValues($$(formId).getCleanValues());
      },
      onShow: function() {
        $$(formId).focus();
        $$(formId).setDirty(false);
        $$(windowId + '__cancel_button').define('hotkey', 'escape');
      }
    };
  },

  addSpinnerToWindow: function(windowId) {
    $$(windowId.replace(/_window$/, '_form')).disable();
    var head = $$(windowId).getNode().querySelector('.webix_win_head > .webix_view > .webix_template');
    var spinner = document.createElement('i');
    spinner.className = 'fa fa-cog fa-spin fa-2x fa-fw webix_win_head_spinner';
    head.appendChild(spinner);
  },

  removeSpinnerFromWindow: function(windowId) {
    var head = $$(windowId).getNode().querySelector('.webix_win_head > .webix_view > .webix_template');
    var spinners = head.getElementsByClassName('webix_win_head_spinner');
    if (spinners.length !== 0) {
      head.removeChild(spinners[0]);
    }
    $$(windowId.replace(/_window$/, '_form')).enable();
  },

  getSubmitCancelForFormWindow: function(id, isLongExecutable) {
    if (isLongExecutable == null) {
      isLongExecutable = true;
    }
    var formId = id + '_form';
    var windowId = id + '_window';
    return { cols: [
        { view: 'button',
          id: windowId + '__create_button',
          value: STRINGS.CREATE,
          type: 'form',
          click: function() {
            if (isLongExecutable) {
              UIControls.addSpinnerToWindow(windowId);
            }
            $$(formId).callEvent('onSubmit');
          }
        },
        { view: 'button',
          id: windowId + '__cancel_button',
          value: STRINGS.CANCEL,
          click: function() { $$(windowId).hide() }
        }
      ]
    }
  },

  getLoginButtonView: function(providerName) {
    var authProvider = Mydataspace.getAuthProvider(providerName);
    return {
      view: 'button',
      label: authProvider.title,
      type: 'iconButton',
      icon: authProvider.icon,
      width: 250,
      height: 50,
      css: 'login_panel__' + providerName + '_button',
      click: function() {
        if (Mydataspace.isLoggedIn()) {
          throw new Error(STRINGS.ALREADY_LOGGED_IN);
        }
        Mydataspace.login(providerName);
      }
    };
  },

  getChangeVersionPopupData: function(isReadOnly) {
    if (isReadOnly) {
      return [{ id: 'new_version', value: STRINGS.ADD_VERSION }];
    }
    return [
      { id: 'new_version', value: STRINGS.ADD_VERSION },
//      { id: 'copy_version', value: 'Clone Current Version' },
      // { id: 'import_version', value: 'Import to New Version' },
//      { id: 'import_version_csv', value: 'Import New Version from CSV As Is' }
      { id: 'view_version', value: STRINGS.view_other_version_window_title },
      { id: 'switch_version', value: STRINGS.switch_default_version_window_title }
    ];
  },

  getNewEntityPopupData: function(id) {
    var path = id ? Identity.dataFromId(id).path : '';
    switch (path) {
      case '':
        return [
          {id: 'new_entity', value: STRINGS.new_entity, icon: 'file-o'},
          {id: 'import_wizard', value: STRINGS.import_entity},
          {id: 'new_resource', value: STRINGS.new_resource, icon: 'diamond'},
          {id: 'new_task', value: STRINGS.new_task, icon: 'file-code-o'},
          {id: 'new_proto', value: STRINGS.new_proto, icon: 'cube'}
//      { id: 'import_csv', value: 'Import Entity from CSV As Is' }
        ];
      case 'tasks':
        return [
          {id: 'new_task', value: STRINGS.new_task, icon: 'file-code-o'}
        ];
      case 'protos':
        return [
          {id: 'new_proto', value: STRINGS.new_proto, icon: 'cube'}
        ];
      case 'resources':
        return [
          {id: 'new_resource', value: STRINGS.new_resource, icon: 'diamond'}
        ];
      default:
        return [
          {id: 'new_entity', value: STRINGS.new_entity, icon: 'file-o'},
          {id: 'import_wizard', value: STRINGS.import_entity}
        ];
    }
  }
};

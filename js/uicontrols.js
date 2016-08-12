UIControls = {
  getFieldTypeSelectTemplate: function() {
    var options = [];
    for (var id in UIHelper.FIELD_TYPES) {
      options.push({ id: id, value: UIHelper.FIELD_TYPES[id].title });
    }
    return {
      view: 'select',
      required: true,
      name: 'type',
      label: 'Type',
      options: options
    };
  },

  getEntityTypeSelectTemplate: function() {
    return {
      view: 'select',
      label: 'Others Can',
      name: 'type',
      options: [
        { id: 'private', value: 'Only Read' },
        { id: 'public', value: 'Create Children' },
        { id: 'unique', value: 'Create One Child' },
      ],
      labelWidth: UIHelper.LABEL_WIDTH
    };
  },

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

  getSubmitCancelForFormWindow: function(id) {
    var formId = id + '_form';
    var windowId = id + '_window';
    return { cols: [
        { view: 'button',
          value: 'Create',
          type: 'form',
          click: function() { $$(formId).callEvent('onSubmit') }
        },
        { view: 'button',
          id: windowId + '__cancel_button',
          value: 'Cancel',
          type: 'danger', click: function() { $$(windowId).hide() }
        },
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
          throw new Error('Already logged in');
        }
        Mydataspace.login(providerName);
      }
    };
  },
};

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
      label: 'Type',
      name: 'type',
      options: [
        { id: 'private', value: 'Private' },
        { id: 'public', value: 'Public' },
        { id: 'unqiue', value: 'Unique' },
      ]
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
    var authProvider = MyDataSpace.authProviders[providerName];
    return {
      view: 'button',
      label: authProvider.title,
      type: 'iconButton',
      icon: authProvider.icon,
      width: 250,
      height: 50,
      css: 'login_panel__' + providerName + '_button',
      click: function() {
        if (MyDataSpace.isLoggedIn()) {
          throw new Error('Already logged in');
        }
        MyDataSpace.login(providerName);
      }
    };
  },
};

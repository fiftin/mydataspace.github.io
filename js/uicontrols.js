UIControls = {
  getFieldTypeSelectTemplate: function() {
    var options = [];
    for (let id in UIHelper.FIELD_TYPES) {
      options.push({ id: id, value: UIHelper.FIELD_TYPES[id].title });
    }
    return {
      view: 'select',
      required: true,
      name: 'type',
      label: STRINGS.TYPE,
      options: options
    };
  },

  getEntityTypeSelectTemplate: function() {
    return {
      view: 'select',
      label: STRINGS.OTHERS_CAN,
      name: 'othersCan',
      hidden: UI.isViewOnly(),
      options: [
        { id: 'nothing', value: STRINGS.NOTHING },
        { id: 'read', value: STRINGS.ONLY_READ },
        { id: 'view_children', value: STRINGS.READ_AND_VIEW_CHILDREN },
        { id: 'create_child', value: STRINGS.CREATE_ONE_CHILD },
        { id: 'create_children', value: STRINGS.CREATE_CHILDREN }
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
          type: 'danger', click: function() { $$(windowId).hide() }
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
  }
};

//
// My Apps Page
//
UILayout.apps =
{ id: 'my_apps_panel',
  height: window.innerHeight - UILayout.HEADER_HEIGHT,
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
      disabled: true
    },
    // Selected app edit
    { id: 'my_apps_panel__right_panel',
      rows: [
      { view: 'toolbar',
        cols: [
          { view: 'button',
            type: 'icon',
            icon: 'save',
            id: 'SAVE_APP_LABEL', label: STRINGS.SAVE_APP,
            width: 80,
            click: function() {
              UI.appForm_save();
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'refresh',
            id: 'REFRESH_APP_LABEL', label: STRINGS.REFRESH_APP,
            width: 100,
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
            width: 80,
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
          { view: 'text', id: 'NAME_LABEL_4', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.APP_LABEL_WIDTH },
          { view: 'textarea', id: 'DESCRIPTION_LABEL', label: STRINGS.DESCRIPTION, height: 100, name: 'description', labelWidth: UIHelper.APP_LABEL_WIDTH },
          // { view: 'text', id: 'LOGO_URL_LABEL', label: STRINGS.LOGO_URL, name: 'logoURL', labelWidth: UIHelper.LABEL_WIDTH },
          { view: 'text', id: 'SITE_URL_LABEL_1', label: STRINGS.SITE_URL, name: 'url', labelWidth: UIHelper.APP_LABEL_WIDTH },
          { view: 'text', id: 'CLIENT_ID_LABEL', label: STRINGS.CLIENT_ID, name: 'clientId', readonly:true, labelWidth: UIHelper.APP_LABEL_WIDTH }
        ],
        on: {
          onChange: function() { UI.appForm_updateToolbar() }
        }
      }
    ]}
  ]
};

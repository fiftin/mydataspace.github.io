UILayout.windows.changeVersion = {
  view: 'window',
  id: 'change_version_window',
  width: 700,
  position: 'center',
  modal: true,
  head: STRINGS.switch_default_version_window_title,
  on: {
    onShow: function() {
      // Update dialog title
      var title;
      switch ($$('change_version_window').mode) {
        case 'switch':
          title = STRINGS.switch_default_version_window_title;
          break;
        case 'view':
          title = STRINGS.view_other_version_window_title;
          break;
      }
      $$('change_version_window').getHead().define('template', title);
      $$('change_version_window').getHead().refresh();

      // Load and display data
      Mydataspace.request('entities.getRootVersions', {
        root: Identity.dataFromId(UI.entityList.getRootId()).root
      }).then(function(data) {
        $$('change_version_window__table').clearAll();
        $$('change_version_window__table').parse(data.versions.map(function(version) {
          return MDSCommon.extend(version, { id: version.version });
        }));
      }).catch(function(data) {
        UI.error(data);
      });
    }
  },
  body: {
    rows: [
      { view: 'datatable',
        id: 'change_version_window__table',
        height: 350,
        autowidth: true,
        select: 'row',
        columns: [
          { id: 'version', header: '#', width: 50, sort: 'int' },
          { id: 'createdAt', header: STRINGS.VERSION_CREATED_AT, width: 200 },
          { id: 'versionDescription', header: STRINGS.VERSION_DESCRIPTION, width: 450 }
        ]
      },
      { cols: [
          {},
          { view: 'button',
            value: 'OK',
            type: 'form',
            width: 150,
            click: function() {
              var version = $$('change_version_window__table').getSelectedItem().version;
              switch ($$('change_version_window').mode) {
                case 'switch':
                  UI.entityTree.changeCurrentRootVersion(UI.entityList.getRootId(), version);
                  break;
                case 'view':
                  UI.entityTree.viewRootVersion(UI.entityList.getRootId(), version);
                  break;
              }
              $$('change_version_window').hide();
            }
          },
          { width: 10 },
          { view: 'button',
            id: 'CANCEL_LABEL',
            width: 150,
            value: STRINGS.CANCEL,
            click: function() { $$('change_version_window').hide(); }
          }
        ],
        padding: 17
      }
    ] 
  }
};

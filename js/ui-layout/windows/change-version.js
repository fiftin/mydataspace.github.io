UILayout.windows.changeVersion = {
  view: 'window',
  id: 'change_version_window',
  width: 700,
  position: 'center',
  modal: true,
  head: STRINGS.CHANGE_VERSION,
  on: {
    onShow: function() {
      var title;

      switch ($$('change_version_window').mode) {
        case 'switch':
          title = 'Switch Default Version';
          break;
        case 'view':
          title = 'View Version...';
          break;
      }
      
      $$('change_version_window').getHead().define('template', title);
      $$('change_version_window').getHead().refresh();

      var root = UI.entityList.getRootId();
      Mydataspace.request('entities.getRootVersions', {
        root: root
      }).then(function(data) {
        $$('change_version_window__table').clearAll();
        $$('change_version_window__table').parse(data.versions.map(function(version) {
          return MDSCommon.extend(version, { id: version.version });
        }));
      }).catch(function(data) {
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
          { id: 'createdAt', header: 'Created At', width: 200 },
          { id: 'versionDescription', header: 'Description', width: 450 }
        ]
      },
      { cols: [
          {},
          { view: 'button',
            value: 'OK',
            type: 'form',
            width: 150,
            click: function() {
              switch ($$('change_version_window').mode) {
                case 'switch':
                  Mydataspace.entities.change({
                    root: UI.entityTree.currentId,
                    path: '',
                    fields: [{ name: '$version', value: version }]
                  }).then(function(data) {
                    alert('Switched to version ' + version);
                  });
                  break;
                case 'view':
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

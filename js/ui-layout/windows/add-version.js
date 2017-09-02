UILayout.windows.addVersion = {
    view: 'window',
    id: 'add_version_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.NEW_VERSION,
    on: UIControls.getOnForFormWindow('add_version'),
    body: {
      view: 'form',
      id: 'add_version_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if (!$$('add_version_form').validate()) {
            return;
          }

          Mydataspace.entities.create({
            root: UI.entityTree.currentId,
            path: '',
            fields: [
              { name: '$newVersion', value: true },
              { name: '$newVersionDescription', value: true }
            ]
          }).then(function() {
            $$('add_version_window').hide();
            UIControls.removeSpinnerFromWindow('add_version_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_version_window');
            //if (err.errors != null) {
            //  for (var i in err.errors) {
            //    var e = err.errors[i];
            //    switch (e.type) {
            //      case 'unique violation':
            //        if (e.path === 'entities_root_path') {
            //          $$('add_root_form').elements.root.define('invalidMessage', 'Name already exists');
            //          $$('add_root_form').markInvalid('root', true);
            //        }
            //        break;
            //    }
            //  }
            //} else {
            //  if (err.message.startsWith('ER_DATA_TOO_LONG:')) {
            //    $$('add_root_form').elements.root.define('invalidMessage', 'Too long');
            //    $$('add_root_form').markInvalid('root', true);
            //  } else {
            //    UI.error(err);
            //  }
            //}
          });
        }
      },
      elements: [
        { view: 'text', id: 'VERSION_DESCRIPTION_LABEL', label: STRINGS.VERSION_DESCRIPTION, required: true, name: 'versionDescription', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getSubmitCancelForFormWindow('add_version')
      ]
    }
};

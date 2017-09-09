UILayout.windows.addVersion = {
    view: 'window',
    id: 'add_version_window',
    width: 450,
    position: 'center',
    modal: true,
    head: STRINGS.ADD_VERSION,
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
          var currentData = Identity.dataFromId(UI.entityTree.currentId);
          Mydataspace.entities.create({
            root: currentData.root,
            path: '',
            version: currentData.version,
            fields: [
              { name: '$newVersion', value: true, type: 'b' },
              { name: '$newVersionDescription', value: $$('add_version_form').getValues().versionDescription, type: 's' }
            ]
          }).then(function() {
            $$('add_version_window').hide();
            UIControls.removeSpinnerFromWindow('add_version_window');
          }).catch(function(err) {
            UIControls.removeSpinnerFromWindow('add_version_window');
          });
        }
      },
      elements: [
        { view: 'text', id: 'VERSION_DESCRIPTION_LABEL', label: STRINGS.VERSION_DESCRIPTION, required: true, name: 'versionDescription', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getSubmitCancelForFormWindow('add_version')
      ]
    }
};

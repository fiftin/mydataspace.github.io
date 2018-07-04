UILayout.windows.addFile = {
  view: 'window',
  id: 'add_file_window',
  width: 300,
  position: 'center',
  modal: true,
  head: STRINGS.ADD_FILE,
  on: UIControls.getOnForFormWindow('add_file'),
  body: {
    view: 'form',
    id: 'add_file_form',
    borderless: true,
    on: {
      onSubmit: function() {
        if (!$$('add_file_form').validate()) {
          return;
        }
        var formData = $$('add_file_form').getValues();

        var req = MDSCommon.extend(Identity.dataFromId(UI.entityList.getRootId()), {
          fields: [{
            name: formData.name,
            value: '',
            type: 'j'
          }]
        });

        // TODO: add file
        Mydataspace.request('entities.change', req).then(function (data) {
          $$('add_file_window').hide();
          UIControls.removeSpinnerFromWindow('add_file_window');
        }, function (err) {
          UIControls.removeSpinnerFromWindow('add_file_window');

        });

      }
    },

    elements: [
      { view: 'text', required: true, id: 'NAME_LABEL_8', label: STRINGS.NAME, name: 'name' },
      UIControls.getSubmitCancelForFormWindow('add_file', false)
    ],

    rules: {
      name: function(value) {
        return /^[\w_-]+(\.[\w_-]+)+$/.test(value);
      }
    }
  }
};

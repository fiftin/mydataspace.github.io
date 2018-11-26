UILayout.windows.renameFile = {
  view: 'ModalDialog',
  id: 'rename_file_window',
  width: 300,
  position: 'center',
  modal: true,
  head: STRINGS.RENAME_FILE,
  on: UIControls.getOnForFormWindow('rename_file', {
    onShow: function () {
      $$('rename_file_form').setValues({
        name: Identity.getFileNameFromId($$('entity_tree').getSelectedId())
      });
      webix.UIManager.setFocus($$('NAME_LABEL_9'));
    }
  }),
  body: {
    view: 'form',
    id: 'rename_file_form',
    borderless: true,
    on: {

      onSubmit: function() {
        var form = this;
        if (!form.validate({ disabled: true })) {
          UIControls.removeSpinnerFromWindow('rename_file_window');
          form.focus('name');
          return;
        }

        var formData = $$('rename_file_form').getValues();
        var currentFileId = $$('entity_tree').getSelectedId();
        Mydataspace.request('entities.get', Identity.dataFromId(currentFileId)).then(function (data) {
          var req = MDSCommon.extend(Identity.dataFromId(UI.entityList.getCurrentId()), {
            fields: [{
              name: formData.name,
              value: data.fields[0].value,
              type: 'j'
            }, {
              name: Identity.getFileNameFromId(currentFileId),
              value: null
            }]
          });

          return Mydataspace.request('entities.change', req);
        }).then(function (data) {
          $$('rename_file_window').hide();
          UIControls.removeSpinnerFromWindow('rename_file_window');
        }, function (err) {
          UIControls.removeSpinnerFromWindow('rename_file_window');
        });
      }
    },

    elements: [
      { view: 'text', required: true, id: 'NAME_LABEL_9', label: STRINGS.NAME, name: 'name' },
      UIControls.getSubmitCancelForFormWindow('rename_file', false)
    ],

    rules: {
      name: function(value) {
        return /^[\w_-]+(\.[\w_-]+)+$/.test(value);
      }
    }
  }
};

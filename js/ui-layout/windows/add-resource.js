UILayout.windows.addResource = {
    view: 'window',
    id: 'add_resource_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.ADD_RESOURCE_WINDOW,
    on: UIControls.getOnForFormWindow('add_resource'),
    body: {
      view: 'form',
      id: 'add_resource_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if ($$('add_resource_form').validate()) {
            var formData = $$('add_resource_form').getValues();
            var newEntityId = Identity.childId(UI.entityList.getRootId(), 'test');
            var data = Identity.dataFromId(newEntityId);
            UI.uploadResource(
              document.getElementById('add_resource_form__file').files[0],
              data.root,
              formData.type,
              function(res) {
                $$('add_resource_window').hide();
                UIControls.removeSpinnerFromWindow('add_resource_window');
                UI.entityList.refresh();
              },
              function(err) {
                UIControls.removeSpinnerFromWindow('add_resource_window');
                for (var i in err.errors) {
                  var e = err.errors[i];
                  // switch (e.type) {
                  //   case 'unique violation':
                  //     if (e.path === 'entities_root_path') {
                  //       $$('add_resource_form').elements.name.define('invalidMessage', 'Name already exists');
                  //       $$('add_resource_form').markInvalid('name', true);
                  //     }
                  //     break;
                  // }
                }
              });
          }
        }
      },

      elements: [
        {
          cols: [
            { view: 'label',
              id: 'ADD_RESOURCE_FILE',
              required: true,
              label: STRINGS.ADD_RESOURCE_FILE,
              width: UIHelper.LABEL_WIDTH
            },
            {
              template: ' <input type="file" ' +
                        '        id="add_resource_form__file" ' +
                        '        required />',
              css: 'add_resource_form__file_wrap'
            }
          ]
        },
        {
          view: 'combo',
          label: STRINGS.ADD_RESOURCE_TYPE,
          name: 'type',
          value: 'file',
          options: [
            { id: 'avatar', value: STRINGS.AVATAR },
            { id: 'image', value: STRINGS.IMAGE },
            { id: 'file', value: STRINGS.FILE }
          ],
          labelWidth: UIHelper.LABEL_WIDTH
        },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_resource')
      ]
    }
};

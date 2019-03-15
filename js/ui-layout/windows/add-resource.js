UILayout.windows.addResource = {
    view: 'ModalDialog',
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
          if (!$$('add_resource_form').validate({ disabled: true })) {
            UIControls.removeSpinnerFromWindow('add_resource_window');
            return;
          }
          var window = $$('add_resource_window');
          var formData = $$('add_resource_form').getValues();
          var newEntityId = Identity.childId(UI.entityList.getCurrentId(), 'test');
          var data = Identity.dataFromId(newEntityId);
          UI.uploadResource(
            document.getElementById('add_resource_form__file').files[0],
            data.root,
            formData.type,
            function(res) {
              var callback = window.getShowData().callback;
              $$('add_resource_window').hide();
              UIControls.removeSpinnerFromWindow('add_resource_window');
              UI.entityList.refresh();
              callback && callback(res);
            },
            function(err) {
              UIControls.removeSpinnerFromWindow('add_resource_window');
              if (err.name === 'SequelizeUniqueConstraintError') {
                $$('add_resource_form').elements.name.define('invalidMessage', 'Name already exists');
                $$('add_resource_form').markInvalid('name', true);
              } else {
                UI.error(err);
              }
            });
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
          view: 'richselect',
          label: STRINGS.ADD_RESOURCE_TYPE,
          name: 'type',
          value: 'file',
          labelWidth: UIHelper.LABEL_WIDTH,
          suggest: {
            template: '<span class="webix_icon fa-#icon#"></span> #value#',
            body: {
              data: [
                // { id: 'avatar', value: STRINGS.AVATAR, icon: 'user' },
                // { id: 'image', value: STRINGS.IMAGE, icon: 'image' },
                { id: 'all', value: STRINGS.IMAGE, icon: 'image' },
                { id: 'file', value: STRINGS.FILE, icon: 'file' }
              ],
              template: '<span class="webix_icon fa-#icon#"></span> #value#'
            }
          }
        },
        // UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_resource')
      ]
    }
};

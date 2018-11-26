UILayout.windows.cloneEntity = {
    view: 'ModalDialog',
    id: 'clone_entity_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.CLONE_ENTITY,
    on: UIControls.getOnForFormWindow('add_entity'),
    body: {
      view: 'form',
      id: 'clone_entity_form',
      borderless: true,
      on: {
        onSubmit: function() {
          var window = $$('clone_entity_window');
          if (!$$('clone_entity_form').validate({ disabled: true })) {
            UIControls.removeSpinnerFromWindow('clone_entity_window');
            return;
          }
          var formData = $$('clone_entity_form').getValues();
          var selectedData = Identity.dataFromId(window.getShowData().entityId || UI.entityList.getCurrentId());
          var data = MDSCommon.extend(formData, {
            root: selectedData.root,
            fields: [],
            sourceRoot: selectedData.root,
            sourcePath: selectedData.path,
            sourceVersion: selectedData.version
          });

          Mydataspace.request('entities.create', data, function() {
            $$('clone_entity_window').hide();
            UIControls.removeSpinnerFromWindow('clone_entity_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('clone_entity_window');
            for (var i in err.errors) {
              var e = err.errors[i];
              switch (e.type) {
                case 'unique violation':
                  if (e.path === 'entities_root_path') {
                    $$('clone_entity_form').elements.name.define('invalidMessage', 'Name already exists');
                    $$('clone_entity_form').markInvalid('name', true);
                  }
                  break;
              }
            }
          });
        }
      },
      elements: [
        { view: 'text',
          required: true,
          id: 'CLONE_ENTITY_PATH_LABEL',
          label: STRINGS.CLONE_ENTITY_PATH,
          name: 'path',
          labelWidth: UIHelper.LABEL_WIDTH,
          placeholder: 'New folder path/name'
        },
        { view: 'richselect',
          required: true, id: 'CLONE_ENTITY_LOCATION_LABEL',
          label: STRINGS.CLONE_ENTITY_LOCATION,
          name: 'location',
          labelWidth: UIHelper.LABEL_WIDTH,
          value: 'public_html',
          options: [
            { id: 'public_html', value: 'public_html', icon: UIConstants.ENTITY_ICONS['public_html'] },
            { id: 'includes', value: 'includes', icon: UIConstants.ENTITY_ICONS['includes'] },
          ]
        },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('clone_entity')
      ]
    }
};

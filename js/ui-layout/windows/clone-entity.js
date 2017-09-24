UILayout.windows.cloneEntity = {
    view: 'window',
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
          if ($$('clone_entity_form').validate()) {
            var formData = $$('clone_entity_form').getValues();
            var newEntityId = Identity.childId(UI.entityList.getRootId(), formData.name);
            var data = Identity.dataFromId(newEntityId);
            data.fields = [];
            data.othersCan = formData.othersCan;
            var selectedData = Identity.dataFromId(UI.entityForm.selectedId);
            data.sourceRoot = selectedData.root;
            data.sourcePath = selectedData.path;
            data.sourceVersion = selectedData.version;
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
        }
      },
      elements: [
        { view: 'text', required: true, id: 'CLONE_ROOT_NAME_LABEL', label: STRINGS.CLONE_ROOT_NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        { view: 'text', required: true, id: 'CLONE_ENTITY_PATH_LABEL', label: STRINGS.CLONE_ENTITY_PATH, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('clone_entity')
      ]
    }
};

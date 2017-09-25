UILayout.windows.addEntity = {
    view: 'window',
    id: 'add_entity_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.new_entity,
    on: UIControls.getOnForFormWindow('add_entity'),
    body: {
      view: 'form',
      id: 'add_entity_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if ($$('add_entity_form').validate()) {
            var formData = $$('add_entity_form').getValues();
            var newEntityId = Identity.childId(UI.entityList.getRootId(), formData.name);
            var data = Identity.dataFromId(newEntityId);
            data.fields = [];
            data.othersCan = formData.othersCan;
            Mydataspace.request('entities.create', data, function() {
              $$('add_entity_window').hide();
              UIControls.removeSpinnerFromWindow('add_entity_window');
            }, function(err) {
              UIControls.removeSpinnerFromWindow('add_entity_window');
              if (err.name === 'SequelizeUniqueConstraintError') {
                $$('add_entity_form').elements.name.define('invalidMessage', 'Name already exists');
                $$('add_entity_form').markInvalid('name', true);
              } else {
                UI.error(err);
              }
            });
          }
        }
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_1', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_entity')
      ]
    }
};

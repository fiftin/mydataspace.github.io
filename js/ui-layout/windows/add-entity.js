UILayout.windows.addEntity = {
    view: 'ModalDialog',
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
          var window = $$('add_entity_window');
          var form = this;

          if (!form.validate()) {
            return;
          }

          var formData = form.getValues();
          var destFolderId = window.getShowData().entityId || UI.entityList.getCurrentId();
          var newEntityId = Identity.childId(destFolderId, formData.name);
          var data = Identity.dataFromId(newEntityId);

          data.fields = [];
          data.othersCan = formData.othersCan;
          Mydataspace.request('entities.create', data, function() {
            window.hide();
            UIControls.removeSpinnerFromWindow('add_entity_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_entity_window');
            if (err.name === 'SequelizeUniqueConstraintError') {
              form.elements.name.define('invalidMessage', 'Name already exists');
              form.markInvalid('name', true);
            } else {
              UI.error(err);
            }
          });
        }
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_1', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_entity')
      ]
    }
};

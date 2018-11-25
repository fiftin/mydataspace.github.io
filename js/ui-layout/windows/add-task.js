UILayout.windows.addTask = {
    view: 'ModalDialog',
    id: 'add_task_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.new_task,
    on: UIControls.getOnForFormWindow('add_task'),
    body: {
      view: 'form',
      id: 'add_task_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if ($$('add_task_form').validate()) {
            var formData = $$('add_task_form').getValues();
            var newEntityId = Identity.childId(Identity.rootId(UI.entityList.getCurrentId()), 'tasks/' + formData.name);
            var data = Identity.dataFromId(newEntityId);
            data.fields = [];
            data.othersCan = formData.othersCan;
            Mydataspace.request('entities.create', data, function() {
              $$('add_task_window').hide();
              UIControls.removeSpinnerFromWindow('add_task_window');
            }, function(err) {
              UIControls.removeSpinnerFromWindow('add_task_window');
              if (err.name === 'SequelizeUniqueConstraintError') {
                $$('add_task_form').elements.name.define('invalidMessage', 'Name already exists');
                $$('add_task_form').markInvalid('name', true);
              } else {
                UI.error(err);
              }
            });
          }
        }
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_7', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        // UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_task')
      ]
    }
};

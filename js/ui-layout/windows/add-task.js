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
          var window = $$('add_task_window');
          var form = this;
          if (!$$('add_task_form').validate({ disabled: true })) {
            UIControls.removeSpinnerFromWindow('add_task_window');
            return;
          }

          var formData = form.getValues();
          var newEntityId = Identity.childId(Identity.rootId(window.getShowData().entityId || UI.entityList.getCurrentId()), 'website/tasks/' + formData.name);
          var data = Identity.dataFromId(newEntityId);
          data.fields = [];
          data.othersCan = formData.othersCan;
          Mydataspace.entities.create(data).then(function() {
            window.hide();
            UIControls.removeSpinnerFromWindow('add_task_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_task_window');
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
        { view: 'text', required: true, id: 'NAME_LABEL_7', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        // UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_task')
      ],

      rules: {
        name: function(value) {
          return /^[\w-]+$/.test(value);
        }
      }
    }
};

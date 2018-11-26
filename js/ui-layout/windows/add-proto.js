UILayout.windows.addProto = {
    view: 'ModalDialog',
    id: 'add_proto_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.new_proto,
    on: UIControls.getOnForFormWindow('add_proto'),
    body: {
      view: 'form',
      id: 'add_proto_form',
      borderless: true,
      on: {
        onSubmit: function() {
          var window = $$('add_proto_window');
          if (!$$('add_proto_form').validate()) {
            UIControls.removeSpinnerFromWindow('add_proto_window');
            return;
          }
          var formData = $$('add_proto_form').getValues();
          var newEntityId = Identity.childId(Identity.rootId(window.getShowData().entityId || UI.entityList.getCurrentId()), 'protos/' + formData.name);
          var data = Identity.dataFromId(newEntityId);
          data.fields = [];
          data.othersCan = formData.othersCan;
          Mydataspace.request('entities.create', data, function() {
            $$('add_proto_window').hide();
            UIControls.removeSpinnerFromWindow('add_proto_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_proto_window');
            if (err.name === 'SequelizeUniqueConstraintError') {
              $$('add_proto_form').elements.name.define('invalidMessage', 'Name already exists');
              $$('add_proto_form').markInvalid('name', true);
            } else {
              UI.error(err);
            }
          });
        }
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_6', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_proto')
      ]
    }
};

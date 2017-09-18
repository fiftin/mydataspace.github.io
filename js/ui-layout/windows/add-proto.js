UILayout.windows.addProto = {
    view: 'window',
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
          if ($$('add_proto_form').validate()) {
            var formData = $$('add_proto_form').getValues();
            var newEntityId = Identity.childId(Identity.rootId(UI.entityList.getRootId()), 'protos/' + formData.name);
            var data = Identity.dataFromId(newEntityId);
            data.fields = [];
            data.othersCan = formData.othersCan;
            Mydataspace.request('entities.create', data, function() {
              $$('add_entity_window').hide();
              UIControls.removeSpinnerFromWindow('add_proto_window');
            }, function(err) {
              UIControls.removeSpinnerFromWindow('add_proto_window');
              for (var i in err.errors) {
                var e = err.errors[i];
                switch (e.type) {
                  case 'unique violation':
                    if (e.path === 'entities_root_path') {
                      $$('add_entity_form').elements.name.define('invalidMessage', 'Name already exists');
                      $$('add_entity_form').markInvalid('name', true);
                    }
                    break;
                }
              }
            });
          }
        }
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_6', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_proto')
      ]
    }
};

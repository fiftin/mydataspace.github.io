UILayout.windows.addRoot = {
    view: 'window',
    id: 'add_root_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.ADD_ROOT,
    on: UIControls.getOnForFormWindow('add_root'),
    body: {
      view: 'form',
      id: 'add_root_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if (!$$('add_root_form').validate()) {
            return;
          }
          // Send request to create new root entity
          var data = $$('add_root_form').getValues();
          data.path = '';
          data.fields = [];
          Mydataspace.request('entities.create', data, function() {
            $$('add_root_window').hide();
            UIControls.removeSpinnerFromWindow('add_root_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_root_window');
            switch (err.name) {
              case 'SequelizeValidationError':
                if (err.message === 'Validation error: Validation len failed') {
                  var msg = data.root.length > 10 ? 'Too long root name' : 'Too short root name';
                  $$('add_root_form').elements.root.define('invalidMessage', msg);
                  $$('add_root_form').markInvalid('root', true);
                }
                break;
              case 'SequelizeUniqueConstraintError':
                $$('add_root_form').elements.root.define('invalidMessage', 'Name already exists');
                $$('add_root_form').markInvalid('root', true);
                break;
              default:
                UI.error(err);
                break;
            }
          });
        }
      },
      elements: [
        { view: 'text', id: 'NAME_LABEL', label: STRINGS.NAME, required: true, name: 'root', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_root')
      ]
    }
};

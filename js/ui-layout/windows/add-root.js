UILayout.windows.addRoot = {
    view: 'window',
    id: 'add_root_window',
    width: 300,
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
            if (err.errors != null) {
              for (let i in err.errors) {
                let e = err.errors[i];
                switch (e.type) {
                  case 'unique violation':
                    if (e.path === 'entities_root_path') {
                      $$('add_root_form').elements.root.define('invalidMessage', 'Name already exists');
                      $$('add_root_form').markInvalid('root', true);
                    }
                    break;
                }
              }
            } else {
              if (err.message.startsWith('ER_DATA_TOO_LONG:')) {
                $$('add_root_form').elements.root.define('invalidMessage', 'Too long');
                $$('add_root_form').markInvalid('root', true);
              } else {
                UI.error(err);
              }
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

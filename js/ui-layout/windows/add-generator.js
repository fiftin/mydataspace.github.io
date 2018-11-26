UILayout.windows.addGenerator = {
  view: 'ModalDialog',
  id: 'add_generator_window',
  width: 350,
  position: 'center',
  modal: true,
  head: STRINGS.new_generator,
  on: UIControls.getOnForFormWindow('add_generator', null, 'name'),
  body: {
    view: 'form',
    id: 'add_generator_form',
    borderless: true,
    on: {
      onSubmit: function() {
        var window = $$('add_generator_window');
        var form = this;

        if (!form.validate({ disabled: true })) {
          UIControls.removeSpinnerFromWindow('add_generator_window');
          return;
        }

        var formData = form.getValues();
        var data = Identity.dataFromId(window.getShowData().entityId || UI.entityList.getCurrentId());
        data.path += '/' + formData.name;
        data.fields = [
          { name: 'dataFolder', value: formData.dataFolder },
          { name: 'cacheFolder', value: formData.cacheFolder }
        ];

        Mydataspace.entities.create(data).then(function() {
          window.hide();
          UIControls.removeSpinnerFromWindow('add_generator_window');
        }, function(err) {
          UIControls.removeSpinnerFromWindow('add_generator_window');
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
      { view: 'text',
        required: true,
        id: 'NAME_LABEL_10',
        label: STRINGS.NAME,
        name: 'name',
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { view: 'text',
        id: 'ADD_GENERATOR_SRC_LABEL',
        name: 'dataFolder',
        label: STRINGS.ADD_GENERATOR_SRC,
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { view: 'text',
        id: 'ADD_GENERATOR_DEST_LABEL',
        name: 'cacheFolder',
        label: STRINGS.ADD_GENERATOR_DEST,
        labelWidth: UIHelper.LABEL_WIDTH
      },
      UIControls.getSubmitCancelForFormWindow('add_generator')
    ],

    rules: {
      name: function(value) {
        return /^[\w-]+$/.test(value);
      },

      dataFolder: function(value) {
        return /^(([\w-]+)(\/[\w-]+)*)?$/.test(value);
      },

      cacheFolder: function(value) {
        return /^(([\w-]+)(\/[\w-]+)*)?$/.test(value);
      }
    }
  }
};

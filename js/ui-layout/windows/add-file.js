UILayout.windows.addFile = {
  view: 'ModalDialog',
  id: 'add_file_window',
  width: 300,
  position: 'center',
  modal: true,
  head: STRINGS.ADD_FILE,
  on: UIControls.getOnForFormWindow('add_file', {
    onShow: function (id) {
      var options;
      switch (this.getShowData().fileType) {
        case 'scss':
          options = [
            { id: 'scss', value: 'SCSS File (*.scss)' },
            { id: 'css', value: 'CSS File (*.css)' }
          ];
          break;
        case 'pug':
          options = [
            { id: 'pug', value: 'Pug File (*.pug)' },
            { id: 'html', value: 'HTML File (*.html)' }
          ];
          break;
        default:
          options = [
            { id: 'pug', value: 'Pug File (*.pug)' },
            { id: 'html', value: 'HTML File (*.html)' },
            { id: 'scss', value: 'SCSS File (*.scss)' },
            { id: 'css', value: 'CSS File (*.css)' },
            { id: 'xml', value: 'XML File (*.xml)' },
            { id: 'json', value: 'JSON File (*.json)' },
            { id: 'txt', value: 'Text File (*.txt)' }
          ];
          break;
      }

      $$('NAME_LABEL_8').define('placeholder', 'Example: test, test.' + (this.getShowData().fileType || 'html'));
      $$('NAME_LABEL_8').refresh();

      $$('FILE_TYPE_LABEL').define('options', options);
      $$('FILE_TYPE_LABEL').refresh();
    }
  }, 'name'),
  body: {
    view: 'form',
    id: 'add_file_form',
    borderless: true,
    on: {
      onSubmit: function() {
        var form = this;

        if (!form.validate()) {
          return;
        }

        var formData = form.getValues();

        var filenameParts = formData.name.trim().split('.');

        var req = MDSCommon.extend(Identity.dataFromId(UI.entityList.getCurrentId()), {
          fields: [{
            name: filenameParts[0] + '.' + formData.type,
            value: '',
            type: 'j'
          }]
        });

        // TODO: add file
        Mydataspace.request('entities.change', req).then(function (data) {
          $$('add_file_window').hide();
          UIControls.removeSpinnerFromWindow('add_file_window');
        }, function (err) {
          UIControls.removeSpinnerFromWindow('add_file_window');
        });
      }
    },

    elements: [
      { view: 'text',
        required: true,
        id: 'NAME_LABEL_8',
        label: STRINGS.NAME,
        name: 'name',
        on: {
          onChange: function () {
            var filename = this.getValue();
            var parts = filename.split('.');
            if (parts.length > 2) {
              return false;
            }
            $$('FILE_TYPE_LABEL').setValue(parts[1]);
          },
          onTimedKeyPress: function () {
            var filenameParts = this.getValue().trim().split('.');
            if (filenameParts.length > 2 || MDSCommon.isBlank(filenameParts[1])) {
              return;
            }
            $$('FILE_TYPE_LABEL').setValue(filenameParts[1]);
          }
        }
      },
      {
        view: 'richselect',
        required: true,
        id: 'FILE_TYPE_LABEL',
        label: STRINGS.FILE_TYPE,
        name: 'type',
        placeholder: 'from extension...',
        options: [
        ]
      },
      UIControls.getSubmitCancelForFormWindow('add_file', false)
    ],

    rules: {
      name: function(value) {
        return /^[\w_-]+(\.[\w_-]+)?$/.test(value);
      }
    }
  }
};

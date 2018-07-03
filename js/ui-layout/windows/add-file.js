UILayout.windows.addFile = {
  view: 'window',
  id: 'add_file_window',
  width: 300,
  position: 'center',
  modal: true,
  head: STRINGS.ADD_FILE,
  on: UIControls.getOnForFormWindow('add_file'),
  body: {
    view: 'form',
    id: 'add_file_form',
    borderless: true,
    on: {
      onSubmit: function() {
        if (!$$('add_file_form').validate()) {
          return;
        }
        
        // TODO: add file

        setTimeout(function() {
          $$('add_file_window').hide();
        }, 100);

        setTimeout(function() {
          var n = window.localStorage.getItem('dont_forgot_to_save');
          if (MDSCommon.isPresent(n) && parseInt(n) > 3) {
            return;
          } else if (MDSCommon.isInt(n)) {
            n = parseInt(n) + 1;
          } else {
            n = 1;
          }
          window.localStorage.setItem('dont_forgot_to_save', n.toString());
          UI.info(STRINGS.dont_forgot_to_save);
        }, 600);
      }
    },

    elements: [
      { view: 'text', required: true, id: 'NAME_LABEL_8', label: STRINGS.NAME, name: 'name' },
      { view: 'text', id: 'VALUE_LABEL_2', label: STRINGS.VALUE, name: 'value' },
      UIControls.getSubmitCancelForFormWindow('add_file', false)
    ],

    rules: {
      name: function(value) { return typeof $$('entity_form__' + value) === 'undefined' },
      value: function(value) {
        var values = $$('add_file_form').getValues();
        return typeof typeInfo !== 'undefined' && typeInfo.isValidValue(value);
      }
    }
  }
};

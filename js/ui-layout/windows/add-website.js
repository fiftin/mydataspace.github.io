UILayout.windows.addWebsite = {
  view: 'ModalDialog',
  id: 'add_website_window',
  width: 350,
  position: 'center',
  modal: true,
  head: STRINGS.add_website,
  on: UIControls.getOnForFormWindow('add_website'),
  body: {
    view: 'form',
    id: 'add_website_form',
    borderless: true,
    on: {
      onSubmit: function() {
        if ($$('add_website_form').validate()) {
          var formData = $$('add_website_form').getValues();
          var newEntityId = Identity.childId(UI.entityList.getCurrentId(), formData.name);
          var data = Identity.dataFromId(newEntityId);
          data.path = 'website';
          data.fields = [];
          data.othersCan = formData.othersCan;
          Mydataspace.request('entities.create', data, function() {
            $$('add_website_window').hide();
            UIControls.removeSpinnerFromWindow('add_website_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_website_window');
            if (err.name === 'SequelizeUniqueConstraintError') {
              $$('add_website_form').elements.name.define('invalidMessage', 'Name already exists');
              $$('add_website_form').markInvalid('name', true);
            } else {
              UI.error(err);
            }
          });
        }
      }
    },
    elements: [
      UIControls.getEntityTypeSelectTemplate(),
      UIControls.getSubmitCancelForFormWindow('add_website')
    ]
  }
};

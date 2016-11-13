UILayout.windows.addApp = {
    view: 'window',
    id: 'add_app_window',
    width: 300,
    position: 'center',
    modal: true,
    head: STRINGS.NEW_APP,
    on: UIControls.getOnForFormWindow('add_app'),
    body: {
      view: 'form',
      id: 'add_app_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if (!$$('add_app_form').validate()) {
            return;
          }
          // Send request to create new app
          var data = $$('add_app_form').getValues();
          data.path = '';
          data.fields = [];
          Mydataspace.request('apps.create', data, function() {
            UIControls.removeSpinnerFromWindow('add_app_window');
          }, function() {
            ;
          });
        }
      },
      elements: [
        { view: 'text', id: 'NAME_LABEL_3', label: STRINGS.NAME, required: true, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        { view: 'text', id: 'SITE_URL_LABEL', label: STRINGS.SITE_URL, required: true, name: 'url', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getSubmitCancelForFormWindow('add_app')
      ]
    }
};

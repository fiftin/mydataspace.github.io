UILayout.windows.addApp = {
    view: 'window',
    id: 'add_app_window',
    width: 400,
    position: 'center',
    modal: true,
    head: STRINGS.NEW_APP_WINDOW,
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
          Mydataspace.request('apps.create', data, function(res) {
            UIControls.removeSpinnerFromWindow('add_app_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_app_window');

          });
        }
      },
      elements: [
        { view: 'text', id: 'NAME_LABEL_3', label: STRINGS.NAME, required: true, name: 'name', labelWidth: UIHelper.APP_LABEL_WIDTH },
        { view: 'text', id: 'SITE_URL_LABEL', label: STRINGS.SITE_URL, tooltip:"Hello World Hello WOrld!!", required: true, name: 'url', labelWidth: UIHelper.APP_LABEL_WIDTH },
        UIControls.getSubmitCancelForFormWindow('add_app')
      ]
    }
};

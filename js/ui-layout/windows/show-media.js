UILayout.windows.showMedia = {
  view: 'window',
  id: 'show_media_window',
  width: 900,
  position: 'center',
  modal: true,
  head: '',
  on: {
    onShow: function() {
      if (!UI.mediaToShow) {
        $$('show_media_window').hide();
      }
      var data = {};
      switch (UI.mediaToShow.type) {
        case 'image':
          data.media = '<img src="' + UI.mediaToShow.value + '" />';
          break;
        case 'youtube':
          break;
      }
    }
  },
  body: {
    rows: [
      { template: '#media#'
      },
      { cols: [
          {},
          { view: 'button',
            value: 'OK',
            type: 'form',
            width: 150,
            click: function() {
              $$('show_media_window').hide();
            }
          }
        ],
        padding: 17
      }
    ]
  }
};

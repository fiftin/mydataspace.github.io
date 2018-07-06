UILayout.windows.showMedia = {
  view: 'window',
  id: 'show_media_window',
  css: 'show_media_window',
  width: 900,
  position: 'center',
  animate:{ type: 'flip', subtype:' vertical' },
  autofit: true,
  autofocus: true,
  modal: true,
  head: {
    view: 'toolbar',
    margin: -4,
    cols: [
      { view: 'label',
        label: 'Demo'
      },
      { view: 'icon',
        icon: 'times',
        click: '$$(\'show_media_window\').hide();'
      }
    ]
  },
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
          data.media = '<iframe width="100%" height="506" src="https://www.youtube.com/embed/' + UI.mediaToShow.value + '?autoplay=1&amp;rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen=""></iframe>';
          break;
      }

      $$('show_media_window_content').parse(data);

      if (data.height) {
        $$('show_media_window_content').define('height', data.height);
        $$('show_media_window_content').refresh();
      }
    }
  },
  body: { template: '#media#',
    css: 'show_media_window_content',
    id: 'show_media_window_content',
    borderless: true,
    height: 506
  }
};

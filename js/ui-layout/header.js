UILayout.header =
  { css: 'admin_panel__header',
    cols: [
      { type: 'header' },
      { view: 'switch',
        width: 100,
        css: 'menu__mode_switch',
        onLabel: 'CMS',
        offLabel: 'Dev',
        value: window.localStorage.getItem('uiMode') === 'cms' ? 1 : 0,
        on: {
          onChange: function(newv, oldv) {
            UI.setMode(newv ? 'cms' : 'dev');
          }
        }
      },
      { view: 'button',
        width: 85,
        css: 'menu__language_button ' + (PROJECT_NAME === 'web20' ? ' menu__language_button--get_started' : ''),
        id: 'PRICING_LABEL',
        label: STRINGS.PRICING,
        hidden: PROJECT_NAME !== 'web20',
        click: function() {
          var currentLang = getCurrentLanguage().toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.location.href = currentLang + '/pricing';
          // window.open(currentLang + '/pricing', '_blank');
        }
      },
      { view: 'button',
        width: 80,
        css: 'menu__language_button',
        id: 'DOCS_LABEL',
        label: STRINGS.DOCS,
        click: function() {
          var currentLang = getCurrentLanguage().toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.location.href = currentLang + '/docs';
          // window.open(currentLang + '/docs', '_blank');
        }
      },
      { view: 'button',
        width: 100,
        css: 'menu__language_button',
        id: 'SKELETONS_LABEL',
        label: STRINGS.SKELETONS,
        hidden: PROJECT_NAME !== 'web20',
        click: function() {
          var currentLang = getCurrentLanguage().toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.location.href = currentLang + '/search';
          // window.open(currentLang + '/search', '_blank');
        }
      },

      { width: 20, css: 'menu__spacer' },
      { view: 'button',
        width: 90,
        id: 'SIGN_IN_LABEL',
        css: 'menu__login_button',
        label: STRINGS.SIGN_IN,
        hidden: UIHelper.isValidJWT(localStorage.getItem('authToken')),
        click: function() {
          $('#signin_modal').modal('show');
        }
      },
      { view: 'icon',
        icon: 'bars',
        hidden: !UIHelper.isValidJWT(localStorage.getItem('authToken')),
        id: 'menu_button',
        css: 'menu_button',
        click: function() {
          if($$('menu').config.hidden) {
            $$('menu').show();
          }
          else
            $$('menu').hide();
        }
      }
    ],
    height: UILayout.HEADER_HEIGHT
  };

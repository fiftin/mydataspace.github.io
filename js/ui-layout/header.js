UILayout.header =
  { css: 'admin_panel__header',
    cols: [
      { type: 'header' },
      { view: 'button',
        width: 120,
        css: 'menu__language_button menu__language_button--get_started',
        id: 'GET_STARTED_LABEL',
        label: STRINGS.GET_STARTED,
        click: function() {
          location.href = 'get-started';
        }
      },
      { view: 'button',
        width: 100,
        css: 'menu__language_button',
        id: 'DEMOS_LABEL',
        label: STRINGS.DEMOS,
        click: function() {
          location.href = 'demos';
        }
      },
      { view: 'button',
        width: 140,
        css: 'menu__language_button',
        id: 'DOCS_LABEL',
        label: STRINGS.DOCS,
        click: function() {
          location.href = 'docs';
        }
      },
      { width: 20, css: 'menu__spacer' },
      { view: 'button',
        width: 40,
        id: 'menu__language_button_en',
        css: 'menu__language_button ' + (LANGUAGE === 'EN' ? 'menu__language_button--selected' : ''),
        label: 'EN',
        click: function() {
          localStorage.setItem('language', 'EN');
          UI.updateLanguage();
        }
      },
      { view: 'button',
        width: 40,
        id: 'menu__language_button_ru',
        css: 'menu__language_button ' + (LANGUAGE === 'RU' ? 'menu__language_button--selected' : ''),
        label: 'RU',
        click: function() {
          localStorage.setItem('language', 'RU');
          UI.updateLanguage();
        }
      },
      { width: 20, css: 'menu__spacer' },
      { view: 'button',
        width: 90,
        hidden: localStorage.getItem('authToken') != null,
        id: 'SIGN_IN_LABEL',
        css: 'menu__login_button',
        label: STRINGS.SIGN_IN,
        click: function() {
          $('#signin_modal').modal('show');
        }
      },
      { view: 'button',
        width: 90,
        hidden: localStorage.getItem('authToken') == null || window.innerWidth <= UIHelper.SCREEN_XS,
        id: 'SIGN_OUT_LABEL',
        css: 'menu__login_button',
        label: STRINGS.SIGN_OUT,
        click: function() {
          Mydataspace.logout();
        }
      },
      { view: 'icon',
        icon: 'bars',
        hidden: localStorage.getItem('authToken') == null,
        id: 'menu_button',
        css: 'menu_button',
        click: function() {
          if( $$('menu').config.hidden) {
            $$('menu').show();
          }
          else
            $$('menu').hide();
        }
      }
    ],
    height: UILayout.HEADER_HEIGHT
  };

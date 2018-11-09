UILayout.header =
  { css: 'admin_panel__header',
    cols: [
      { type: 'header' },
      { view: 'button',
        width: 70,
        css: 'menu__language_button ' + (PROJECT_NAME === 'web20' ? ' menu__language_button--get_started' : ''),
        id: 'PRICING_LABEL',
        label: STRINGS.PRICING,
        hidden: PROJECT_NAME !== 'web20',
        click: function() {
          var currentLang = getCurrentLanguage().toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/pricing', '_blank');
        }
      },
      { view: 'button',
        width: 110,
        css: 'menu__language_button',
        id: 'DOCS_LABEL',
        label: STRINGS.DOCS,
        click: function() {
          var currentLang = getCurrentLanguage().toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/docs', '_blank');
        }
      },
      { view: 'button',
        width: 70,
        css: 'menu__language_button',
        id: 'SKELETONS_LABEL',
        label: STRINGS.SKELETONS,
        hidden: PROJECT_NAME !== 'web20',
        click: function() {
          var currentLang = getCurrentLanguage().toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/search', '_blank');
        }
      },
      { width: 10, css: 'menu__spacer' },

      { view: 'button',
        width: 30,
        id: 'menu__language_button_en',
        css: 'menu__language_button ' + (LANGUAGE === 'EN' ? 'menu__language_button--selected' : ''),
        label: 'EN',
        hidden: PROJECT_NAME !== 'web20',
        click: function() {
          // localStorage.setItem('language', 'EN');
          UI.updateLanguage('EN');
        }
      },
      { view: 'button',
        width: 30,
        id: 'menu__language_button_ru',
        css: 'menu__language_button ' + (LANGUAGE === 'RU' ? 'menu__language_button--selected' : ''),
        label: 'RU',
        hidden: PROJECT_NAME !== 'web20',
        click: function() {
          UI.updateLanguage('RU');
        }
      },

      { width: 10, css: 'menu__spacer' },
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

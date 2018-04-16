UILayout.header =
  { css: 'admin_panel__header',
    cols: [
      { type: 'header' },
      { view: 'button',
        width: 170,
        css: 'menu__language_button menu__language_button--feedback',
        id: 'FEEDBACK_LABEL',
        label: STRINGS.FEEDBACK,
        click: function() {
          showFeedbackModal(true);
        }
      },
      { view: 'button',
        width: 100,
        css: 'menu__language_button menu__language_button--get_started',
        id: 'FEATURES_LABEL',
        label: STRINGS.FEATURES,
        click: function() {
          var currentLang = (localStorage.getItem('language') || 'en').toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/features', '_blank');
        }
      },
      { view: 'button',
        width: 70,
        css: 'menu__language_button',
        id: 'DEMOS_LABEL',
        label: STRINGS.DEMOS,
        click: function() {
          var currentLang = (localStorage.getItem('language') || 'en').toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/demos', '_blank');
        }
      },
      { view: 'button',
        width: 110,
        css: 'menu__language_button',
        id: 'DOCS_LABEL',
        label: STRINGS.DOCS,
        click: function() {
          var currentLang = (localStorage.getItem('language') || 'en').toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/docs', '_blank');
        }
      },
      { width: 10, css: 'menu__spacer' },
      { view: 'button',
        width: 30,
        id: 'menu__language_button_en',
        css: 'menu__language_button ' + (LANGUAGE === 'EN' ? 'menu__language_button--selected' : ''),
        label: 'EN',
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
        click: function() {
          // localStorage.setItem('language', 'RU');
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

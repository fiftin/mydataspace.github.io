UILayout.sideMenu =
  {
    view: 'sidemenu',
    id: 'menu',
    width: 200,
    position: 'right',
    state: function(state) {
      state.top = UILayout.HEADER_HEIGHT - 2;
      state.height -= UILayout.HEADER_HEIGHT - 2;
    },
    body: {
      rows: [
        { view: 'template',
          borderless: true,
          id: 'profile',
          css: 'profile',
          template: '<div class="profile__img_wrap"><img class="profile__img" src="#avatar#" /></div>' +
                    '<div class="profile__name">#name#</div>' +
                    '<div class="profile__access_key_wrap" id="profile__access_key_wrap">' +
                      '<a class="profile__access_key_link" href="javascript: void(0)" onclick="return UI.showAccessToken()">' +
                        STRINGS.SHOW_ACCESS_KEY +
                      '</a>' +
                    '</div>',
          data: {
            avatar: '/images/no_avatar.svg',
            name: 'No name'
          }
        },
        { view: 'template',
          borderless: true,
          hidden: true,
          id: 'profile__authorizations',
          css: 'profile__authorizations',
          height: 40,
          template: function(obj) {
            return '<button onclick="Mydataspace.authorizeTasks(\'vk\');" ' +
              'class="profile__authorizations_btn profile__authorizations_btn--vk ' +
              (obj.vk ? 'profile__authorizations_btn--vk--active' : '') +
              '"><i onclick="" class="fa fa-vk"></i></button>';
          },
          data: {}
        },
        { view: 'list',
          id: 'menu__item_list',
          borderless: true,
          scroll: false,
          css: 'menu__item_list',
          template: '<span class="webix_icon fa-#icon#"></span> #value#',
          data:[
            { id: 'data', value: STRINGS.MY_DATA, icon: 'database' },
            { id: 'apps', value: STRINGS.MY_APPS, icon: 'cogs' },
            { id: 'logout', value: STRINGS.SIGN_OUT, icon: 'sign-out' }
          ],
          select: true,
          type: { height: 40 },
          on: {
            onSelectChange: function () {
              switch (this.getSelectedId()) {
                case 'data':
                  UI.pages.setCurrentPage('data');
                  break;
                case 'apps':
                  UI.pages.setCurrentPage('apps');
                  break;
                case 'logout':
                  Mydataspace.logout();
                  break;
                default:
                  // throw new Error('Illegal menu item id');
              }
            }
          }
        }
      ]
    }
  };

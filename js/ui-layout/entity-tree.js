UILayout.entityTree =
{ id: 'my_data_panel__left_panel',
  gravity: 0.5,
  rows: [
    { view: 'toolbar',
      elements: [
        { view: 'search',
          id: 'entity_tree__search',
          css: 'entity_list__search',
          icon: 'close',
          hidden: true,
          placeholder: STRINGS.SEARCH_BY_ROOTS,
          on: {
            onKeyPress: function(code, e) {
              if (code === 13 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                window.location.href = '/#' + $$('entity_tree__search').getValue();
                UI.pages.refreshPage('data');
                return false;
              }
            },
            onSearchIconClick: function() {
              window.location.href = '/#';
              UI.pages.refreshPage('data');
              $$('entity_tree__search').hide();
              $$('ADD_ROOT_LABEL').show();
              $$('REFRESH_LABEL').show();
              $$('entity_tree__menu_sep').show();
              $$('ROOT_SEARCH_LABEL').show();
            }
          }
        },
        { view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ROOT_LABEL', label: STRINGS.ADD_ROOT,
          width: 110,
          click: function() {
            $$('add_root_window').show();
          }
        },
        { view: 'button',
          type: 'icon',
          icon: 'refresh',
          id: 'REFRESH_LABEL', label: STRINGS.REFRESH,
          width: 100,
          click: function() {
            UI.pages.refreshPage('data');
          }
        },
        { id: 'entity_tree__menu_sep'
        },
        { view: 'button',
          type: 'icon',
          icon: 'search',
          id: 'ROOT_SEARCH_LABEL',
          width: 30,
          click: function() {
            $$('entity_tree__search').show();
            $$('ADD_ROOT_LABEL').hide();
            $$('REFRESH_LABEL').hide();
            $$('entity_tree__menu_sep').hide();
            $$('ROOT_SEARCH_LABEL').hide();
          }
        }
      ]
    },
    { view: 'tree',
      id: 'entity_tree',
      gravity: 0.4,
      select: true,
      template:function(obj, MDSCommon) {
        var icon =
          UIHelper.getIconByPath(Identity.dataFromId(obj.id).path,
                                 obj.$count === 0,
                                 obj.open);
        folder =
          '<div class="webix_tree_folder_open fa fa-' + icon + '"></div>';
        return MDSCommon.icon(obj, MDSCommon) +
               folder +
               '<span>' + obj.value + '</span>';
      },
      on: {
        onAfterLoad: function() {
          if (!UI.entityTree.getCurrentId()) {
            UI.entityTree.setCurrentIdToFirst();
          }
          $$('entity_tree').select(UI.entityTree.getCurrentId());
          $$('entity_tree').open(UI.entityTree.getCurrentId());
        },
        onBeforeOpen: function(id) {
          UI.entityTree.resolveChildren(id);
        },
        onSelectChange: function(ids) {
          var id = ids[0];
          if (id.endsWith(UIHelper.ENTITY_TREE_SHOW_MORE_ID)) {
            $$('entity_tree').select(UI.entityTree.getCurrentId());
          } else {
            UI.entityTree.setCurrentId(id);
            UI.entityList.setRootId(id);
            UI.entityForm.setSelectedId(id);
          }
        },
        onBeforeSelect: function(id, selection) {
          if (id.endsWith(UIHelper.ENTITY_TREE_SHOW_MORE_ID)) {
            UI.entityTree.showMore(Identity.parentId(id));
          }
        }
      }
    }
  ]
};

UILayout.entityTree =
{ id: 'my_data_panel__left_panel',
  gravity: 0.5,
  rows: [
    { view: 'toolbar',
      elements: [
        { view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ROOT_LABEL', label: STRINGS.ADD_ROOT,
          width: 110,
          click: function() {
            $$('add_root_window').show();
          }
        },
        { view: 'search',
          id: 'entity_tree__search',
          css: 'entity_list__search',
          align: 'center',
          placeholder: STRINGS.SEARCH_BY_ROOTS,
          on: {
            onKeyPress: function(code, e) {
              if (code === 13) {
                var search = $$('entity_tree__search').getValue();
                if (MDSCommon.isBlank(search)) {
                  search = '*';
                } else {
                  search = '*' + search + '*';
                }
                window.location.href = '/#' + search;
                UI.pages.refreshPage('data');
                return false;
              }
            }
          }
        }
      ]
    },
    { view: 'tree',
      id: 'entity_tree',
      gravity: 0.4,
      select: true,
      template:function(obj, MDSCommon) {
        var path = Identity.dataFromId(obj.id).path;
        // if (path === '') { // root
        //   var avatarURL = '/avatars/' + MDSCommon.findByName(obj.fields, 'avatar') + '.png';
        //   folder =
        //     '<div class="webix_tree_folder_open fa fa-' + icon + '">' +
        //       '<img class="entity_tree__root_icon" src="' + avatarURL + '" />' +
        //     '</div>';
        //   return MDSCommon.icon(obj, MDSCommon) +
        //          folder +
        //          '<span>' + obj.value + '</span>' +
        //          '<span>' + obj.value + '</span>';
        // }
        var icon = UIHelper.getIconByPath(path,
                                          obj.$count === 0,
                                          obj.open);
        ;
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

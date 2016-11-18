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
          hidden: UIHelper.isViewOnly(),
          width: 130,
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
        {}
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
          $$('entity_tree').select(UI.entityTree.setCurrentIdToFirst());
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

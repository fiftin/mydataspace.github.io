UILayout.entityList =
{ id: 'my_data_panel__central_panel',
  rows: [
    { view: 'toolbar',
      cols: [
        { view: 'button',
          type: 'icon',
          icon: 'refresh',
          id: 'REFRESH_ENTITY_LABEL_1', label: STRINGS.REFRESH_ENTITY,
          width: 65,
          click: function() { UI.entityList.refresh(); }
        },
        { view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ENTITY_LABEL', label: STRINGS.ADD_ENTITY,
          width: 70,
          popup: 'entity_tree__new_entity_popup'
        },
        { view: 'button',
          type: 'icon',
          icon: 'clone',
          id: 'NEW_VERSION_LABEL', label: STRINGS.NEW_VERSION,
          width: 110,
          popup: 'entity_tree__new_root_version_popup'
        },
        { view: 'search',
          id: 'entity_list__search',
          css: 'entity_list__search',
          align: 'center',
          icon: 'search',
          placeholder: STRINGS.SEARCH_BY_ENTITIES,
          on: {
            onTimedKeyPress: function(code, e) {
              UI.entityList.refresh();
            },
            onSearchIconClick: function() {
              // $$('entity_list__search').setValue('');
              // UI.entityList.refresh();
            }
          }
        }
      ]
    },
    { view: 'template',
      hidden: true,
      id: 'entity_list_blank_prompt',
      template: ''
    },
    { view: 'list',
      id: 'entity_list',
      select: true,
      template: function(obj) {
        var path = Identity.dataFromId(obj.id).path;
        var isTopLevelEntity = path.indexOf('/') < 0 && UIConstants.SYSTEM_PATHS.indexOf(path) < 0;
        var icon =
          UIHelper.getIconByPath(path,
                                 obj.count === 0,
                                 false);
        return (UIHelper.isListShowMore(obj.id) ? '' :
                  '<div class="entity_list__item_icon fa fa-' + icon + '"></div>') +
               '<div class="entity_list__item">' +
               '<div class="entity_list__item_name' + (isTopLevelEntity ? ' entity_list__item_name--top' : '') + '">' + obj.value + '</div>' +
               (obj.count == null ? '' :
                 '<div class="entity_list__item_count">' + obj.count + '</div>' +
                 '<div class="entity_list__item_count_prefix fa fa-copy"></div>') +
               '</div>';
      },
      on: {
        onBeforeSelect: function(id, selection) {
          if (UIHelper.isListShowMore(id)) {
            UI.entityList.showMore();
          } else {
            UI.entityList.setCurrentId(id);
          }
        },
        onSelectChange: function (ids) {
          var id = ids[0];
          if (UIHelper.isListShowMore(id)) {
            $$('entity_list').select(UI.entityList.getCurrentId());
          } else {
            UI.entityForm.setSelectedId(id);
          }
        },
        onItemDblClick: function(id) {
          var parentId = Identity.parentId(id);
          if (id === 'root' || parentId === 'root') {
            return;
          }

          if (id === UI.entityTree.getCurrentId()) {
            $$('entity_tree').select(parentId);
          } else {
            UI.entityTree.resolveChildren(parentId).then(function() {
              $$('entity_tree').open(parentId);
              $$('entity_tree').select(id);
            });
          }
        }
      }
    }
  ]
};

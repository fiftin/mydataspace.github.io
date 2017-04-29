UILayout.entityTree =
{ id: 'my_data_panel__left_panel',
  gravity: 0.2,
  rows: [
    { view: 'toolbar',
      elements: [
        { view: 'button',
          type: 'icon',
          icon: 'refresh',
          id: 'REFRESH_LABEL_2', label: STRINGS.REFRESH,
          width: 35,
          click: function() {
            UI.entityTree.refresh();
          }
        },
        { view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ROOT_LABEL', label: STRINGS.ADD_ROOT,
          hidden: true,
          width: 35,
          click: function() {
            $$('add_root_window').show();
          }
        },
        { view: 'button',
          width: 35,
          type: 'iconButton',
          icon: 'user',
          css: 'entity_tree__search_button',
          popup: 'entity_tree__root_scope_popup',
          id: 'entity_tree__root_scope',
          on: {
            onItemClick: function() {
              // this.currentFieldName = data.name;
              // $$('entity_form__field_type_popup_list').select(data.type);
            }.bind(this)
          }
        },
        { view: 'search',
          id: 'entity_tree__search',
          css: 'entity_tree__search',
          align: 'center',
          icon: 'close',
          placeholder: STRINGS.SEARCH_BY_ROOTS,
          on: {
            onAfterRender: function() {

            },
            onTimedKeyPress: function() {
              var search = $$('entity_tree__search').getValue();

              switch ($$('entity_tree__root_scope')._settings['icon']) {
                case 'user':
                  if (MDSCommon.isBlank(search)) {
                    search = 'me:*';
                  } else {
                    search = 'me:*' + search + '*';
                  }
                  break;
                case 'globe':
                  if (MDSCommon.isBlank(search)) {
                    search = '*';
                  } else {
                    search = '*' + search + '*';
                  }
                  break;
                case 'database':
                  break;
              }

              window.location.href = '/#' + search;
              UI.pages.refreshPage('data');
            }
          }
        }
      ]
    },
    { view: 'tree',
      id: 'entity_tree',
      css: 'entity_tree',
      gravity: 0.4,
      select: true,
      template:function(obj, common) {
        var path = Identity.dataFromId(obj.id).path;
        if (path === '') { // root
          var ava = MDSCommon.findValueByName(obj.associatedData.fields, 'avatar');
          var name = MDSCommon.findValueByName(obj.associatedData.fields, 'name') || obj.value;
          var description =
            MDSCommon.findValueByName(obj.associatedData.fields, 'description');
          var avatarURL = MDSCommon.isBlank(ava) ? '/images/icons/root.svg' :  Mydataspace.options.apiURL + '/avatars/sm/' + ava + '.png';
          var folder =
            '<div class="webix_tree_folder_open entity_tree__root_icon_wrap">' +
              '<img class="entity_tree__root_icon" src="' + avatarURL + '" />' +
            '</div>';

          var rootNameClass = 'entity_tree__root_name';
          if (MDSCommon.isBlank(description)) {
            rootNameClass += ' entity_tree__root_name--without-description';
          }
          return common.icon(obj, common) +
                 folder +
                 '<div class="entity_tree__root_wrap">' +
                   '<span class="entity_tree__root">' +
                     '<div class="' + rootNameClass + '">' + name + '</div>' +
                     (MDSCommon.isBlank(description) ? '' : '<div class="entity_tree__root_description">' + description + '</div>') +
                   '</span>' +
                 '</div>';
        }

        var icon = UIHelper.getIconByPath(path,
                                          obj.$count === 0,
                                          obj.open);
        return common.icon(obj, common) +
               '<div class="webix_tree_folder_open fa fa-' + icon + '"></div>' +
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
          // Request and add more items if "Show More" clicked
          if (id.endsWith(UIHelper.ENTITY_TREE_SHOW_MORE_ID)) {
            UI.entityTree.showMore(Identity.parentId(id));
          }
        }
      }
    }
  ]
};

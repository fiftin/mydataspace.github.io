UILayout.entityTree = {
  id: 'my_data_panel__left_panel',
  gravity: 0.2,
  hidden: window.parent !== window || webix.without_header,
  rows: [
    {
      view: 'toolbar',
      elements: [
        {
          view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ROOT_LABEL', label: STRINGS.ADD_ROOT,
          hidden: true,
          width: 120,
          click: function () {
            $$('add_root_window').show();
          }
        },
        {},
        {
          view: 'button',
          type: 'icon',
          icon: 'refresh',
          id: 'REFRESH_LABEL', label: STRINGS.REFRESH,
          width: 30,
          click: function () {
            UI.entityTree.refresh();
          }
        }
      ]
    },
    {
      view: 'tree',
      id: 'entity_tree',
      css: 'entity_tree',
      gravity: 0.4,
      select: true,
      template: function (obj, common) {
        var path = Identity.dataFromId(obj.id).path;

        var isTopLevelEntity = path.indexOf('/') < 0 && UIConstants.SYSTEM_PATHS.indexOf(path) < 0;
        if (obj.id.indexOf('#') >= 0) {

          return common.icon(obj, common) +
            '<div class="webix_tree_folder_open fa fa-file-code-o webix_tree_folder_open--file"></div>' +
            '<span class="webix_tree_item__name webix_tree_item__name--file">' + obj.value + '</span>';

        } else if (path === '') { // root
          if (!obj.associatedData.fields) {
            obj.associatedData.fields = [];
          }
          var ava = MDSCommon.findValueByName(obj.associatedData.fields, 'avatar');
          var name = MDSCommon.findValueByName(obj.associatedData.fields, 'name') || obj.value;
          var description = MDSCommon.findValueByName(obj.associatedData.fields, 'name') ? obj.associatedData.root : null;
          var avatarURL = MDSCommon.isBlank(ava) ? '/images/icons/root.svg' : Mydataspace.options.cdnURL + '/avatars/sm/' + ava + '.png';
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
          '<span class="webix_tree_item__name ' + (isTopLevelEntity ? ' webix_tree_item__name--top' : '') + '">' + obj.value + '</span>';
      },

      on: {
        onBeforeContextMenu: function (id) {
          this.select(id);
        },

        onAfterLoad: function () {
          if (!UI.entityTree.getCurrentId()) {
            UI.entityTree.setCurrentIdToFirst();
          }
          $$('entity_tree').select(UI.entityTree.getCurrentId());
          $$('entity_tree').open(UI.entityTree.getCurrentId());
        },

        // onAfterOpen: function (id) {
        //
        // },

        onBeforeOpen: function (id) {
          UI.entityTree.resolveChildren(id).then(function () {
            if (!Identity.isRootId(id) || UI.getMode() !== 'cms') {
              return;
            }

            var dataEntityId = Identity.idFromData(MDSCommon.extend(Identity.dataFromId(id), {path: 'data' }));

            UI.entityTree.resolveChildren(dataEntityId).then(function () {
              if ($$('entity_tree').getFirstChildId(dataEntityId) != null) {
                $$('entity_tree').open(dataEntityId);
              }
            });
          });
        },

        onSelectChange: function (ids) {
          var id = ids[0];
          if (UIHelper.isTreeShowMore(id)) {
            $$('entity_tree').select(UI.entityTree.getCurrentId());
          } else if (Identity.isFileId(id)) {
            UI.entityTree.editFile(id);
          } else {
            $$('script_editor').setValue('my_data_panel__central_panel');
            UI.setCurrentId(id);
            UI.entityList.updateBreadcrumbs(id);
          }
        },

        onBeforeSelect: function (id, selection) {
          // Request and add more items if "Show More" clicked
          if (UIHelper.isTreeShowMore(id)) {
            UI.entityTree.showMore(Identity.parentId(id));
          }
        }
      }
    }
  ]
};


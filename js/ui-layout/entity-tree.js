UILayout.entityTree = {
  id: 'my_data_panel__left_panel',
  gravity: 0.2,
  hidden: window.parent !== window || webix.without_header,
  rows: [
    { view: 'toolbar',
      elements: [
        { view: 'button',
          type: 'icon',
          icon: 'refresh',
          id: 'REFRESH_LABEL_2', label: STRINGS.REFRESH,
          width: 85,
          click: function() {
            UI.entityTree.refresh();
          }
        },
        { view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ROOT_LABEL', label: STRINGS.ADD_ROOT,
          hidden: true,
          width: 130,
          popup: PROJECT_NAME === 'web20' ? undefined : 'entity_tree__new_root_popup',
          click: function() {
            if (PROJECT_NAME === 'web20') {
              $$('add_root_window').show();
            }
          }
        },
//        { view: 'button',
//          type: 'icon',
//          icon: 'cloud-upload',
//          //hidden: true,
//          id: 'IMPORT_ROOT_LABEL', label: STRINGS.IMPORT_ROOT_LABEL,
//          width: 35,
//          click: function() {
//            $('#import_data_modal').modal('show');
//          }
//        },
        
        // { view: 'button',
        //   width: 35,
        //   type: 'iconButton',
        //   icon: 'user',
        //   css: 'entity_tree__search_button',
        //   popup: 'entity_tree__root_scope_popup',
        //   id: 'entity_tree__root_scope',
        //   on: {
        //     onItemClick: function() {
        //       // this.currentFieldName = data.name;
        //       // $$('entity_form__field_type_popup_list').select(data.type);
        //     }.bind(this)
        //   }
        // },
        // { view: 'search',
        //   id: 'entity_tree__search',
        //   css: 'entity_tree__search',
        //   align: 'center',
        //   icon: 'close',
        //   placeholder: STRINGS.SEARCH_BY_ROOTS,
        //   on: {
        //     onAfterRender: function() {
        //
        //     },
        //     onTimedKeyPress: function() {
        //       UI.entityTree.updateRouteBySearch();
        //     }
        //   }
        // }
      ]
    },
    { view: 'tree',
      id: 'entity_tree',
      css: 'entity_tree',
      gravity: 0.4,
      select: true,
      template:function(obj, common) {
        var path = Identity.dataFromId(obj.id).path;

        var isTopLevelEntity = path.indexOf('/') < 0 && UIConstants.SYSTEM_PATHS.indexOf(path) < 0;
        if (obj.id.indexOf('#') >= 0) {

          return common.icon(obj, common) +
            '<div class="webix_tree_folder_open fa fa-file-o webix_tree_folder_open--file"></div>' +
            '<span class="webix_tree_item__name webix_tree_item__name--file">' + obj.value + '</span>';

        } else if (path === '') { // root
          if (!obj.associatedData.fields) {
            obj.associatedData.fields = [];
          }
          var ava = MDSCommon.findValueByName(obj.associatedData.fields, 'avatar');
          var name = MDSCommon.findValueByName(obj.associatedData.fields, 'name') || obj.value;
          var description = MDSCommon.findValueByName(obj.associatedData.fields, 'name') ? obj.associatedData.root : null;
          var avatarURL = MDSCommon.isBlank(ava) ? '/images/icons/root.svg' :  Mydataspace.options.cdnURL + '/avatars/sm/' + ava + '.png';
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
          if (UIHelper.isTreeShowMore(id)) {
            $$('entity_tree').select(UI.entityTree.getCurrentId());
          } else if (Identity.isFileId(id)) {
            if (!$$('script_editor_' + id)) {
              $$('$tabbar1').show();
              $$('script_editor').addView({
                header: Identity.getFileNameFromId(id),
                close: true,
                css: 'script_editor__tab',
                body: {
                  id: 'script_editor_' + id,
                  view: 'ace-editor',
                  mode: 'javascript',
                  show_hidden: true,
                  on: {
                    onReady: function(editor) {
                      editor.getSession().setTabSize(2);
                      editor.getSession().setUseSoftTabs(true);
                      editor.getSession().setUseWorker(false);
                      editor.commands.addCommand({
                        name: 'save',
                        bindKey: { win: 'Ctrl-S' },
                        exec: function(editor) {
                          // TODO: save file
                          // TODO: lock editor

                          var request = MDSCommon.extend(Identity.dataFromId(id, { ignoreField: true }), {
                            fields: [{
                              name: Identity.getFileNameFromId(id),
                              type: 'j',
                              value: editor.getValue()
                            }]
                          });

                          Mydataspace.request('entities.change', request).then(function (data) {
                            $('div[button_id="script_editor_' + id + '"]').removeClass('script_editor__tab--dirty');
                            // TODO: unlock editor
                          }, function (err) {
                            // TODO: handle sating error
                          });
                        }
                      });
                    }
                  }
                }
              });

              Mydataspace.request('entities.get', Identity.dataFromId(id)).then(function (data) {
                $$('script_editor_' + id).setValue(data.fields[0].value);

                $$('script_editor_' + id).editor.on('change', function() {
                  $('div[button_id="script_editor_' + id + '"]').addClass('script_editor__tab--dirty');
                });
              });
            }
            $$('script_editor').show();
            $$('script_editor_' + id).show();
            var fileParentId = Identity.getEntityIdFromFileId(id);
            UI.entityTree.setCurrentId(fileParentId);
            UI.entityList.setRootId(fileParentId);
            UI.entityForm.setSelectedId(fileParentId);
          } else {
            UI.entityTree.setCurrentId(id);
            UI.entityList.setRootId(id);
            UI.entityForm.setSelectedId(id);
          }
        },
        onBeforeSelect: function(id, selection) {
          // Request and add more items if "Show More" clicked
          if (UIHelper.isTreeShowMore(id)) {
            UI.entityTree.showMore(Identity.parentId(id));
          }
        }
      }
    }
  ]
};


UILayout.entityTreeMenu = {
  view: 'contextmenu',
  id: 'entity_tree__menu',
  css: 'entity_tree__menu',
  data:[],
  on: {
    onShow: function () {
      this.data.clearAll();
      var id = $$('entity_tree').getSelectedId();
      if (Identity.isRootId(id)) {
        this.data.add({
          id: 'edit',
          value: 'Edit'
        });
        this.data.add({
          id: 'new-file',
          value: 'New File'
        });
      } else if (Identity.isFileId(id)) {
        this.data.add({
          id: 'rename-file',
          value: 'Rename'
        });
        this.data.add({
          id: 'delete-file',
          value: 'Delete'
        });
      } else {
        this.data.add({
          id: 'edit',
          value: 'Edit'
        });
        this.data.add({
          id: 'new-file',
          value: 'New File'
        });
      }
    },

    onItemClick: function (id) {
      switch (id) {
        case 'edit':
          UI.entityForm.startEditing();
          break;
        case 'new-file':
          $$('add_file_window').show();
          break;
        case 'delete-file':
          webix.confirm({
            title: STRINGS.DELETE_FILE,
            text: STRINGS.REALLY_DELETE,
            ok: STRINGS.YES,
            cancel: STRINGS.NO,
            callback: function(result) {
              if (!result) {
                return;
              }

              var fileId = $$('entity_tree').getSelectedId();
              var req = MDSCommon.extend(Identity.dataFromId(fileId, {ignoreField: true}), {
                fields: [{
                  name: Identity.getFileNameFromId(fileId),
                  value: null
                }]
              });

              Mydataspace.emit('entities.change', req);
            }
          });
          break;
        case 'rename-file':
          $$('rename_file_window').show();
          break;
      }
    }
  }
};
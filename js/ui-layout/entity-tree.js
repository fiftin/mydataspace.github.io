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
          icon: 'refresh',
          id: 'REFRESH_LABEL', label: STRINGS.REFRESH,
          width: 60,
          click: function () {
            UI.entityTree.refresh();
          }
        },
        {
          view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ROOT_LABEL', label: STRINGS.ADD_ROOT,
          hidden: true,
          width: 100,
          click: function () {
            $$('add_root_window').show();
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
            '<div class="webix_tree_folder_open fa fa-file-o webix_tree_folder_open--file"></div>' +
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

        onBeforeOpen: function (id) {
          UI.entityTree.resolveChildren(id);
        },

        onItemClick: function (id) {

          if (!Identity.isFileId(id)) {
            return;
          }

          if ($$('script_editor_' + id)) {
            return;
          }
          var fileName = Identity.getFileNameFromId(id);
          var fileExtInfo = UIHelper.getExtensionInfoForFile(fileName);

          $$('$tabbar1').show();
          $$('script_editor').addView({
            header: fileName,
            close: true,
            css: 'script_editor__tab',
            body: {
              id: 'script_editor_' + id,
              view: 'ace-editor',
              mode: fileExtInfo.mode,
              show_hidden: true,
              on: {
                onReady: function (editor) {
                  editor.getSession().setTabSize(2);
                  editor.getSession().setUseSoftTabs(true);
                  editor.getSession().setUseWorker(false);
                  editor.commands.addCommand({
                    name: 'save',
                    bindKey: {win: 'Ctrl-S'},
                    exec: function (editor) {
                      var request = MDSCommon.extend(Identity.dataFromId(id, {ignoreField: true}), {
                        fields: [{
                          name: Identity.getFileNameFromId(id),
                          type: 'j',
                          value: editor.getValue()
                        }]
                      });

                      Mydataspace.request('entities.change', request).then(function (data) {
                        var $tab = $('div[button_id="script_editor_' + id + '"]');
                        $tab.removeClass('script_editor__tab--dirty');
                        $tab.removeClass('script_editor__tab--error');
                        editor.getSession().clearAnnotations();
                      }, function (err) {
                        if (err.name === 'CodeError') {
                          $('div[button_id="script_editor_' + id + '"]').addClass('script_editor__tab--error');
                          editor.getSession().setAnnotations([{
                            row: err.line - 1,
                            column: err.column,
                            text: err.message,
                            type: 'error'
                          }]);
                        } else {
                          $('div[button_id="script_editor_' + id + '"]').addClass('script_editor__tab--error');
                          UI.error(err);
                        }
                      });
                    }
                  });
                }
              }
            }
          });

          Mydataspace.request('entities.get', Identity.dataFromId(id)).then(function (data) {
            $$('script_editor_' + id).setValue(data.fields[0].value);

            $$('script_editor_' + id).editor.on('change', function () {
              $('div[button_id="script_editor_' + id + '"]').addClass('script_editor__tab--dirty');
            });
          });

          $$('script_editor').show();
          $$('script_editor_' + id).show();


        },

        onSelectChange: function (ids) {
          var id = ids[0];
          if (UIHelper.isTreeShowMore(id)) {
            $$('entity_tree').select(UI.entityTree.getCurrentId());
          } else if (Identity.isFileId(id)) {

            var fileName = Identity.getFileNameFromId(id);
            var fileExtInfo = UIHelper.getExtensionInfoForFile(fileName);

            if (!$$('script_editor_' + id)) {
              $$('$tabbar1').show();
              $$('script_editor').addView({
                header: fileName,
                close: true,
                css: 'script_editor__tab',
                body: {
                  id: 'script_editor_' + id,
                  view: 'ace-editor',
                  mode: fileExtInfo.mode,
                  show_hidden: true,
                  on: {
                    onReady: function (editor) {
                      editor.getSession().setTabSize(2);
                      editor.getSession().setUseSoftTabs(true);
                      editor.getSession().setUseWorker(false);
                      editor.commands.addCommand({
                        name: 'save',
                        bindKey: {win: 'Ctrl-S'},
                        exec: function (editor) {
                          var request = MDSCommon.extend(Identity.dataFromId(id, {ignoreField: true}), {
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

                $$('script_editor_' + id).editor.on('change', function () {
                  $('div[button_id="script_editor_' + id + '"]').addClass('script_editor__tab--dirty');
                });
              });
            }
            $$('script_editor').show();
            $$('script_editor_' + id).show();
            var fileParentId = Identity.getEntityIdFromFileId(id);
            UI.entityTree.setCurrentId(fileParentId);
            UI.entityList.setCurrentId(fileParentId);
            UI.entityForm.setCurrentId(fileParentId);
          } else {
            UI.entityTree.setCurrentId(id);
            UI.entityList.setCurrentId(id);
            UI.entityForm.setCurrentId(id);
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


UILayout.entityTreeMenu = {
  view: 'contextmenu',
  css: 'entity_tree__menu',
  data:[],
  on: {
    onShow: function () {
      this.data.clearAll();

      var id = this._area && this._area.id ? this._area.id : UI.entityForm.getCurrentId();
      var itemData = Identity.dataFromId(id);
      // this.data.add({
      //   id: 'edit',
      //   value: STRINGS.context_menu.edit
      // });
      if (Identity.isFileId(id)) {
        this.data.add({
          id: 'rename_file',
          value: STRINGS.context_menu.rename_file
        });
        this.data.add({
          id: 'copy_file',
          value: STRINGS.context_menu.copy_file
        });
        this.data.add({
          id: 'delete_file',
          value: STRINGS.context_menu.delete_file
        });
      } else if (Identity.isRootId(id)) {
        this.data.add({
          id: 'regenerate_cache',
          value: STRINGS.context_menu.regenerate_cache
        });
        this.data.add({
          id: 'new_resource',
          value: STRINGS.new_resource
        });
        this.data.add({
          id: 'new_generator',
          value: STRINGS.context_menu.new_generator
        });

        this.data.add({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_root
        });
      } else if (itemData.path === 'tasks' || itemData.path === 'website/tasks') {
        this.data.add({
          id: 'new_task',
          value: STRINGS.new_task
        });
      } else if (itemData.path === 'protos') {
        this.data.add({
          id: 'new_proto',
          value: STRINGS.new_proto
        });
      } else if (itemData.path === 'resources') {
        this.data.add({
          id: 'new_resource',
          value: STRINGS.new_resource
        });
      } else if (itemData.path === 'website') {
        this.hide();
      } else if (itemData.path === 'data') {
        this.data.add({
          id: 'new_entity',
          value: STRINGS.new_entity
        });
      } else if (itemData.path === 'cache') {
        this.data.add({
          id: 'regenerate_cache',
          value: STRINGS.context_menu.regenerate_cache
        });
      } else if (itemData.path === 'website/includes') {
        this.data.add({
          id: 'new_file',
          value: STRINGS.context_menu.new_pug
        });
        this.data.add({
          id: 'new_entity',
          value: STRINGS.new_entity
        });
      } else if (itemData.path === 'website/scss') {
        this.data.add({
          id: 'new_file',
          value: STRINGS.context_menu.new_scss
        });
        this.data.add({
          id: 'new_entity',
          value: STRINGS.new_entity
        });
      } else if (itemData.path === 'website/public_html') {
        this.data.add({
          id: 'new_file',
          value: STRINGS.context_menu.new_file
        });
        this.data.add({
          id: 'new_entity',
          value: STRINGS.new_entity
        });
      } else if (itemData.path === 'website/generators') {
        this.data.add({
          id: 'new_generator',
          value: STRINGS.context_menu.new_generator
        });
      } else if (itemData.path.indexOf('website/tasks/') === 0) {
        this.data.add({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/generators/') === 0) {
        this.data.add({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/includes/') === 0) {
        this.data.add({
          id: 'new_file',
          value: STRINGS.context_menu.new_pug
        });
        this.data.add({
          id: 'new_entity',
          value: STRINGS.new_entity
        });
        this.data.add({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/public_html/') === 0) {
        this.data.add({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });
        this.data.add({
          id: 'new_file',
          value: STRINGS.context_menu.new_file
        });
        this.data.add({
          id: 'new_entity',
          value: STRINGS.new_entity
        });
        this.data.add({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('resources/') === 0) {
        this.data.add({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/scss/') === 0) {
        this.data.add({
          id: 'new_file',
          value: STRINGS.context_menu.new_scss
        });
        this.data.add({
          id: 'new_entity',
          value: STRINGS.new_entity
        });
        this.data.add({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('data/') === 0 || itemData.path.indexOf('protos/') === 0) {
        this.data.add({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });
        this.data.add({
          id: 'new_entity',
          value: STRINGS.new_entity
        });
        this.data.add({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      }
    },

    onItemClick: function (id) {
      var entityId;
      switch (this.config.id) {
        case 'entity_list_menu':
          entityId = UI.entityForm.getCurrentId();
          break;
        default:
          entityId = UI.entityList.getCurrentId();
          break;
      }

      switch (id) {
        case 'edit':
          UI.entityForm.startEditing();
          break;
        case 'delete_root':
        case 'delete_entity':
          webix.confirm({
            title: STRINGS.DELETE_ENTITY,
            text: STRINGS.REALLY_DELETE,
            ok: STRINGS.YES,
            cancel: STRINGS.NO,
            callback: function(result) {
              if (result) {
                UI.entityForm.delete();
              }
            }
          });
          break;
        case 'new_entity':
          var window = $$('add_entity_window');
          window.showWithData({ destFolderId: id });
          break;
        case 'new_resource':
          $$('add_resource_window').show();
          break;
        case 'new_task':
          $$('add_task_window').show();
          break;
        case 'new_proto':
          $$('add_proto_window').show();
          break;
        case 'new_file':
          $$('add_file_window').show();
          break;
        case 'delete_file':
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
        case 'rename_file':
          $$('rename_file_window').show();
          break;
      }
    }
  }
};
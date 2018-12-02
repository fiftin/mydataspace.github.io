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

        onBeforeOpen: function (id) {
          UI.entityTree.resolveChildren(id);
        },

        onSelectChange: function (ids) {
          var id = ids[0];
          if (UIHelper.isTreeShowMore(id)) {
            $$('entity_tree').select(UI.entityTree.getCurrentId());
          } else if (Identity.isFileId(id)) {

            var fileName = Identity.getFileNameFromId(id);
            var fileExtInfo = UIHelper.getExtensionInfoForFile(fileName);
            var editorId = 'script_editor_' + id;

            if (!$$(editorId)) {
              $$('$multiline-tabbar1').show();
              $$('script_editor').addView({
                header: fileName,
                close: true,
                css: 'script_editor__tab',
                body: {
                  id: editorId,
                  rows: [{ view: 'toolbar',
                    css: 'script_editor__toolbar',
                    elements: [
                      { view: 'button',
                        type: 'icon',
                        icon: 'save',
                        // id: 'SAVE_ENTITY_LABEL_2',
                        label: STRINGS.SAVE_ENTITY,
                        autowidth: true,
                        tooltip: 'Ctrl + S',
                        on: {
                          onItemClick: function () {
                            var editor = $$(editorId + '_ace').editor;
                            var request = MDSCommon.extend(Identity.dataFromId(id, {ignoreField: true}), {
                              fields: [{
                                name: Identity.getFileNameFromId(id),
                                type: 'j',
                                value: editor.getValue()
                              }]
                            });
                            Mydataspace.request('entities.change', request).then(function (data) {
                              $('div[button_id="' + editorId + '"]').removeClass('script_editor__tab--dirty');
                              // TODO: unlock editor
                            }, function (err) {
                              // TODO: handle sating error
                            });
                          }
                        }
                      },
                      { view: 'button',
                        type: 'icon',
                        icon: 'search',
                        // id: 'SCRIPT_EDITOR_FIND_LABEL_1',
                        label: STRINGS.SCRIPT_EDITOR_FIND,
                        autowidth: true,
                        tooltip: 'Ctrl + F',
                        on: {
                          onItemClick: function () {
                            var editor = $$(editorId + '_ace').editor;
                            editor.execCommand('find');
                          }
                        }
                      },
                      { view: 'button',
                        type: 'icon',
                        icon: 'sort-alpha-asc',
                        // id: 'SCRIPT_EDITOR_REPLACE_LABEL_1',
                        label: STRINGS.SCRIPT_EDITOR_REPLACE,
                        autowidth: true,
                        tooltip: 'Ctrl + H',
                        on: {
                          onItemClick: function () {
                            var editor = $$(editorId + '_ace').editor;
                            editor.execCommand('replace');
                          }
                        }
                      }, {}
                    ]
                  }, {
                    view: 'ace-editor',
                    mode: fileExtInfo.mode,
                    id: editorId + '_ace',
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
                              var $tab = $('div[button_id="' + editorId + '"]');
                              $tab.removeClass('script_editor__tab--dirty');
                              $tab.removeClass('script_editor__tab--error');
                              editor.getSession().clearAnnotations();
                            }, function (err) {
                              if (err.name === 'CodeError') {
                                $('div[button_id="' + editorId + '"]').addClass('script_editor__tab--error');
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
                  }]
                }
              });

              Mydataspace.request('entities.get', Identity.dataFromId(id)).then(function (data) {
                $$(editorId + '_ace').setValue(data.fields[0].value);
                $$(editorId + '_ace').editor.on('change', function () {
                  $('div[button_id="' + editorId + '"]').addClass('script_editor__tab--dirty');
                });
              });
            }
            $$('script_editor').show();
            $$('script_editor').setValue(editorId);

            var fileParentId = Identity.getEntityIdFromFileId(id);
            UI.setCurrentId(fileParentId);
          } else {
            UI.setCurrentId(id);
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


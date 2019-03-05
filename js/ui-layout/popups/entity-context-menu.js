UILayout.entityContextMenu = {
  view: 'contextmenu',
  css: 'entity-context-menu',
  template: '<i class="fa fa-#icon#" style="width: 23px;"></i> #value#',
  width: 180,
  data:[],
  on: {
    onShow: function () {
      this.data.clearAll();

      var id;
      switch (this.config.id) {
        case 'entity_list_menu':
          id = UI.entityList.getSelectedId();
          break;
        case 'entity_tree_menu':
          id = this._area && this._area.id ? this._area.id : UI.entityTree.getCurrentId();
          break;
        case 'entity_list_new_menu':
          id = document.getElementById('entity_list_breadcrumbs').getAttribute('data-entity-id');
          break;
        case 'entity_form_menu':
          id = UI.entityForm.getCurrentId();
          break;
        default:
          throw new Error();
      }

      var itemData = Identity.dataFromId(id);
      var menuItems = [];

      this.data.add({
        id: 'edit',
        value: STRINGS.context_menu.edit,
        icon: 'edit'
      });

      this.data.add({ $template: 'Separator' });

      if (Identity.isFileId(id)) {
        menuItems.push({
          id: 'rename_file',
          value: STRINGS.context_menu.rename_file
        });
        menuItems.push({
          id: 'copy_file',
          value: STRINGS.context_menu.copy_file
        });
        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_file',
          value: STRINGS.context_menu.delete_file
        });
      } else if (Identity.isRootId(id)) {
        menuItems.push({
          id: 'regenerate_cache',
          value: STRINGS.context_menu.regenerate_cache
        });
        menuItems.push({
          id: 'new_resource',
          value: STRINGS.context_menu.new_resource
        });
        // menuItems.push({
        //   id: 'new_generator',
        //   value: STRINGS.context_menu.new_generator
        // });
        menuItems.push({
          id: 'new_proto',
          value: STRINGS.context_menu.new_proto
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_root
        });
      } else if (itemData.path === 'tasks' || itemData.path === 'website/tasks') {
        menuItems.push({
          id: 'new_task',
          value: STRINGS.context_menu.new_task
        });
      } else if (itemData.path === 'protos') {
        menuItems.push({
          id: 'new_proto',
          value: STRINGS.context_menu.new_proto
        });
      } else if (itemData.path === 'resources') {
        menuItems.push({
          id: 'new_resource',
          value: STRINGS.context_menu.new_resource
        });
      } else if (itemData.path === 'website') {
        menuItems.push({
          id: 'new_generator',
          value: STRINGS.context_menu.new_generator
        });
        menuItems.push({
          id: 'new_task',
          value: STRINGS.context_menu.new_task
        });
      } else if (itemData.path === 'data') {
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path === 'cache') {
        menuItems.push({
          id: 'regenerate_cache',
          value: STRINGS.context_menu.regenerate_cache
        });
      } else if (itemData.path.startsWith('cache')) {
        menuItems.push({
          id: 'regenerate_cache',
          value: STRINGS.context_menu.regenerate_cache
        });
      } else if (itemData.path === 'website/includes') {
        menuItems.push({
          id: 'new_pug',
          value: STRINGS.context_menu.new_pug
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path === 'website/scss') {
        menuItems.push({
          id: 'new_scss',
          type: 'scss',
          value: STRINGS.context_menu.new_scss
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path === 'website/public_html' || itemData.path === 'website/wizards') {
        menuItems.push({
          id: 'new_file',
          value: STRINGS.context_menu.new_file
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path === 'website/generators') {
        menuItems.push({
          id: 'new_generator',
          value: STRINGS.context_menu.new_generator
        });
      } else if (itemData.path === 'processes') {
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path.indexOf('processes/') === 0) {
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/tasks/') === 0) {
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });
        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/generators/') === 0) {
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });

        menuItems.push({
          id: 'new_file',
          value: STRINGS.context_menu.new_file
        });

        menuItems.push({
          id: 'regenerate_cache',
          value: STRINGS.context_menu.regenerate_cache
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/includes/') === 0) {
        menuItems.push({
          id: 'new_pug',
          value: STRINGS.context_menu.new_pug
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/public_html/') === 0 || itemData.path.indexOf('website/wizards/') === 0) {
        menuItems.push({
          id: 'new_file',
          value: STRINGS.context_menu.new_file
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('resources/') === 0) {
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/scss/') === 0) {
        menuItems.push({
          id: 'new_scss',
          value: STRINGS.context_menu.new_scss
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('data/') === 0 || itemData.path.indexOf('protos/') === 0) {
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      }

      var i;

      for (i in menuItems) {
        var item = menuItems[i];
        switch (item.id) {
          case 'delete_entity':
          case 'delete_file':
            item.icon = 'times';
            break;
          case 'copy_entity':
          case 'copy_file':
            item.icon = 'copy';
            break;
          case 'regenerate_cache':
            item.icon = 'clock-o';
            break;
          case 'new_resource':
            item.icon = 'file-photo-o';
            break;
          case 'new_proto':
            item.icon = 'cube';
            break;
          case 'new_file':
            item.icon = 'file-text-o';
            break;
          case 'new_pug':
          case 'new_scss':
            item.icon = 'file-code-o';
            break;
          case 'new_entity':
            item.icon = 'folder-o';
            break;
          case 'new_generator':
            item.icon = 'asterisk';
            break;
          case 'new_task':
            item.icon = 'code';
            break;
          case 'rename_file':
            item.icon = 'pencil';
            break;
        }
        this.data.add(item);
      }
    },

    onItemClick: function (id) {
      var entityId;
      switch (this.config.id) {
        case 'entity_list_menu':
          entityId = UI.entityList.getSelectedId();
          break;
        case 'entity_tree_menu':
          entityId = UI.entityTree.getSelectedId();
          break;
        case 'entity_list_new_menu':
          entityId = document.getElementById('entity_list_breadcrumbs').getAttribute('data-entity-id');
          break;
        case 'entity_form_menu':
          entityId = UI.entityForm.getCurrentId();
          break;
        default:
          throw new Error();
      }

      switch (id) {
        case 'copy_file':
        case 'copy_entity':
          EntityForm.prototype.clone(entityId);
          break;
        case 'edit':
          if (Identity.isFileId(entityId)) {
            UI.entityTree.editFile(entityId);
          } else {
            $$('entity_list').select(entityId);
            UI.entityForm.startEditing();
          }
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
                UI.entityForm.delete(entityId);
              }
            }
          });
          break;
        case 'new_entity':
          $$('add_entity_window').showWithData({ entityId: entityId });
          break;
        case 'new_resource':
          $$('add_resource_window').showWithData({ entityId: entityId });
          break;
        case 'new_task':
          $$('add_task_window').showWithData({ entityId: entityId });
          break;
        case 'new_proto':
          $$('add_proto_window').showWithData({ entityId: entityId });
          break;
        case 'new_pug':
          $$('add_file_window').showWithData({ entityId: entityId, fileType: 'pug' });
          break;
        case 'new_scss':
          $$('add_file_window').showWithData({ entityId: entityId, fileType: 'scss' });
          break;
        case 'new_file':
          $$('add_file_window').showWithData({ entityId: entityId });
          break;
        case 'regenerate_cache':
          webix.confirm({
            title: STRINGS.REGEN_CACHE,
            text: STRINGS.REALLY_REGEN_CACHE,
            ok: STRINGS.YES,
            cancel: STRINGS.NO,
            callback: function(result) {
              if (!result) {
                return;
              }
              var cacheFolderData = Identity.dataFromId(entityId, {ignoreField: true});

              var pathPromise;
              switch (cacheFolderData.path) {
                case '':
                case 'generators':
                case 'cache':
                  pathPromise = Promise.resolve('cache');
                  break;
                default:
                  if (cacheFolderData.path.startsWith('cache/')) {
                    pathPromise = Promise.resolve(cacheFolderData.path);
                  } else if (cacheFolderData.path.startsWith('website/generators/')) {
                    pathPromise = new Promise(function (resolve, reject) {
                      Mydataspace.entities.get(cacheFolderData).then(function (data) {
                        resolve('cache/' + MDSCommon.findValueByName(data.fields, 'cacheFolder'));
                      }).catch(function (err) {
                        reject(err);
                      });
                    });
                  } else {
                    throw new Error('Incorrect path for cache updating: ' + cacheFolderData.path);
                  }
                  break;
              }

              pathPromise.then(function (path) {
                Mydataspace.emit('entities.create', {
                  root: cacheFolderData.root,
                  path: 'processes/' + MDSCommon.guid(),
                  fields: [{
                    name: 'type',
                    value: 'refreshCache',
                    type: 's'
                  }, {
                    name: 'cachePath',
                    value: path,
                    type: 's'
                  }]
                });
              });
            }
          });
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

              var req = MDSCommon.extend(Identity.dataFromId(entityId, {ignoreField: true}), {
                fields: [{
                  name: Identity.getFileNameFromId(entityId),
                  value: null
                }]
              });

              Mydataspace.emit('entities.change', req);
            }
          });
          break;
        case 'rename_file':
          $$('rename_file_window').showWithData({ entityId: entityId });
          break;
        case 'new_generator':
          $$('add_generator_window').showWithData({entityId: entityId});
          break;
      }
    }
  }
};
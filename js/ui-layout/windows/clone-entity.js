UILayout.windows.cloneEntity = {
    view: 'ModalDialog',
    id: 'clone_entity_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.CLONE_ENTITY,
    on: UIControls.getOnForFormWindow('clone_entity', {
      onShow: function () {
        var entityId = this.getShowData().entityId;
        var data = Identity.dataFromId(entityId);
        if (Identity.isFileId(entityId)) {
          $$('NAME_LABEL_11').setValue(Identity.getFileNameFromId(entityId));
          $$('clone_entity_others_can').hide();
          $$('NAME_LABEL_11').show();
        } else {
          $$('clone_entity_others_can').show();
          $$('NAME_LABEL_11').hide();
        }

        var path = data.path.match(/^((website\/[\w-]+)|([\w-]+))/);
        if (!path) {
          return;
        }
        path = path[1];
        var options;
        switch (path) {
          case 'website/tasks':
            options = [
              { id: 'website/tasks', value: 'tasks', icon: UIConstants.ENTITY_ICONS['tasks'] }
            ];
            break;
          case 'website/scss':
            options = [
              { id: 'website/scss', value: 'scss', icon: UIConstants.ENTITY_ICONS['scss'] },
              { id: 'website/public_html', value: 'public_html', icon: UIConstants.ENTITY_ICONS['public_html'] },
              { id: 'website/includes', value: 'includes', icon: UIConstants.ENTITY_ICONS['includes'] },
              { id: 'website/generators', value: 'generators', icon: UIConstants.ENTITY_ICONS['generators'] }
            ];
            break;
          case 'website/generators':
          case 'website/includes':
          case 'website/wizards':
          case 'website/public_html':
            options = [
              { id: 'website/public_html', value: 'public_html', icon: UIConstants.ENTITY_ICONS['public_html'] },
              { id: 'website/includes', value: 'includes', icon: UIConstants.ENTITY_ICONS['includes'] },
              { id: 'website/generators', value: 'generators', icon: UIConstants.ENTITY_ICONS['generators'] }
            ];
            break;
          case 'protos':
          case 'data':
            options = [
              { id: 'data', value: 'data', icon: UIConstants.ENTITY_ICONS['data'] },
              { id: 'protos', value: 'protos', icon: UIConstants.ENTITY_ICONS['protos'] }
            ];
            break;
          default:
            options = [
              { id: 'data', value: 'data', icon: UIConstants.ENTITY_ICONS['data'] },
              { id: 'website/public_html', value: 'public_html', icon: UIConstants.ENTITY_ICONS['public_html'] },
            ];
            break;
        }

        $$('CLONE_ENTITY_LOCATION_LABEL').setValue(path);
        $$('CLONE_ENTITY_LOCATION_LABEL').define('options', options);
        $$('CLONE_ENTITY_LOCATION_LABEL').refresh();
      }
    }, 'path'),
    body: {
      view: 'form',
      id: 'clone_entity_form',
      borderless: true,
      on: {
        onSubmit: function() {
          var window = $$('clone_entity_window');
          var form = this;
          if (!form.validate({ disabled: true })) {
            UIControls.removeSpinnerFromWindow(window);
            return;
          }

          var formData = form.getValues();
          var entityId = window.getShowData().entityId;
          var entityData = Identity.dataFromId(entityId);
          var path = MDSCommon.getChildPath(formData.location, formData.path);
          var req;

          if (Identity.isFileId(entityId)) {
            var filename = Identity.getFileNameFromId(entityId);
            req = Mydataspace.entities.get({
              root: entityData.root,
              path: entityData.path
            }).then(function (sourceData) {
              return Mydataspace.entities.change({
                root: entityData.root,
                path: path,
                fields: [{
                  name: formData.name,
                  value: MDSCommon.findValueByName(sourceData.fields, filename),
                  type: 's'
                }]
              });
            });
          } else {
            var data = {
              root: entityData.root,
              path: path,
              othersCan: formData.othersCan,
              fields: [],
              sourceRoot: entityData.root,
              sourcePath: entityData.path,
              sourceVersion: entityData.version
            };
            req = Mydataspace.entities.create(data).catch(function (err) {
              if (err.name === 'SequelizeUniqueConstraintError') {
                data.path += '/' + MDSCommon.getEntityName(entityData.path);
                return Mydataspace.entities.create(data);
              } else {
                return Promise.reject(err);
              }
            });
          }

          req.then(function() {
            window.hide();
            UIControls.removeSpinnerFromWindow(window);
          }, function(err) {
            UIControls.removeSpinnerFromWindow(window);

            switch (err.name) {
              case 'EntityDoesNotExist':
                form.markInvalid('path', 'Path does not exists');
                break;
              default:
                for (var i in err.errors) {
                  var e = err.errors[i];
                  switch (e.type) {
                    case 'unique violation':
                      if (e.path === 'entities_root_path') {
                        form.elements.name.define('invalidMessage', 'Name already exists');
                        form.markInvalid('name', true);
                      }
                      break;
                  }
                }
            }
          });
        }
      },
      elements: [
        { view: 'text',
          required: true,
          id: 'NAME_LABEL_11',
          label: STRINGS.NAME,
          name: 'name',
          labelWidth: UIHelper.LABEL_WIDTH
        },
        { view: 'text',
          // required: true,
          id: 'CLONE_ENTITY_PATH_LABEL',
          label: STRINGS.CLONE_ENTITY_PATH,
          name: 'path',
          labelWidth: UIHelper.LABEL_WIDTH,
          placeholder: STRINGS.CLONE_ENTITY_PATH_PLACEHOLDER
        },
        { view: 'richselect',
          required: true, id: 'CLONE_ENTITY_LOCATION_LABEL',
          label: STRINGS.CLONE_ENTITY_LOCATION,
          name: 'location',
          labelWidth: UIHelper.LABEL_WIDTH,
          value: 'public_html'
        },
        UIControls.getEntityTypeSelectTemplate('clone_entity_others_can'),
        UIControls.getSubmitCancelForFormWindow('clone_entity')
      ],

      rules: {
        path: function(value) {
          return /^(([\w-]+)(\/[\w-]+)*)?$/.test(value);
        }
      }
    }
};

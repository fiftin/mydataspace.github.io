function EntityForm() {
  this.editing = false;
  this.loadedListeners = [];
}

EntityForm.prototype.onLoaded = function(listener) {
  this.loadedListeners.push(listener);
};

EntityForm.prototype.emitLoaded = function(data) {
  this.loadedListeners.forEach(function(listener) {
    listener(data);
  });
};

/**
 * Switchs Entity Form to edit/view mode.
 */
EntityForm.prototype.setEditing = function(editing) {
  this.editing = editing;
  $$('edit_script_window').hide();
  if (editing) {
    $$('EDIT_ENTITY_LABEL').hide();
    $$('SAVE_ENTITY_LABEL').show();
    $$('CANCEL_ENTITY_LABEL').show();
    // $$('REFRESH_ENTITY_LABEL').hide();
    if (UIHelper.getEntityTypeByPath(Identity.dataFromId(this.selectedId).path) === 'task') {
      $$('RUN_SCRIPT_LABEL').show();
    } else {
      $$('RUN_SCRIPT_LABEL').hide();
    }
    $$('ADD_FIELD_LABEL').show();
    webix.html.addCss($$('edit_script_window__toolbar').getNode(), 'entity_form__toolbar--edit');
    webix.html.addCss($$('entity_form__toolbar').getNode(), 'entity_form__toolbar--edit');
    $$('edit_script_window__editor').getEditor().setReadOnly(false);
  } else {
    $$('EDIT_ENTITY_LABEL').show();
    $$('SAVE_ENTITY_LABEL').hide();
    $$('CANCEL_ENTITY_LABEL').hide();
    $$('RUN_SCRIPT_LABEL').hide();
    // $$('REFRESH_ENTITY_LABEL').show();
    $$('ADD_FIELD_LABEL').hide();
    webix.html.removeCss($$('edit_script_window__toolbar').getNode(), 'entity_form__toolbar--edit');
    webix.html.removeCss($$('entity_form__toolbar').getNode(), 'entity_form__toolbar--edit');
    $$('edit_script_window__editor').getEditor().setReadOnly(true);
  }
};

EntityForm.prototype.isEditing = function() {
  return this.editing;
};

EntityForm.prototype.listen = function() {
  Mydataspace.on('entities.delete.res', function() {
    $$('entity_form').disable();
  });
};

EntityForm.prototype.isProto = function() {
  return UIHelper.isProto(this.selectedId);
};

EntityForm.prototype.setSelectedId = function(id) {
  if (this.selectedId === id) {
    return;
  }
  this.selectedId = id;
  $$('edit_script_window').hide();
  this.refresh();
};


EntityForm.prototype.setLogRecords = function(fields, ignoredFieldNames, addLabelIfNoFieldsExists) {
  if (!Array.isArray(ignoredFieldNames)) {
    ignoredFieldNames = [];
  }
  if (addLabelIfNoFieldsExists == null) {
    addLabelIfNoFieldsExists = true;
  }
  var viewFields = document.getElementById('view__fields');
  if (MDSCommon.isBlank(fields)) {
    viewFields.innerHTML =
      addLabelIfNoFieldsExists ?
      '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>' :
      '';
  } else {
    viewFields.innerHTML = '';
    var numberOfChildren = 0;
    for (var i in fields) {
      var field = fields[i];
      if (ignoredFieldNames.indexOf(field.name) >= 0) {
        continue;
      }
      numberOfChildren++;
      var html = MDSCommon.textToHtml(field.value);
      var status = field.name.split('_')[1];
      var recordClass = 'view__log_record--' + status;
      if (MDSCommon.isBlank(html)) {
        switch (status) {
          case 'success':
            html = 'Script executed successfully';
            break;
          case 'fail':
            html = 'Script failed';
            break;
        }
      }
      var divFd = $('<div class="view__log_record ' + recordClass + '">' +
                        html +
                    '</div>').appendTo(viewFields);
    }
  }
  if (numberOfChildren === 0) {
    viewFields.innerHTML =
      addLabelIfNoFieldsExists ?
      '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>' :
      '';
  }
  return viewFields;
};


EntityForm.prototype.setViewFields = function(fields,
                                              ignoredFieldNames,
                                              addLabelIfNoFieldsExists,
                                              comparer,
                                              classResolver) {
  if (!Array.isArray(ignoredFieldNames)) {
    ignoredFieldNames = [];
  }
  if (addLabelIfNoFieldsExists == null) {
    addLabelIfNoFieldsExists = true;
  }
  var viewFields = document.getElementById('view__fields');
  if (MDSCommon.isBlank(fields)) {
    viewFields.innerHTML =
      addLabelIfNoFieldsExists ?
      '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>' :
      '';
  } else {
    viewFields.innerHTML = '';
    var numberOfChildren = 0;
    if (comparer) {
        fields.sort(comparer);
    }
    for (var i in fields) {
      var field = fields[i];
      if (ignoredFieldNames.indexOf(field.name) >= 0) {
        continue;
      }
      numberOfChildren++;
      var html = MDSCommon.textToHtml(field.value);
      var multiline = html.indexOf('\n') >= 0;
      var multilineClass = multiline ? 'view__field_value--multiline' : '';
      var multilineEnd = multiline ? '    <div class="view__field_value__end"></div>\n' : '';
      var fieldClass = classResolver ? classResolver(field) : '';
      var divFd = $('<div class="view__field ' + fieldClass + '">\n' +
                    '  <div class="view__field_name">\n' +
                    '    <div class="view__field_name_box">\n' +
                           field.name +
                    '    </div>\n' +
                    '  </div>\n' +
                    '  <div class="view__field_value ' + multilineClass + '">\n' +
                    '    <div class="view__field_value_box">\n' +
                           (MDSCommon.isPresent(field.value) ? html : '&mdash;') +
                    '    </div>\n' +
                         multilineEnd +
                    '  </div>\n' +
                    '</div>').appendTo(viewFields);
      if (multiline) {
        divFd.data('value', field.value);
      }
    }
  }
  if (numberOfChildren === 0) {
    viewFields.innerHTML =
      addLabelIfNoFieldsExists ?
      '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>' :
      '';
  }
  return viewFields;
};

EntityForm.prototype.setRootView = function(data) {
  $.ajax({ url: '/fragments/root-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    var websiteURL = MDSCommon.findValueByName(data.fields, 'websiteURL');
    var description = MDSCommon.findValueByName(data.fields, 'description');
    var tags = MDSCommon.findValueByName(data.fields, 'tags');
    var readme = MDSCommon.findValueByName(data.fields, 'readme');

    view.innerHTML = html;
    var ava = MDSCommon.findValueByName(data.fields, 'avatar');
    if (MDSCommon.isPresent(ava)) {
      ava = Mydataspace.options.apiURL + '/avatars/sm/' + ava + '.png';
    }
    document.getElementById('view__overview_image').src = ava || '/images/icons/root.png';
    document.getElementById('view__title').innerText =
      MDSCommon.findValueByName(data.fields, 'name') || MDSCommon.getPathName(data.root);

    document.getElementById('view__tags').innerText = tags || '';


    if (tags && websiteURL) {
      document.getElementsByClassName('view__overview_image_wrap')[0].classList.add('view__overview_image_wrap--large');
      document.getElementById('view__overview_image').classList.add('view__overview_image--large');
    } else if (tags || websiteURL) {
      document.getElementsByClassName('view__overview_image_wrap')[0].classList.add('view__overview_image_wrap--medium');
      document.getElementById('view__overview_image').classList.add('view__overview_image--medium');
    }


    if (MDSCommon.isBlank(websiteURL)) {
      document.getElementById('view__websiteURL').style.display = 'none';
    } else {
      document.getElementById('view__websiteURL').style.display = 'block';
      document.getElementById('view__websiteURL').innerText = websiteURL;
      document.getElementById('view__websiteURL').href = websiteURL;
    }

    if (MDSCommon.isBlank(description)) {
      if (MDSCommon.isBlank(readme)) {
        document.getElementById('view__description').innerHTML = '<i>No description or README provided.</i>';
      } else {
        document.getElementById('view__description').style.display = 'none';
      }
    } else {
      document.getElementById('view__description').innerText = description;
    }

    if (MDSCommon.isBlank(readme)) {
      document.getElementById('view__content').style.display = 'none';
    } else {
      document.getElementById('view__content').style.display = 'block';
    }
    document.getElementById('view__readme').innerHTML = md.render(readme);
    var viewFields = this.setViewFields(data.fields,
                                        ['name',
                                         'avatar',
                                         'description',
                                         'websiteURL',
                                         'readme',
                                         'tags'],
                                        false);
    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(this).data('value');
      if (value != null) {
        $$('edit_script_window__editor').setValue(value);
        if (!$$('edit_script_window').isVisible()) {
          $$('edit_script_window').show();
        }
      } else {
        $$('edit_script_window').hide();
      }
      $(this).addClass('view__field--active');
    });
  }.bind(this));
};

EntityForm.prototype.setTaskView = function(data) {
  $.ajax({ url: '/fragments/task-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    document.getElementById('view__overview_icon').className =
      'view__overview_icon fa fa-' +
      UIHelper.getIconByPath(data.path,
                             data.numberOfChildren === 0,
                             false);
    document.getElementById('view__title').innerText =
      MDSCommon.getPathName(data.path);

    var viewFields =
        this.setViewFields(data.fields,
                           ['status', 'statusText', 'interval'],
                           true,
                           function(x, y) {
                             if (x.name === 'main.js') {
                                 return 1;
                             }
                             if (y.name === 'main.js') {
                               return -1;
                             }
                             var isScriptX = /.*\.js$/.test(x.name);
                             var isScriptY = /.*\.js$/.test(y.name);
                             if (isScriptX && isScriptY || !isScriptX && !isScriptY) {
                                 if (x < y) {
                                     return -1;
                                 } else if (x.name > y.name) {
                                     return 1;
                                 } else {
                                     return 0;
                                 }
                             } if (isScriptX) {
                                 return 1;
                             } else {
                                 return -1;
                             }
                         }, function(x) {
                           if (x.name === 'main.js') {
                               return 'view__field--script view__field--script--main';
                           }
                           if (/.*\.js$/.test(x.name)) {
                             return 'view__field--script';
                           }
                           return '';
                         });
    var status = MDSCommon.findValueByName(data.fields, 'status');
    if (status != null) {
      var statusClass;
      switch (status) {
        case 'success':
          statusClass = 'view__status--success';
          break;
        case 'fail':
          statusClass = 'view__status--fail';
          break;
      }
      if (statusClass) {
        document.getElementById('view__status').classList.add(statusClass);
      }

      var statusText = MDSCommon.findValueByName(data.fields, 'statusText');
      if (!statusText) {
          switch (status) {
            case 'success':
              statusText = 'Script executed successfully';
              break;
            case 'fail':
              statusText = 'Script failed';
              break;
          }
      }
      document.getElementById('view__status').innerText = statusText;
    }

    var interval = MDSCommon.findValueByName(data.fields, 'interval') || 'paused';
    document.getElementById('view__interval_' + interval).classList.add('view__check--checked');

    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(this).data('value');
      if (value != null) {
        $$('edit_script_window__editor').setValue(value);
        if (!$$('edit_script_window').isVisible()) {
          $$('edit_script_window').show();
        }
      } else {
        $$('edit_script_window').hide();
      }
      $(this).addClass('view__field--active');
    });
  }.bind(this));
};

EntityForm.prototype.setEntityView = function(data) {
  $.ajax({ url: '/fragments/entity-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    document.getElementById('view__overview_icon').className =
      'view__overview_icon fa fa-' +
      UIHelper.getIconByPath(data.path,
                             data.numberOfChildren === 0,
                             false);
    document.getElementById('view__title').innerText =
      MDSCommon.getPathName(data.path);

    var description = data.fields.filter(function(x) { return x.name === 'description'; })[0];
    if (description != null) {
      $('#view__description').text(description.value);
    } else {
      $('#view__description').remove();
    }
    var viewFields = this.setViewFields(data.fields, ['description'], description == null);

    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(this).data('value');
      if (value != null) {
        $$('edit_script_window__editor').setValue(value);
        if (!$$('edit_script_window').isVisible()) {
          $$('edit_script_window').show();
        }
      } else {
        $$('edit_script_window').hide();
      }
      $(this).addClass('view__field--active');
    });
  }.bind(this));
};

EntityForm.prototype.setLogView = function(data) {
  $.ajax({ url: '/fragments/log-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    document.getElementById('view__overview_icon').className =
      'view__overview_icon fa fa-' +
      UIHelper.getIconByPath(data.path,
                             data.numberOfChildren === 0,
                             false);
    document.getElementById('view__title').innerText =
      MDSCommon.getPathName(data.path);
    var viewFields = this.setLogRecords(data.fields);
    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(this).data('value');
      if (value != null) {
        $$('edit_script_window__editor').setValue(value);
        if (!$$('edit_script_window').isVisible()) {
          $$('edit_script_window').show();
        }
      } else {
        $$('edit_script_window').hide();
      }
      $(this).addClass('view__field--active');
    });
  }.bind(this));
};

EntityForm.prototype.setView = function(data) {
  $('#view').append('<div class="view__loading"></div>');
  if (MDSCommon.isBlank(data.path)) {
    this.setRootView(data);
  } else if (UIHelper.getEntityTypeByPath(data.path) === 'task') {
    this.setTaskView(data);
  } else if (UIHelper.getEntityTypeByPath(data.path) === 'log') {
    this.setLogView(data);
  } else {
    this.setEntityView(data);
  }
  $$('entity_form').hide();
  $$('entity_view').show();
};

EntityForm.prototype.setData = function(data) {
  var formData = {
    name: Identity.nameFromData(data),
    othersCan: data.othersCan,
    description: data.description,
    maxNumberOfChildren: data.maxNumberOfChildren,
    isFixed: data.isFixed,
    childPrototype: Identity.idFromData(data.childPrototype)
  };
  this.clear();
  $$('entity_form').setValues(formData);
  if (MDSCommon.isBlank(data.path)) { // root entity
    this.addRootFields(data.fields);
  } else {
    this.addFields(data.fields);
  }
  this.setClean();
  $$('entity_view').hide();
  $$('entity_form').show();
};

EntityForm.prototype.refresh = function() {
  const self = this;
  const isWithMeta = self.isEditing();
  $$('entity_form').disable();
  const req = !isWithMeta ? 'entities.get' : 'entities.getWithMeta';
  Mydataspace.request(req, Identity.dataFromId(self.selectedId), function(data) {
    if (!isWithMeta) {
      self.setView(data);
      if (data.mine) {
        $$('EDIT_ENTITY_LABEL').show();
        $$('DELETE_ENTITY_SHORT_LABEL').show();
      } else {
        $$('EDIT_ENTITY_LABEL').hide();
        $$('DELETE_ENTITY_SHORT_LABEL').hide();
      }
    } else {
      self.setData(data);
      if (self.isProto()) {
        $$('PROTO_IS_FIXED_LABEL').show();
      } else {
        $$('PROTO_IS_FIXED_LABEL').hide();
      }
      $$('entity_form').enable();
    }
    self.emitLoaded(data);
    if ($$('edit_script_window').isVisible() && UI.entityForm.editScriptFieldId != null) {
      const editedField = $$(UI.entityForm.editScriptFieldId);
      if (editedField != null) {
        $$('edit_script_window__editor').setValue(editedField.getValue());
        $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
      } else {
        UI.entityForm.editScriptFieldId = null;
      }
    }
  }, function(err) {
    UI.error(err);
    $$('entity_form').enable();
  });
};

/**
 * Creates new entity by data received from the 'New Entity' form.
 * @param formData data received from form by method getValues.
 */
//EntityForm.prototype.createByFormData = function(formData) {
//  var newEntityId = Identity.childId(this.selectedId, formData.name);
//  var data = Identity.dataFromId(newEntityId);
//  data.fields = [];
//  data.type = formData.type;
//  Mydataspace.emit('entities.create', data);
//};

EntityForm.prototype.delete = function() {
  $$('entity_form').disable();
  Mydataspace.request('entities.delete', Identity.dataFromId(this.selectedId), function(data) {
    // do nothing because selected item already deleted.
  }, function(err) {
    UI.error(err);
    $$('entity_form').enable();
  });
};

EntityForm.prototype.updateToolbar = function() {
  // if (!$$('entity_form').isDirty()) {
  //   $$('SAVE_ENTITY_LABEL').disable();
  // } else {
  //   $$('SAVE_ENTITY_LABEL').enable();
  // }
};

/**
 * Marks entity form as unchanged.
 */
EntityForm.prototype.setClean = function() {
  $$('entity_form').setDirty(false);
  this.updateToolbar();
  $$('entity_form').enable();
};

/**
 * Marks entity form as changed.
 */
EntityForm.prototype.setDirty = function() {
  $$('entity_form').setDirty(true);
  this.updateToolbar();
};


EntityForm.prototype.save = function() {
  var dirtyData = webix.CodeParser.expandNames($$('entity_form').getDirtyValues());
  var existingData =
    webix.CodeParser.expandNames(
      Object.keys($$('entity_form').elements).reduce(function(ret, current) {
        ret[current] = '';
        return ret;
      }, {}));
  var oldData = webix.CodeParser.expandNames($$('entity_form')._values);
  MDSCommon.extendOf(dirtyData, Identity.dataFromId(this.selectedId));

  dirtyData.fields =
    Fields.expandFields(
      Fields.getFieldsForSave(Fields.expandFields(dirtyData.fields), // dirty fields
                                Object.keys(Fields.expandFields(existingData.fields) || {}), // current exists field names
                                Fields.expandFields(oldData.fields))); // old fields
  $$('entity_form').disable();
  if (typeof dirtyData.childPrototype !== 'undefined') {
    dirtyData.childPrototype = Identity.dataFromId(dirtyData.childPrototype);
  }
  Mydataspace.request('entities.change', dirtyData, function(res) {
    this.refresh();
    $$('entity_form').enable();
  }.bind(this), function(err) {
    UI.error(err);
    $$('entity_form').enable();
  }.bind(this));
};

/**
 * Removes all fields from the form.
 */
EntityForm.prototype.clear = function() {
  var rows = $$('entity_form').getChildViews();
  for (var i = rows.length - 1; i >= UIHelper.NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM; i--) {
    var row = rows[i];
    if (typeof row !== 'undefined') {
      $$('entity_form').removeView(row.config.id);
    }
  }
};

EntityForm.prototype.addFields = function(fields, setDirty) {
  for (var i in fields) {
    this.addField(fields[i], setDirty);
  }
};

EntityForm.prototype.addRootFields = function(fields, setDirty) {
  var ROOT_FIELDS = [
    'avatar',
    'name',
    'tags',
    'websiteURL',
    'description',
    'readme'
  ];

  fields.sort(function(x, y) {
    var xIndex = ROOT_FIELDS.indexOf(x.name);
    var yIndex = ROOT_FIELDS.indexOf(y.name);
    if (xIndex >= 0 && yIndex < 0) {
      return -1;
    }
    if (xIndex < 0 && yIndex >= 0) {
      return 1;
    }
    if (xIndex < 0 && yIndex < 0) {
      if (x.name < y.name) {
        return -1;
      } else if (x.name > y.name) {
        return 1;
      } else {
        return 0;
      }
    }
    if (xIndex < yIndex) {
      return -1;
    } else if (xIndex > yIndex) {
      return 1;
    } else {
      return 0;
    }
  });

  for (var i in fields) {
    if (ROOT_FIELDS.indexOf(fields[i].name) >= 0) {
      this.addRootField(fields[i], setDirty);
    } else {
      this.addField(fields[i], setDirty);
    }
  }
};

EntityForm.prototype.onUploadAvatar = function(event) {
  var formData = new FormData();
  var file = event.target.files[0];
  if (!file.type.match('image.*')) {
    alert('Only images');
    return;
  }
  formData.append('root', Identity.dataFromId(this.selectedId).root);
  formData.append('type', 'avatar');
  formData.append('file', file);
  $.ajax({
    url: Mydataspace.options.apiURL + '/v1/entities/upload',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    cache: false,
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('authToken')
    }
  }).done(function(res) {
    var entityName = res.resources[0];
    $$('entity_form__root_avatar_value').setValue(entityName);
    $('#entity_form__root_img').prop('src', Mydataspace.options.apiURL + '/avatars/sm/' + entityName + '.png');
  }).fail(function(err) {
    console.log(err);
  });
};

EntityForm.prototype.addRootField = function(data) {
  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  $$('NO_FIELDS_LABEL').hide();

  if (data.name === 'avatar') {
    $$('entity_form').addView({
      id: 'entity_form__' + data.name,
      css: 'entity_form__field entity_form__field--without-overflow',
      cols: [
        { view: 'text',
          value: data.name,
          name: 'fields.' + data.name + '.name',
          hidden: true
        },
        { view: 'text',
          value: data.type,
          id: 'entity_form__' + data.name + '_type',
          name: 'fields.' + data.name + '.type',
          hidden: true
        },
        { view: 'text',
          value: data.value,
          name: 'fields.' + data.name + '.value',
          id: 'entity_form__root_avatar_value',
          hidden: true
        },
        {
          view: 'label',
          css: 'entity_form__field_label_avatar',
          label: '<div style="visibility: hidden">fake</div>' +
                 '<div class="entity_form__field_label">' +
                  STRINGS.ROOT_FIELDS[data.name] +
                 '</div>' +
                 '<div class="entity_form__field_label_ellipse_right"></div>' +
                 '<div class="entity_form__field_label_ellipse"></div>',
          width: UIHelper.LABEL_WIDTH,
          height: 38,
        },
        {
          borderless: true,
          css: 'entity_form__root_img_template',
          template: '<img id="entity_form__root_img" class="entity_form__root_img" src="' +
                      Mydataspace.options.apiURL + '/avatars/sm/' + data.value + '.png' +
                    '" alt="Icon" />',
          width: 32
        },
        { width: 16 },
        {
          borderless: true,
          css: 'entity_form__root_img_upload_template',
          template: '<label class="entity_form__root_img_upload_lbl">' +
                    ' <input type="file" ' +
                    '        onchange="UI.entityForm.onUploadAvatar(event);"' +
                    '        required />' +
                    ' <span>Upload</span>' +
                    '</label>',
        },
        { width: 6 },
        {
          view: 'button',
          label: 'Browse',
          on: {
            onClick: function() {
            }
          }
        },
        { width: 6 },
        {
          view: 'button',
          label: 'Remove',
          on: {
            onClick: function() {
            }
          }
        }
      ]
    });
    return;
  }

  $$('entity_form').addView({
    id: 'entity_form__' + data.name,
    css: 'entity_form__field',
    cols: [
      { view: 'text',
        value: data.name,
        name: 'fields.' + data.name + '.name',
        hidden: true
      },
      { view: 'text',
        value: data.type,
        id: 'entity_form__' + data.name + '_type',
        name: 'fields.' + data.name + '.type',
        hidden: true
      },
      { view: 'text',
        label: '<div style="visibility: hidden">fake</div>' +
               '<div class="entity_form__field_label">' +
                STRINGS.ROOT_FIELDS[data.name] +
               '</div>' +
               '<div class="entity_form__field_label_ellipse_right"></div>' +
               '<div class="entity_form__field_label_ellipse"></div>',
        labelWidth: UIHelper.LABEL_WIDTH,
        name: 'fields.' + data.name + '.value',
        id: 'entity_form__' + data.name + '_value',
        value: data.value,
        height: 38,
        css: 'entity_form__text_label',
        placeholder: STRINGS.ROOT_FIELD_PLACEHOLDERS[data.name]
      }
    ]
  });
};

EntityForm.prototype.addField = function(data, setDirty) {
  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  $$('NO_FIELDS_LABEL').hide();
  if (typeof setDirty === 'undefined') {
    setDirty = false;
  }
  if (setDirty) {
    var values = webix.copy($$('entity_form')._values);
  }

  $$('entity_form').addView({
    id: 'entity_form__' + data.name,
    css: 'entity_form__field',
    cols: [
      { view: 'text',
        value: data.name,
        name: 'fields.' + data.name + '.name',
        hidden: true
      },
      { view: 'text',
        value: data.type,
        id: 'entity_form__' + data.name + '_type',
        name: 'fields.' + data.name + '.type',
        hidden: true
      },
      // {
      //   view: 'label',
      //   label: data.name,
      //   inputWidth: UIHelper.LABEL_WIDTH,
      // },
      { view: data.type === 'j' ? 'textarea' : 'text',
        label: '<div style="visibility: hidden">fake</div>' +
               '<div class="entity_form__field_label">' +
                data.name +
               '</div>' +
               '<div class="entity_form__field_label_ellipse_right"></div>' +
               '<div class="entity_form__field_label_ellipse"></div>',
        labelWidth: UIHelper.LABEL_WIDTH,
        name: 'fields.' + data.name + '.value',
        id: 'entity_form__' + data.name + '_value',
        value: data.value,
        height: 32,
        css: 'entity_form__text_label',
        readonly: data.type === 'j',
        on: {
          onBlur: function() {
            if (this.editScriptFieldId == 'entity_form__' + data.name + '_value') {
              this.editScriptFieldId = null;
            }
          },

          onFocus: function() {
            if (data.type === 'j') {
              this.editScriptFieldId = 'entity_form__' + data.name + '_value';
              $$('edit_script_window__editor').setValue($$(UI.entityForm.editScriptFieldId).getValue());
              $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
              if (!$$('edit_script_window').isVisible()) {
                $$('edit_script_window').show();
              }
            } else {
              $$('edit_script_window').hide();
            }
          }.bind(this)
        }
      },
      { view: 'button',
        width: 30,
        type: 'iconButton',
        icon: Fields.FIELD_TYPE_ICONS[data.type],
        css: 'entity_form__field_type_button',
        popup: 'entity_form__field_type_popup',
        options: Fields.getFieldTypesAsArrayOfIdValue(),
        id: 'entity_form__' + data.name + '_type_button',
        on: {
          onItemClick: function() {
            this.currentFieldName = data.name;
            $$('entity_form__field_type_popup_list').select(data.type);
          }.bind(this)
        }
      },
      { view: 'button',
        type: 'icon',
        css: 'entity_form__field_delete',
        icon: 'remove',
        width: 25,
        click: function() {
          this.deleteField(data.name);
        }.bind(this)
      }
    ]
  });
  if (setDirty) {
    $$('entity_form')._values = values;
    this.updateToolbar();
  }
};

EntityForm.prototype.deleteField = function(name) {
  var values = webix.copy($$('entity_form')._values);
  $$('entity_form').removeView('entity_form__' + name);
  $$('entity_form')._values = values;
  this.setDirty();
  var rows = $$('entity_form').getChildViews();
  if (rows.length === UIHelper.NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM) {
    $$('NO_FIELDS_LABEL').show();
  }
};

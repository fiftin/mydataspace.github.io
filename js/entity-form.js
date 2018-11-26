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
 * Switch Entity Form to edit/view mode.
 */
EntityForm.prototype.setEditing = function(editing) {
  if (this.currentId == null) {
      return;
  }

  this.editing = editing;
  UI.entityForm.hideScriptEditWindow();
  var entityType = UIHelper.getEntityTypeByPath(Identity.dataFromId(this.currentId).path);

  UIHelper.setVisible('entity_form__toolbar', editing);
  UIHelper.setVisible(['SAVE_ENTITY_LABEL', 'CANCEL_ENTITY_LABEL', 'ADD_FIELD_LABEL'], editing);

  if (editing) {
    webix.html.addCss($$('edit_script_window__toolbar').getNode(), 'entity_form__toolbar--edit');
    webix.html.addCss($$('entity_form__toolbar').getNode(), 'entity_form__toolbar--edit');
    $$('edit_script_window__editor').getEditor().setReadOnly(false);
  } else {
    webix.html.removeCss($$('edit_script_window__toolbar').getNode(), 'entity_form__toolbar--edit');
    webix.html.removeCss($$('entity_form__toolbar').getNode(), 'entity_form__toolbar--edit');
    $$('edit_script_window__editor').getEditor().setReadOnly(true);
  }
};

EntityForm.prototype.isEditing = function() {
  return this.editing;
};

EntityForm.prototype.listen = function() {
  var self = this;
  Mydataspace.on('entities.delete.res', function() {
    $$('entity_form').disable();
  });
};

EntityForm.prototype.isProto = function() {
  return UIHelper.isProto(this.currentId);
};

EntityForm.prototype.getCurrentId = function () {
  return this.currentId;
};

EntityForm.prototype.setCurrentId = function(id) {
  if (this.currentId === id) {
    return;
  }
  this.currentId = id;
  UI.entityForm.hideScriptEditWindow();
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
  if (MDSCommon.isBlank(fields.filter(function (field) { return field.name.indexOf('$') != 0; }))) {
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

EntityForm.getNoFieldsLabel = function(data) {
  return '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>';
};


EntityForm.prototype.setViewFields = function(data,
                                              ignoredFieldNames,
                                              addLabelIfNoFieldsExists,
                                              comparer,
                                              classResolver) {

  var fields = data.fields.filter(function (field) { return field.name.indexOf('.') === -1; });

  if (!Array.isArray(ignoredFieldNames)) {
    ignoredFieldNames = [];
  }
  if (addLabelIfNoFieldsExists == null) {
    addLabelIfNoFieldsExists = true;
  }
  var viewFields = document.getElementById('view__fields');
  if (MDSCommon.isBlank(fields.filter(function (field) { return field.name !== 'description' && field.name.indexOf('$') != 0; }))) {
    viewFields.classList.add('view__fields--empty');
    viewFields.innerHTML = addLabelIfNoFieldsExists ? EntityForm.getNoFieldsLabel(data) : '';
  } else {
    viewFields.classList.add('view__fields--filled');
    viewFields.innerHTML = '';
    var numberOfChildren = 0;
    if (comparer) {
        fields.sort(comparer);
    }
    for (var i in fields) {
      var field = fields[i];
      if (field.name.indexOf('$') !== -1 ||
        ignoredFieldNames.indexOf(field.name) >= 0 ||
        MDSCommon.isBlank(data.path) && UIConstants.ROOT_FIELDS.indexOf(field.name) >= 0 && MDSCommon.isBlank(field.value)) {
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
    viewFields.innerHTML = addLabelIfNoFieldsExists ? EntityForm.getNoFieldsLabel(data) : '';
  }
  return viewFields;
};

EntityForm.prototype.startAddingField = function() {
  this.startEditing();
  $$('add_field_window').show();
};

EntityForm.prototype.startEditing = function () {
  var self = this;
  //var url = UIHelper.getWizardUrlById(self.getCurrentId());
  //$.ajax({
  //  url: url,
  //  type: 'HEAD'
  //}).then(function() {
  //  $('#wizard_modal__frame').attr('src', url);
  //  $('#wizard_modal').modal('show');
  //}).catch(function() {
  self.setEditing(true);
  self.refresh();
  //});
};

EntityForm.prototype.setRootView = function(data) {
  var self = this;
  var language = (getCurrentLanguage() || 'en').toLowerCase();
  var languagePrefix = language === 'en' ? '' : '/' + language;

  if (self.viewWebsiteLinkDisabledTimeout) {
    clearTimeout(self.viewWebsiteLinkDisabledTimeout);
    delete self.viewWebsiteLinkDisabledTimeout;
  }

  $.ajax({ url: languagePrefix + '/fragments/root-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    var description = MDSCommon.findValueByName(data.fields, 'description');
    var readme = MDSCommon.findValueByName(data.fields, 'readme');
    var tags = (MDSCommon.findValueByName(data.fields, 'tags') || '').split(' ').filter(function(tag) {
      return tag != null && tag !== '';
    }).map(function(tag) {
      return '<a class="view__tag" href="search?q=%23' + tag + '" target="_blank">' + tag + '</a>';
    }).join(' ');

    view.innerHTML = html;


    // document.getElementById('view_overview').addEventListener('contextmenu', function(e) {
    //   var pos = $(this).offset();
    //   $$('entity_form_menu').show(this, { x: e.pageX - pos.left, y: pos.top - e.pageY });
    //   e.preventDefault();
    // }, false);


    var ava = MDSCommon.findValueByName(data.fields, 'avatar');
    if (MDSCommon.isPresent(ava)) {
      ava = Mydataspace.options.cdnURL + '/avatars/sm/' + ava + '.png';
    }
    document.getElementById('view__overview_image').src = ava || '/images/icons/root.svg';
    var viewTitle = document.getElementById('view__title');
    viewTitle.innerText = MDSCommon.findValueByName(data.fields, 'name') || MDSCommon.getEntityName(data.root);
    viewTitle.innerHTML += '<i style="margin-left: 5px;" class="fa fa-caret-down"></i>';
    viewTitle.addEventListener('click', function () { $$('entity_form_menu').show(this) });

    UIHelper.setInnerContentOrRemove('view__tags', tags, 'html');

    if (data.children.filter(function (child) { return child.path === 'website' }).length > 0) {
      var websiteLink = document.getElementById('view__website_link');
      websiteLink.href = 'https://' + data.root + SITE_SUPER_DOMAIN;
      websiteLink.classList.remove('hidden');
      websiteLink.setAttribute('data-root', data.root);
      var rootTime = new Date().getTime() - new Date(data.createdAt).getTime();


      if (rootTime < 60000) {
        websiteLink.setAttribute('disabled', 'disabled');

        document.getElementById('view__website_link__icon').classList.remove('fa-globe');
        document.getElementById('view__website_link__icon').classList.add('fa-cog');
        document.getElementById('view__website_link__icon').classList.add('fa-spin');

        $(websiteLink).tooltip({
          placement: 'bottom',
          title: STRINGS.site_dns_in_progress,
          container: 'body',
          trigger: 'hover'
        });

        self.viewWebsiteLinkDisabledTimeout = setTimeout(function () {
          var websiteLink2 = document.getElementById('view__website_link');
          if (websiteLink2 && websiteLink2.getAttribute('data-root') === data.root) {
            websiteLink.removeAttribute('disabled');

            document.getElementById('view__website_link__icon').classList.add('fa-globe');
            document.getElementById('view__website_link__icon').classList.remove('fa-cog');
            document.getElementById('view__website_link__icon').classList.remove('fa-spin');
          }
          $(websiteLink).tooltip('destroy');
        }, 60000 - rootTime);
      }
    }

    if (MDSCommon.isBlank(description) && MDSCommon.isBlank(tags)) {
      document.getElementById('view__description').innerHTML = '<i>' + STRINGS.NO_README + '</i>';
    } else {
      document.getElementById('view__description').innerText = description;
      UIHelper.setInnerContentOrRemove('view__description', description);
    }

    // TODO: Uncomment for skeletons
    // document.getElementById('view__counters_likes_count').innerText =
    //   MDSCommon.findValueByName(data.fields, '$likes');
    // document.getElementById('view__counters_comments_count').innerText =
    //   MDSCommon.findValueByName(data.fields, '$comments');

    UIHelper.setInnerContentOrRemove('view__readme', md.render(readme || ''), 'html');

    var viewFields = self.setViewFields(data,
                                        UIConstants.INVISIBLE_ROOT_FIELDS,
                                        false);

    if (viewFields.childNodes.length === 0) {
      viewFields.parentNode.removeChild(viewFields);
    }

    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(this).data('value');
      if (value != null) {
        UI.entityForm.setScriptEditValue(value);

        if (!$$('edit_script_window').isVisible()) {
          UI.entityForm.showScriptEditWindow();
        }
      } else {
        UI.entityForm.hideScriptEditWindow();
      }
      $(this).addClass('view__field--active');
    });
  });
};

EntityForm.prototype.setScriptEditValue = function (value) {
  $$('edit_script_window__editor').setValue(value);
};

EntityForm.prototype.setTaskView = function(data) {
  var language = (getCurrentLanguage() || 'en').toLowerCase();
  var languagePrefix = language === 'en' ? '' : '/' + language;

  $.ajax({ url: languagePrefix + '/fragments/task-view.html', method: 'get' }).then(function(html) {
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
    var viewFields =
        this.setViewFields(data,
                           ['status', 'statusText', 'interval', 'description'],
                           description == null,
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
        UI.entityForm.setScriptEditValue(value);
        if (!$$('edit_script_window').isVisible()) {
          UI.entityForm.showScriptEditWindow();
        }
      } else {
        UI.entityForm.hideScriptEditWindow();
      }
      $(this).addClass('view__field--active');
    });
  }.bind(this));
};

EntityForm.prototype.setEntityView = function(data) {
  var self = this;

  if (self.currentId == null) {
      return;
  }

  var entityType = UIHelper.getEntityTypeByPath(Identity.dataFromId(self.currentId).path);
  var language = (getCurrentLanguage() || 'en').toLowerCase();
  var languagePrefix = language === 'en' ? '' : '/' + language;

  $.ajax({ url: languagePrefix + '/fragments/entity-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    if (entityType === 'resource') {
      var resourceType = MDSCommon.findValueByName(data.fields, 'type');
      var resourceName = MDSCommon.getPathName(data.path);
      switch (resourceType) {
        case 'avatar':
          document.getElementById('view__overview_icon').parentNode.innerHTML =
            '<img src="' + Mydataspace.options.cdnURL + '/avatars/sm/' + resourceName + '.png" class="view__overview_image" />';
          break;
        case 'image':
          document.getElementById('view__overview_icon').parentNode.innerHTML =
            '<img src="' + Mydataspace.options.cdnURL + '/images/sm/' + resourceName + '.jpg" class="view__overview_image" />';
          break;
        default:
          document.getElementById('view__overview_icon').className =
            'view__overview_icon fa fa-' + UIHelper.getIconByPath(data.path, true, false);
      }
    } else {
      document.getElementById('view__overview_icon').className =
        'view__overview_icon fa fa-' +
        UIHelper.getIconByPath(data.path,
                               data.numberOfChildren === 0,
                               false);
    }
    document.getElementById('view__title').innerText = MDSCommon.getPathName(data.path);

    var viewFields;
    if (entityType === 'proto') {
      $('#view__description').remove();
      viewFields = self.setViewFields(data);
    } else {
      var description = data.fields.filter(function(x) { return x.name === 'description'; })[0];
      if (description != null) {
        $('#view__description').text(description.value);
      } else {
        $('#view__description').remove();
      }
      viewFields = self.setViewFields(data, ['description'], description == null);
    }

    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(self).data('value');
      if (value != null) {
        UI.entityForm.setScriptEditValue(value);
        if (!$$('edit_script_window').isVisible()) {
          UI.entityForm.showScriptEditWindow();
        }
      } else {
        UI.entityForm.hideScriptEditWindow();
      }
      $(self).addClass('view__field--active');
    });

    if (UIConstants.SYSTEM_PATHS.indexOf(data.path) >= 0) {
      document.getElementById('view_overview_delete_action').style.display = 'none';
      document.getElementById('view_overview_clone_action').style.display = 'none';
    }
  });
};

EntityForm.prototype.setLogView = function(data) {
  var language = (getCurrentLanguage() || 'en').toLowerCase();
  var languagePrefix = language === 'en' ? '' : '/' + language;

  $.ajax({ url: languagePrefix + '/fragments/log-view.html', method: 'get' }).then(function(html) {
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
        UI.entityForm.setScriptEditValue(value);
        if (!$$('edit_script_window').isVisible()) {
          UI.entityForm.showScriptEditWindow();
        }
      } else {
        UI.entityForm.hideScriptEditWindow();
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

EntityForm.prototype.setNoFieldLabelVisible = function(visible) {
  var label = $$('NO_FIELDS_LABEL');
  if (!label) {
    return;
  }
  if (visible) {
    label.show();
  } else {
    label.hide();
  }
};

EntityForm.prototype.setData = function(data) {
  var formData = {
    name: Identity.nameFromData(data),
    othersCan: data.othersCan,
    description: data.description,
    maxNumberOfChildren: data.maxNumberOfChildren,
    isFixed: data.isFixed,
    childPrototype: Identity.idFromChildProtoData(data.childPrototype)
  };
  this.clear();
  $$('entity_form').setValues(formData);

  var fields = data.fields.filter(function (field) { return field.name.indexOf('.') === -1; });

  if (MDSCommon.isBlank(data.path)) { // root entity
    // add fields from ROOT_FIELDS if not exists in data.fields
    for (var i in UIConstants.ROOT_FIELDS) {
      var field = UIConstants.ROOT_FIELDS[i];
      if (!MDSCommon.findByName(data.fields, field)) {
        fields.push({ name: field, value: '', type: UIConstants.ROOT_FIELDS_TYPES[field] });
      }
    }

    this.addRootFields({ fields: fields, type: data.type });
  } else {
    this.setNoFieldLabelVisible(true);
    this.addFields(fields, false, UIHelper.getEntityTypeByPath(data.path));
  }
  this.setClean();
  $$('entity_view').hide();
  $$('entity_form').show();
};

EntityForm.prototype.refresh = function() {
  var self = this;

  if (this.currentId == null) {
      return;
  }

  var entityType = UIHelper.getEntityTypeByPath(Identity.dataFromId(self.currentId).path);
  var isWithMeta = self.isEditing();
  $$('entity_form').disable();
  var req = !isWithMeta ? 'entities.get' : 'entities.getWithMeta';
  Mydataspace.request(req, MDSCommon.extend(Identity.dataFromId(self.currentId), { children: true }), function(data) {
    if (!isWithMeta || entityType === 'resource') {
      self.setView(data);
    } else {
      self.setData(data);
      if (self.isProto()) {
        $('.entity_form__first_input').addClass('entity_form__first_input--proto');
        $$('PROTO_IS_FIXED_LABEL').show();
      } else {
        $('.entity_form__first_input').removeClass('entity_form__first_input--proto');
        $$('PROTO_IS_FIXED_LABEL').hide();
      }
      $$('entity_form').enable();
    }
    self.emitLoaded(data);
    if ($$('edit_script_window').isVisible() && self.editScriptFieldId != null) {
      var editedField = $$(self.editScriptFieldId);
      if (editedField != null) {
        UI.entityForm.setScriptEditValue(editedField.getValue());
        $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
      } else {
        self.editScriptFieldId = null;
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
//  var newEntityId = Identity.childId(this.currentId, formData.name);
//  var data = Identity.dataFromId(newEntityId);
//  data.fields = [];
//  data.type = formData.type;
//  Mydataspace.emit('entities.create', data);
//};

EntityForm.prototype.export = function () {
  Mydataspace.request('entities.export', Identity.dataFromId(this.currentId));
};

EntityForm.prototype.clone = function(entityId) {
  $$('clone_entity_window').showWithData({ entityId: entityId });
};

EntityForm.prototype.askDelete = function(entityId) {
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
};

EntityForm.prototype.delete = function(entityId) {
  if (entityId == null) {
    entityId = this.currentId;
  }
  if (this.currentId == null) {
    return;
  }

  $$('entity_form').disable();
  UI.deleteEntity(entityId);
  Mydataspace.request('entities.delete', Identity.dataFromId(entityId), function(data) {
    // do nothing because selected item already deleted.
    // this.selectedId = null;
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
	var self = this;

  if (self.currentId == null) {
      return;
  }

  var dirtyData = webix.CodeParser.expandNames($$('entity_form').getDirtyValues());
  var existingData =
    webix.CodeParser.expandNames(
      Object.keys($$('entity_form').elements).reduce(function(ret, current) {
        ret[current] = '';
        return ret;
      }, {}));
  var oldData = webix.CodeParser.expandNames($$('entity_form')._values);
  MDSCommon.extendOf(dirtyData, Identity.dataFromId(self.currentId));

  dirtyData.fields =
    Fields.expandFields(
      Fields.getFieldsForSave(Fields.expandFields(dirtyData.fields), // dirty fields
                                Object.keys(Fields.expandFields(existingData.fields) || {}), // current exists field names
                                Fields.expandFields(oldData.fields))); // old fields
  $$('entity_form').disable();
  if (typeof dirtyData.childPrototype !== 'undefined') {
    dirtyData.childPrototype = Identity.dataFromChildProtoId(dirtyData.childPrototype);
  }
  Mydataspace.request('entities.change', dirtyData, function(res) {
    if (dirtyData.name != null) {
    	if (Identity.isRootId(self.currentId)) {
				self.selectedId = Identity.idFromData(MDSCommon.extend(res, { root: dirtyData.name }));
			} else {
				self.selectedId = Identity.idFromData(MDSCommon.extend(res, {
					path: MDSCommon.getChildPath(MDSCommon.getParentPath(res.path), dirtyData.name)
				}));
			}
    }
		self.refresh();
    $$('entity_form').enable();
  }, function(err) {
    UI.error(err);
    $$('entity_form').enable();
  });
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

EntityForm.prototype.addFields = function(fields, setDirty, type) {

  for (var i in fields) {
    var field = fields[i];
    if (field.name.indexOf('$') === 0 || field.name.indexOf('.') >= 0) {
      continue;
    }

    switch (type) {
      case 'task':
        switch (field.name) {
          case 'status':
          case 'statusText':
            break;
          case 'interval':
            this.addTaskIntervalField(field, setDirty);
            break;
          default:
            this.addField(field, setDirty, type === 'proto');
            break;
        }
        break;
      default:
        this.addField(field, setDirty, type === 'proto');
        break;
    }
  }
};

EntityForm.prototype.addRootFields = function(options) {
  var fields = options.fields;
  var setDirty = options.setDirty;
  fields.sort (function(x, y) {
    var xIndex = UIConstants.ROOT_FIELDS.indexOf(x.name);
    var yIndex = UIConstants.ROOT_FIELDS.indexOf(y.name);
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
    var field = fields[i];
    if (field.name.indexOf('$') === 0) {
      continue;
    }

    if (UIConstants.OBSOLETE_ROOT_FIELDS.indexOf(field.name) >= 0) {
      continue;
    }

    // if (options.type === 'd' && UIConstants.HIDDEN_WEBSITE_FIELDS.indexOf(field.name) >= 0) {
    //   continue;
    // }

    if (UIConstants.ROOT_FIELDS.indexOf(field.name) >= 0) {
      this.addRootField(field, setDirty);
    } else {
      this.addField(field, setDirty, false);
    }
  }
};

EntityForm.prototype.onUploadAvatar = function(event) {
  UI.uploadResource(
    event.target.files[0],
    Identity.dataFromId(this.currentId).root,
    'avatar',
    function(res) {
      var entityName = res.resources[0];
      $$('entity_form__root_avatar_value').setValue(entityName);

      setTimeout(function () {
        $('#entity_form__root_img').prop('src', Mydataspace.options.cdnURL + '/avatars/sm/' + entityName + '.png');
      }, 1000);
    },
    function(err) {
      console.log(err);
    }
  );
};

EntityForm.prototype.addTaskIntervalField = function(data) {
  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  this.setNoFieldLabelVisible(false);
  $$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.intervals), UIHelper.NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM);
};

EntityForm.prototype.addRootField = function(data) {
  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  this.setNoFieldLabelVisible(false);
  switch (data.name) {
		case 'avatar':
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
						height: 38
					},
					{
						borderless: true,
						css: 'entity_form__root_img_template',
						template: '<img id="entity_form__root_img" class="entity_form__root_img" src="' +
						(MDSCommon.isPresent(data.value) ? Mydataspace.options.cdnURL + '/avatars/sm/' + data.value + '.png' : '/images/icons/root.svg') +
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
						' <span>' + STRINGS.ROOT_AVATAR_UPLOAD + '</span>' +
						'</label>'
					},
					{ width: 6 },
					{
						view: 'button',
						label: STRINGS.ROOT_AVATAR_REMOVE,
						id: 'ROOT_AVATAR_REMOVE_LABEL',
						click: function() {
							$$('entity_form__root_avatar_value').setValue('');
							document.getElementById('entity_form__root_img').setAttribute('src', '/images/icons/root.svg');
						}
					}
				]
			});
			break;
    case 'datasource':
      var datasourceInitialOptions = {};
      if (MDSCommon.isPresent(data.value)) {
        datasourceInitialOptions[data.value] = data.value;
      }
      $$('entity_form').addView(UIControls.getRootFieldView('select', data, datasourceInitialOptions));
      UIHelper.loadDatasourcesToCombo('entity_form__' + data.name + '_value');
      break;
    case 'license':
      $$('entity_form').addView(UIControls.getRootFieldView('list', data, STRINGS.licenses));
      break;
		case 'category':
			$$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.categories));
			break;
		case 'language':
			$$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.languages));
			break;
		case 'country':
			$$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.countries));
			break;
    case 'readme':
    case 'licenseText':
      $$('entity_form').addView(UIControls.getRootFieldView('textarea', data));
      break;
		default:
			$$('entity_form').addView(UIControls.getRootFieldView('text', data));
			break;
	}
};

/**
 * Add new field to form.
 * @param {object} data       Data of field
 * @param {boolean} setDirty  Mark form as modified after field added.
 * @param {boolean} isProto   Is field of prototype-entity.
 */
EntityForm.prototype.addField = function(data, setDirty, isProto) {
  var self = this;

  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  this.setNoFieldLabelVisible(false);
  if (typeof setDirty === 'undefined') {
    setDirty = false;
  }
  if (setDirty) {
    var values = webix.copy($$('entity_form')._values);
  }

  $$('entity_form').addView({
    id: 'entity_form__' + data.name,
    css: 'entity_form__field entity_form__field--text',
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
        value: data.indexed,
        id: 'entity_form__' + data.name + '_indexed',
        name: 'fields.' + data.name + '.indexed',
        hidden: true
      },
      { view: data.type === 'j' ? 'textarea' : 'text',
        type: data.type === '*' ? 'password': 'text',
        label: '<div style="visibility: hidden">fake</div>' +
               '<div class="entity_form__field_label">' +
                data.name +
               '</div>' +
               '<div class="entity_form__field_label_ellipse_right"></div>' +
               '<div class="entity_form__field_label_ellipse"></div>',
        labelWidth: UIHelper.LABEL_WIDTH,
        name: 'fields.' + data.name + '.value',
        id: 'entity_form__' + data.name + '_value',
        value: data.type === 'j' ? UIHelper.escapeHTML(data.value) : data.value,
        height: 32,
        css: 'entity_form__text_label',
        readonly: data.type === 'j',
        on: {
          onBlur: function() {
            // if (self.editScriptFieldId == 'entity_form__' + data.name + '_value') {
            //   self.editScriptFieldId = null;
            // }
          },

          onFocus: function() {
            if (data.type === 'j') {
              self.editScriptFieldId = 'entity_form__' + data.name + '_value';
              UI.entityForm.setScriptEditValue($$(UI.entityForm.editScriptFieldId).getValue());
              $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
              if (!$$('edit_script_window').isVisible()) {
                UI.entityForm.showScriptEditWindow();
              }
            } else {
              UI.entityForm.hideScriptEditWindow();
            }
          }
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
            self.currentFieldName = data.name;
            $$('entity_form__field_type_popup_list').unselectAll();
          }
        }
      },
      { view: 'button',
        type: 'icon',
        css: 'entity_form__field_delete',
        icon: 'remove',
        width: 10,
        click: function() {
          self.deleteField(data.name);
        }
      },
      { view: 'button',
        width: 10,
        type: 'iconButton',
        icon: !isProto ? null : Fields.FIELD_INDEXED_ICONS[(data.indexed || 'off').toString()],
        css: 'entity_form__field_indexed_button',
        popup: 'entity_form__field_indexed_popup',
        disabled: !isProto,
        id: 'entity_form__' + data.name + '_indexed_button',
        on: {
          onItemClick: function() {
            self.currentFieldName = data.name;
            $$('entity_form__field_indexed_list').unselectAll();
          }
        }
      }
    ]
  });
  if (setDirty) {
    $$('entity_form')._values = values;
    self.updateToolbar();
  }
};

EntityForm.prototype.deleteField = function(name) {
  var values = webix.copy($$('entity_form')._values);
  $$('entity_form').removeView('entity_form__' + name);
  $$('entity_form')._values = values;
  this.setDirty();
  var rows = $$('entity_form').getChildViews();
  if (rows.length === UIHelper.NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM) {
    this.setNoFieldLabelVisible(true);
  }
};

EntityForm.prototype.selectEditScriptTab = function (id, hideOthers) {
  Object.keys(UILayout.editScriptTabs).forEach(function (id2) {
    var tab = $$('edit_script_window__toolbar_' + id2 + '_button');
    var classList = tab.getNode().classList;
    if (id == id2) {
      classList.add('webix_el_button--active');
      tab.show();
    } else {
      classList.remove('webix_el_button--active');
      if (hideOthers) {
        tab.hide();
      } else {
        tab.show();
      }
    }
  });
  var editor = $$('edit_script_window__editor').getEditor();
  var editorTab = UILayout.editScriptTabs[id] || UILayout.editScriptTabs['text'];
  editor.getSession().setMode('ace/mode/' + editorTab.aceMode);
  editor.getValue();
};

EntityForm.prototype.showScriptEditWindow = function () {
  var ext = UI.entityForm.editScriptFieldId && $$(UI.entityForm.editScriptFieldId) && UI.entityForm.editScriptFieldId.match(/\.([\w]+)_value$/);
  if (ext) {
    this.selectEditScriptTab(ext[1], true);
  }
  $$('edit_script_window').show();
  if (webix.without_header) {
    $('.edit_script_window').css('top', '137px');
  } else {
    $('.edit_script_window').css('top', '50px');
  }
};

EntityForm.prototype.hideScriptEditWindow = function() {
  $$('edit_script_window').hide();
};
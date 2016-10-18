function EntityForm() {

}

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
  this.refresh();
};

EntityForm.prototype.setViewFields = function(fields, ignoredFieldNames, addLabelIfNoFieldsExists) {
  if (!Array.isArray(ignoredFieldNames)) {
    ignoredFieldNames = [];
  }
  if (addLabelIfNoFieldsExists == null) {
    addLabelIfNoFieldsExists = true;
  }
  var viewFields = document.getElementById('view__fields');
  if (common.isBlank(fields)) {
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
      $(viewFields).append('<div class="view__field">\n' +
                           '  <div class="view__field_name">\n' +
                           '    <div class="view__field_name_box">\n' +
                                  field.name +
                           '    </div>\n' +
                           '  </div>\n' +
                           '  <div class="view__field_value">\n' +
                           '    <div class="view__field_value_box">\n' +
                                  (common.isPresent(field.value) ? common.textToHtml(field.value) : '&mdash;') +
                           '    </div>\n' +
                           '  </div>\n' +
                           '</div>');
    }
  }
  if (numberOfChildren === 0) {
    viewFields.innerHTML =
      addLabelIfNoFieldsExists ?
      '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>' :
      '';
  }
};

EntityForm.prototype.setRootView = function(data) {
  $.ajax({ url: '/fragments/root-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    document.getElementById('view__overview_image').src =
      common.findValueByName(data.fields, 'avatar') || '/images/app.png';

    document.getElementById('view__title').innerText =
      common.findValueByName(data.fields, 'name') || common.getChildName(data.root);

    document.getElementById('view__tags').innerText =
      common.findValueByName(data.fields, 'tags') || '';

    var websiteURL = common.findValueByName(data.fields, 'websiteURL');
    if (common.isBlank(websiteURL)) {
      document.getElementById('view__websiteURL').style.display = 'none';
    } else {
      document.getElementById('view__websiteURL').style.display = 'block';
      document.getElementById('view__websiteURL').innerText = websiteURL;
      document.getElementById('view__websiteURL').href = websiteURL;
    }

    document.getElementById('view__description').innerText =
      common.findValueByName(data.fields, 'description') || '';

    var readme = common.findValueByName(data.fields, 'readme');
    if (common.isBlank(readme)) {
      document.getElementById('view__content').style.display = 'none';
    } else {
      document.getElementById('view__content').style.display = 'block';
    }
    document.getElementById('view__readme').innerHTML = md.render(readme);
    this.setViewFields(data.fields,
                       ['name',
                        'avatar',
                        'description',
                        'websiteURL',
                        'readme',
                        'tags'],
                       false);
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
      common.getChildName(data.path);
    this.setViewFields(data.fields);
  }.bind(this));
};

EntityForm.prototype.setView = function(data) {
  $('#view').append('<div class="view__loading"></div>');
  if (common.isBlank(data.path)) {
    this.setRootView(data);
  } else if (data.path.startsWith('tasks/')) {
    this.setTaskView(data);
  } else {
    this.setEntityView(data);
  }
  $$('entity_form').hide();
  $$('entity_view').show();
};

EntityForm.prototype.setData = function(data) {
  var formData = {
    name: UIHelper.nameFromData(data),
    othersCan: data.othersCan,
    description: data.description,
    maxNumberOfChildren: data.maxNumberOfChildren,
    isFixed: data.isFixed,
    childPrototype: UIHelper.idFromData(data.childPrototype)
  };
  this.clear();
  $$('entity_form').setValues(formData);
  this.addFields(data.fields);
  this.setClean();
  $$('entity_view').hide();
  $$('entity_form').show();
};

EntityForm.prototype.refresh = function(isWithMeta) {
  $$('entity_form').disable();
  var req = !isWithMeta ? 'entities.get' : 'entities.getWithMeta';
  Mydataspace.request(req, UIHelper.dataFromId(this.selectedId), function(data) {
    if (!isWithMeta) { // UI.isViewOnly()) {
      this.setView(data);
    } else {
      this.setData(data);
      if (this.isProto()) {
        $$('PROTO_IS_FIXED_LABEL').show();
      } else {
        $$('PROTO_IS_FIXED_LABEL').hide();
      }
      $$('entity_form').enable();
    }
  }.bind(this), function(err) {
    UI.error(err);
    $$('entity_form').enable();
  });
};

/**
 * Creates new entity by data received from the 'New Entity' form.
 * @param formData data received from form by method getValues.
 */
//EntityForm.prototype.createByFormData = function(formData) {
//  var newEntityId = UIHelper.childId(this.selectedId, formData.name);
//  var data = UIHelper.dataFromId(newEntityId);
//  data.fields = [];
//  data.type = formData.type;
//  Mydataspace.emit('entities.create', data);
//};

EntityForm.prototype.delete = function() {
  $$('entity_form').disable();
  Mydataspace.request('entities.delete', UIHelper.dataFromId(this.selectedId), function(data) {
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
  common.extendOf(dirtyData, UIHelper.dataFromId(this.selectedId));
  dirtyData.fields = UIHelper.getFieldsForSave(dirtyData.fields, Object.keys(existingData.fields || {}), oldData.fields);
  $$('entity_form').disable();
  if (typeof dirtyData.childPrototype !== 'undefined') {
    dirtyData.childPrototype = UIHelper.dataFromId(dirtyData.childPrototype);
  }
  Mydataspace.request('entities.change', dirtyData, function(res) {
    this.refresh();
    $$('entity_form').enable();
  }.bind(this), function(err) {
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
  $$('NO_FIELDS_LABEL').show();
  $$('RUN_SCRIPT_LABEL').hide();
};

EntityForm.prototype.addFields = function(fields, setDirty) {
  for (var i in fields) {
    this.addField(fields[i], setDirty);
  }
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
  if ((data.type === 'j' || data.type === 'u') && !$$('RUN_SCRIPT_LABEL').isVisible()) {
    // $$('RUN_SCRIPT_LABEL').show();
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
        readonly: UI.isViewOnly(),
        on: {
          onFocus: function() {
            if (data.type === 'j') {
              this.editScriptFieldId = 'entity_form__' + data.name + '_value';
              $$('edit_script_window__editor').setValue($$(UI.entityForm.editScriptFieldId).getValue());
              if (!$$('edit_script_window').isVisible()) {
                $$('edit_script_window').show();
              }
            }
          }.bind(this)
        }
      },
      { view: 'button',
        width: 30,
        type: 'iconButton',
        icon: UIHelper.FIELD_TYPE_ICONS[data.type],
        css: 'entity_form__field_type_button',
        popup: 'entity_form__field_type_popup',
        options: UIHelper.getFieldTypesAsArrayOfIdValue(),
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
        icon: 'trash-o',
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

  let hasScripts = false;
  let fields = $$('entity_form').getValues().fields;
  for (let fieldName in fields) {
    let field = fields[fieldName];
    if (field.type === 'j' || field.type === 'u') {
      hasScripts = true;
      break;
    }
  }
  if (!hasScripts) {
    $$('RUN_SCRIPT_LABEL').hide();
  }
};

EntityForm.prototype.setMode = function(mode) {
  switch (mode) {
    case 'edit':
      $$('EDIT_ENTITY_LABEL').hide();
      $$('SAVE_ENTITY_LABEL').show();
      $$('CANCEL_ENTITY_LABEL').show();
      $$('REFRESH_ENTITY_LABEL').hide();
      $$('ADD_FIELD_LABEL').show();
      // $$('RUN_SCRIPT_LABEL').hide();
      break;
    case 'view':
      $$('EDIT_ENTITY_LABEL').show();
      $$('SAVE_ENTITY_LABEL').hide();
      $$('CANCEL_ENTITY_LABEL').hide();
      $$('REFRESH_ENTITY_LABEL').show();
      $$('ADD_FIELD_LABEL').hide();
      // $$('RUN_SCRIPT_LABEL').show();
      break;
  }
}

function EntityForm() {

}

EntityForm.prototype.listen = function() {
  Mydataspace.on('entities.delete.res', function() {
    $$('entity_form').disable();
  });
};

EntityForm.prototype.setSelectedId = function(id) {
  if (this.selectedId === id) {
    return;
  }
  this.selectedId = id;
  this.refresh();
};

EntityForm.prototype.setData = function(data) {
  var formData = {
    name: UIHelper.nameFromData(data),
    othersCan: data.othersCan,
    description: data.description,
    childPrototype: UI.isViewOnly() ? null : UIHelper.idFromData(data.childPrototype)
  };
  this.clear();
  $$('entity_form').setValues(formData);
  this.addFields(data.fields);
  this.setClean();
};

EntityForm.prototype.refresh = function() {
  $$('entity_form').disable();
  var req = UI.isViewOnly() ? 'entities.get' : 'entities.getWithMeta';
  Mydataspace.request(req, UIHelper.dataFromId(this.selectedId), function(data) {
    this.setData(data);
    $$('entity_form').enable();
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
  if (!$$('entity_form').isDirty()) {
    $$('entity_form__save_button').disable();
  } else {
    $$('entity_form__save_button').enable();
  }
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
  $$('entity_form__run_script_button').hide();
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
  if ((data.type === 'j' || data.type === 'u') && !$$('entity_form__run_script_button').isVisible()) {
    $$('entity_form__run_script_button').show();
  }
  $$('entity_form').addView({
    id: 'entity_form__' + data.name,
    cols: [
      { view: 'text',
        value: data.name,
        name: 'fields.' + data.name + '.name',
        hidden: true
      },
      { view: data.type === 'j' ? 'textarea' : 'text',
        label: data.name,
        name: 'fields.' + data.name + '.value',
        id: 'entity_form__' + data.name + '_value',
        value: data.value,
        labelWidth: UIHelper.LABEL_WIDTH,
        height: 32,
        css: 'entity_form__text_label',
        readonly: UI.isViewOnly(),
        on: {
          onFocus: function() {
            if (data.type === 'j') {
              this.editScriptFieldId = 'entity_form__' + data.name + '_value';
              $$('edit_script_window__title').setValue(data.name);
              $$('edit_script_window').show();
            }
          }.bind(this)
        }
      },
      { view: 'richselect',
        width: 30,
        popupWidth: 400,
        hidden: UI.isViewOnly(),
        options: UIHelper.getFieldTypesAsArrayOfIdValue(),
        value: data.type,
        id: 'entity_form__' + data.name + '_type',
        name: 'fields.' + data.name + '.type',
        on: {
          onChange: function(newv, oldv) {
            if (newv === 'j' || oldv === 'j') {
              var oldValues = webix.copy($$('entity_form')._values);
              webix.ui(
                { view: newv === 'j' ? 'textarea' : 'text',
                  label: data.name,
                  name: 'fields.' + data.name + '.value',
                  id: 'entity_form__' + data.name + '_value',
                  value: data.value,
                  labelWidth: UIHelper.LABEL_WIDTH,
                  height: 32,
                  css: 'entity_form__text_label',
                  on: {
                    onFocus: function() {
                      if (newv === 'j') {
                        this.editScriptFieldId = 'entity_form__' + data.name + '_value';
                        $$('edit_script_window').show();
                      }
                    }
                  }
                },
                $$('entity_form__' + data.name),
                $$('entity_form__' + data.name + '_value')
              );
              $$('entity_form')._values = oldValues;
            }
          }
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'remove',
        width: 25,
        hidden: UI.isViewOnly(),
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
    $$('entity_form__run_script_button').hide();
  }
};

UILayout.popups.fieldType = {
  view: 'popup',
  id: 'entity_form__field_type_popup',
  css: 'entity_form__field_type_popup',
  width: 130,
  body:{
    view: 'list',
    id: 'entity_form__field_type_popup_list',
    class: 'entity_form__field_type_popup_list',
    borderless: true,
    data:[
          { id: 's', value: 'String', icon: 'commenting' },
          { id: 'j', value: 'Text', icon: 'align-justify' },
          { id: 'i', value: 'Integer', icon: 'italic' },
          { id: 'r', value: 'Float', icon: 'calculator'  },
          { id: 'u', value: 'URL', icon: 'link' },
          { id: 'w', value: 'Secret', icon: 'lock' }

          // { id: 'b', value: 'Boolean', icon: 'check-square-o' },
          // { id: 'd', value: 'Date', icon: 'calendar-o' },
          // { id: 'm', value: 'Money', icon: 'dollar' },
          // { id: 'e', value: 'Email', icon: 'envelope' },
          // { id: 'p', value: 'Phone', icon: 'phone' },

          // { id: 'c', value: 'Custom', icon: 'pencil' },
          // { value: 'More...', icon: '' },
    ],
    datatype: 'json',
    template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
    autoheight: true,
    select: true,
        on: {
          onItemClick: function(newv) {
            var fieldName = UI.entityForm.currentFieldName;
            var fieldId = 'entity_form__' + fieldName;
            var fieldValue = $$(fieldId + '_value').getValue();
            $$(fieldId + '_type_button').define('icon', Fields.FIELD_TYPE_ICONS[newv]);
            $$(fieldId + '_type_button').refresh();
            var oldv = $$(fieldId + '_type').getValue();
            $$(fieldId + '_type').setValue(newv);
            $$('entity_form__field_type_popup').hide();
            var oldValues = webix.copy($$('entity_form')._values);
            delete oldValues['fields.' + UI.entityForm.currentFieldName + '.value'];
            if (newv === 'j' || oldv === 'j') {
              webix.ui(
                { view: newv === 'j' ? 'textarea' : 'text',
                  label: fieldName,
                  name: 'fields.' + fieldName + '.value',
                  id: 'entity_form__' + fieldName + '_value',
                  value: fieldValue,
                  labelWidth: UIHelper.LABEL_WIDTH,
                  height: 32,
                  css: 'entity_form__text_label',
                  on: {
                    onFocus: function() {
                      if (newv === 'j') {
                        this.editScriptFieldId = 'entity_form__' + fieldName + '_value';
                        $$('edit_script_window').show();
                      }
                    }
                  }
                },
                $$('entity_form__' + fieldName),
                $$('entity_form__' + fieldName + '_value')
              );
              if (newv === 'j') {
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').disable();
                var fieldIndexed = $$(fieldId + '_indexed').getValue();
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS['fulltext']);
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();
              } else {
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').enable();
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS[fieldIndexed || 'off']);
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();
              }
            }
            $$('entity_form')._values = oldValues;
          }
        }
  }
};

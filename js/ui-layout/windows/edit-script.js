UILayout.editScriptTabs = {
  text: {
    aceMode: 'text',
    icon: 'align-justify',
    label: 'Text'
  },
  md: {
    aceMode: 'markdown',
    icon: 'bookmark',
    label: 'Markdown'
  },
  json: {
    aceMode: 'json',
    icon: 'ellipsis-h',
    label: 'JSON'
  },
  xml: {
    aceMode: 'xml',
    icon: 'code',
    label: 'XML'
  }
};

UILayout.windows.editScript = {
  view: 'ModalDialog',
  id: 'edit_script_window',
  position: 'center',
  modal: true,
  head: {
    cols:[
      { width: 15 },
      { view: 'label',
        id: 'edit_script_window_title',
        label: 'Edit Field'
      },
      { view: 'button',
        type: 'icon',
        icon: 'times',
        css: 'webix_el_button--right',
        id: 'CLOSE_LABEL', label: STRINGS.CLOSE,
        width: 70,
        click: function() {
          UI.entityForm.hideScriptEditWindow();
        }
      }
    ]
  },
  width: 900,
  height: 600,
  animate: { type: 'flip', subtype: 'vertical' },
  on: {
    onShow: function() {
      var editScriptFieldId = 'entity_form__' + this.getShowData().fieldName + '_value';
      var value = $$(editScriptFieldId).getValue();
      $$('edit_script_window__editor').setValue(value);
      $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
      var ext = editScriptFieldId && $$(editScriptFieldId) && editScriptFieldId.match(/\.([\w]+)_value$/);
      if (ext) {
        this.selectEditScriptTab(ext[1], true);
      }
    },

    onBlur: function() {
      var editScriptFieldId = 'entity_form__' + this.getShowData().fieldName + '_value';
      var field = $$(editScriptFieldId);
      if (field) {
        field.setValue($$('edit_script_window__editor').getValue());
      }
    },

    onHide: function() {
    }
  },

  body: {
    rows: [
      { view: 'toolbar',
        id: 'edit_script_window__toolbar',
        elements: [
          { view: 'richselect',
            width: 150,
            value: 'text',
            options: Object.keys(UILayout.editScriptTabs).map(function (id) {
              var tab = UILayout.editScriptTabs[id];
              return {
                icon: tab.icon,
                value: tab.label,
                id: tab.aceMode
              };
            })
          },
          { width: 20
          },
          { view: 'button',
            type: 'icon',
            icon: 'save',
            id: 'SAVE_ENTITY_LABEL_1',
            label: STRINGS.SAVE_ENTITY,
            autowidth: true
          },
          { view: 'button',
            type: 'icon',
            icon: 'search',
            id: 'SCRIPT_EDITOR_FIND_LABEL',
            label: STRINGS.SCRIPT_EDITOR_FIND,
            autowidth: true
          },
          { view: 'button',
            type: 'icon',
            icon: 'sort-alpha-asc',
            id: 'SCRIPT_EDITOR_REPLACE_LABEL',
            label: STRINGS.SCRIPT_EDITOR_REPLACE,
            autowidth: true
          }, {}
        ]
      },
      { view: 'ace-editor',
        id: 'edit_script_window__editor',
        mode: 'javascript',
        show_hidden: true,
        on: {
          onReady: function(editor) {
            var window = $$('edit_script_window');
            editor.getSession().setTabSize(2);
            editor.getSession().setUseSoftTabs(true);
            editor.setReadOnly(true);
            editor.getSession().setUseWorker(false);
            editor.commands.addCommand({
              name: 'save',
              bindKey: { win: 'Ctrl-S' },
              exec: function(editor) {
                var fieldId = 'entity_form__' + window.getShowData().fieldName + '_value';
                if (fieldId && $$(fieldId)) {
                  $$(fieldId).setValue(editor.getValue());
                }
                UI.entityForm.save();
              }
            });
            editor.on('change', function() {
              var fieldId = 'entity_form__' + window.getShowData().fieldName + '_value';
              if (fieldId && $$(fieldId)) {
                $$(fieldId).setValue(editor.getValue());
              }
            });
          }
        }
      }
    ]
  }
};

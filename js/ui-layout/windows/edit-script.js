UILayout.editScriptTabs = {
  text: {
    aceMode: 'text',
    icon: 'align-justify',
    width: 60,
    label: 'Text'
  },
  md: {
    aceMode: 'markdown',
    icon: 'bookmark',
    width: 110,
    label: 'Markdown'
  },
  pug: {
    aceMode: 'jade',
    icon: 'code',
    width: 60,
    label: 'Pug'
  },
  html: {
    aceMode: 'html',
    icon: 'code',
    width: 70,
    label: 'HTML'
  },
  json: {
    aceMode: 'json',
    icon: 'cog',
    width: 110,
    label: 'JSON'
  },
  js: {
    aceMode: 'javascript',
    icon: 'cog',
    width: 110,
    label: 'JavaScript'
  },
  css: {
    aceMode: 'css',
    icon: 'css3',
    width: 60,
    label: 'CSS'
  },
  scss: {
    aceMode: 'scss',
    icon: 'css3',
    width: 70,
    label: 'SCSS'
  }
};

UILayout.windows.editScript = {
  view: 'window',
  id: 'edit_script_window',
  css: 'edit_script_window',
  head: false,
  left: 0,
  top: UILayout.HEADER_HEIGHT - 2,
  animate: { type: 'flip', subtype: 'vertical' },
  on: {
    onShow: function() {
      $$('edit_script_window').$view.classList.add('animated');
      $$('edit_script_window').$view.classList.add('fadeInUp');

      $$('CLOSE_LABEL').define('hotkey', 'escape');
      var windowWidth =
        $$('admin_panel').$width -
        $$('my_data_panel__right_panel').$width -
        $$('my_data_panel__resizer_2').$width - 2;

      var windowHeight = $$('my_data_panel').$height - 2;

      $$('edit_script_window').define('width', windowWidth);
      $$('edit_script_window').define('height', windowHeight);
      $$('edit_script_window').resize();
      $$('my_data_panel__resizer_2').disable();
    },

    onBlur: function() {
      if (UI.entityForm.editScriptFieldId == null) {
        return;
      }
      var field = $$(UI.entityForm.editScriptFieldId);
      if (field) {
        field.setValue($$('edit_script_window__editor').getValue());
      }
    },

    onHide: function() {
      $$('edit_script_window').$view.classList.remove('animated');
      $$('edit_script_window').$view.classList.remove('fadeInUp');
      $$('my_data_panel__resizer_2').enable();
    }
  },

  body: {
    rows: [
      { view: 'toolbar',
        id: 'edit_script_window__toolbar',
        elements: Object.keys(UILayout.editScriptTabs).map(function (id) {
          var tab = UILayout.editScriptTabs[id];
          return {
            view: 'button',
            type: 'icon',
            icon: tab.icon,
            width: tab.width,
            label: tab.label,
            css:   'webix_el_button',
            id: 'edit_script_window__toolbar_' + id + '_button',
            click: function() {
              UI.entityForm.selectEditScriptTab(id);
            }
          };
        }).concat(
          {},
          { view: 'button',
            type: 'icon',
            icon: 'times',
            css: 'webix_el_button--right',
            id: 'CLOSE_LABEL', label: STRINGS.CLOSE,
            width: 70,
            click: function() {
              UI.entityForm.hideScriptEditWindow();
            }
          })
      },
      { view: 'ace-editor',
        id: 'edit_script_window__editor',
        mode: 'javascript',
        show_hidden: true,
        on: {
          onReady: function(editor) {
            editor.getSession().setTabSize(2);
            editor.getSession().setUseSoftTabs(true);
            editor.setReadOnly(true);
            editor.getSession().setUseWorker(false);
            editor.commands.addCommand({
              name: 'save',
              bindKey: { win: 'Ctrl-S' },
              exec: function(editor) {
                if (UI.entityForm.editScriptFieldId && $$(UI.entityForm.editScriptFieldId)) {
                  $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                }
                UI.entityForm.save();
              }
            });
            editor.on('change', function() {
              if (UI.entityForm.editScriptFieldId && $$(UI.entityForm.editScriptFieldId)) {
                $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
              }
            });
          }
        }
      }
    ]
  }
};

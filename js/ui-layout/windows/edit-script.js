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
      $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
    },

    onHide: function() {
      $$('edit_script_window').$view.classList.remove('animated');
      $$('edit_script_window').$view.classList.remove('fadeInUp');
      // $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
      $$('my_data_panel__resizer_2').enable();
    },
  },
  body: {
    rows: [
      { view: 'toolbar',
        id: 'edit_script_window__toolbar',
        elements: [
          { view: 'button',
            type: 'icon',
            icon: 'align-justify',
            width: 70,
            label: 'Text',
            id: 'edit_script_window__toolbar_text_button',
            click: function() {
              $$('edit_script_window__toolbar_text_button').getNode().classList.add('webix_el_button--active');
              $$('edit_script_window__toolbar_md_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_html_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_js_button').getNode().classList.remove('webix_el_button--active');
              const editor = $$('edit_script_window__editor').getEditor();
              editor.getSession().setMode('ace/mode/text');
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'bookmark',
            width: 110,
            label: 'Markdown',
            id: 'edit_script_window__toolbar_md_button',
            click: function() {
              $$('edit_script_window__toolbar_text_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_md_button').getNode().classList.add('webix_el_button--active');
              $$('edit_script_window__toolbar_html_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_js_button').getNode().classList.remove('webix_el_button--active');
              const editor = $$('edit_script_window__editor').getEditor();
              editor.getSession().setMode('ace/mode/markdown');
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'code',
            width: 80,
            label: 'HTML',
            id: 'edit_script_window__toolbar_html_button',
            click: function() {
              $$('edit_script_window__toolbar_text_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_md_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_html_button').getNode().classList.add('webix_el_button--active');
              $$('edit_script_window__toolbar_js_button').getNode().classList.remove('webix_el_button--active');
              const editor = $$('edit_script_window__editor').getEditor();
              editor.getSession().setMode('ace/mode/html');
              editor.getValue();
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'cog',
            width: 110,
            label: 'JavaScript',
            css:   'webix_el_button--active',
            id: 'edit_script_window__toolbar_js_button',
            click: function() {
              $$('edit_script_window__toolbar_text_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_md_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_html_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_js_button').getNode().classList.add('webix_el_button--active');
              const editor = $$('edit_script_window__editor').getEditor();
              editor.getSession().setMode('ace/mode/javascript');
              editor.getValue();
            }
          },
          {},
          { view: 'button',
            type: 'icon',
            icon: 'times',
            id: 'CLOSE_LABEL', label: STRINGS.CLOSE,
            width: 70,
            click: function() {
              $$('edit_script_window').hide();
            }
          }
        ]
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

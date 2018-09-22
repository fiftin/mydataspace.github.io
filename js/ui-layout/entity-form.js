UILayout.entityForm =
{ id: 'my_data_panel__right_panel',
  gravity: 0.3,
  on: {
    onResize: function () {
      console.log('Resize.........');
    }
  },
  rows: [
  { view: 'toolbar',
    id: 'entity_form__toolbar',
    cols: [
      { view: 'button',
        type: 'icon',
        icon: 'refresh',
        id: 'REFRESH_ENTITY_LABEL', label: STRINGS.REFRESH_ENTITY,
        width: 80,
        click: function() {
          UI.entityForm.refresh();
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'save',
        id: 'SAVE_ENTITY_LABEL',
        label: STRINGS.SAVE_ENTITY,
        css: 'menu__green_button',
        hidden: true,
        width: 75,
        click: function() {
          UI.entityForm.save();
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'plus',
        id: 'ADD_FIELD_LABEL', label: STRINGS.ADD_FIELD,
        hidden: true,
        width: 100,
        click: function() {
          $$('add_field_window').show();
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'bug',
        id: 'RUN_SCRIPT_LABEL', label: STRINGS.RUN_SCRIPT,
        hidden: true,
        width: 80,
        click: function() {
          UIHelper.popupCenter('/run-script.html', 'Run Script', 600, 400);
        }
      },
      {},
      { view: 'button',
        type: 'icon',
        icon: 'download',
        id: 'EXPORT_ENTITY_LABEL',
        label: STRINGS.EXPORT_ENTITY,
        width: 80,
        click: function() {
          UI.entityForm.export();
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'copy',
        hidden: PROJECT_NAME === 'web20',
        id: 'CLONE_ENTITY_LABEL',
        label: STRINGS.CLONE_ENTITY,
        width: 80,
        click: function() {
          UI.entityForm.clone();
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'remove',
        id: 'DELETE_ENTITY_SHORT_LABEL', label: STRINGS.DELETE_ENTITY_SHORT,
        width: 80,
        click: function() {
          webix.confirm({
            title: STRINGS.DELETE_ENTITY,
            text: STRINGS.REALLY_DELETE,
            ok: STRINGS.YES,
            cancel: STRINGS.NO,
            callback: function(result) {
              if (result) {
                UI.entityForm.delete();
              }
            }
          });
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'pencil-square-o',
        id: 'EDIT_ENTITY_LABEL',
        label: STRINGS.EDIT_ENTITY,
        width: 60,
        click: function() {
          UI.entityForm.startEditing();
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'eye',
        id: 'CANCEL_ENTITY_LABEL', label: STRINGS.CANCEL_ENTITY,
        width: 60,
        hidden: true,
        click: function() {
          UI.entityForm.setEditing(false);
          UI.entityForm.refresh();
        }
      }
    ]
  },
  {
    id: 'entity_view',
    template: '<div id="view" class="view"><div class="view__loading"></div></div>',
    scroll: true,
    css: 'entity_view'
  },
  { view: 'form',
    id: 'entity_form',
    css: 'entity_form',
    complexData: true,
    scroll: true,
    hidden: true,
    elements: [
      { view: 'text',
        id: 'NAME_LABEL_5',
        label: STRINGS.NAME,
        name: 'name',
        labelWidth: UIHelper.LABEL_WIDTH,
        css: 'entity_form__first_input'
      },
      UIControls.getEntityTypeSelectTemplate(),
      { view: 'text',
        id: 'CHILD_PROTO_LABEL',
        label: STRINGS.CHILD_PROTO,
        name: 'childPrototype',
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { view: 'text',
        id: 'MAX_NUMBER_OF_CHILDREN_LABEL',
        label: STRINGS.MAX_NUMBER_OF_CHILDREN,
        name: 'maxNumberOfChildren',
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { view: 'checkbox',
        id: 'PROTO_IS_FIXED_LABEL',
        label: STRINGS.PROTO_IS_FIXED,
        name: 'isFixed',
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { id: 'entity_form__fields_title',
        template: STRINGS.FIELDS,
        type: 'section',
        css: 'entity_form__fields_title'
      },
      { view: 'label',
        id: 'NO_FIELDS_LABEL',
        label: STRINGS.NO_FIELDS,
        align: 'center'
      }
    ],
    on: {
      onChange: function() { UI.entityForm.updateToolbar() }
    }
  }
]};

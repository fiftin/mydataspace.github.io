UILayout.popups.newEntity = {
	view: 'popup',
	id: 'entity_tree__new_entity_popup',
  css: 'entity_tree__new_entity_popup',
	width: 190,
	body: {
		view: 'list',
    id: 'entity_tree__new_entity_list',
    class: 'entity_tree__new_entity_list',
    borderless: true,
		data: [
      { id: 'new_entity', value: 'New Entity', icon: 'file-o' },
      { id: 'import_wizard', value: 'Import Entity' },
      { id: 'new_resource', value: 'New Resource', icon: 'diamond' },
      { id: 'new_task', value: 'New Task', icon: 'file-code-o' },
      { id: 'new_proto', value: 'New Prototype', icon: 'cube' },
//      { id: 'import_csv', value: 'Import Entity from CSV As Is' }
		],
		datatype: 'json',
		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        switch (newv) {
          case 'new_entity':
            $$('add_entity_window').show();
            break;
          case 'new_resource':
            $$('add_resource_window').show();
            break;
          case 'new_task':
            $$('add_entity_window').show();
            break;
          case 'new_proto':
            $$('add_entity_window').show();
            break;
          case 'import_wizard':
            openRefineImportEntity = Identity.dataFromId(UI.entityTree.getCurrentId());
            $('#import_data_modal').modal('show');
            break;
          case 'import_csv':
            break;
        }
        $$('entity_tree__new_entity_popup').hide();
      }
    }
	}
};

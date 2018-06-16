UILayout.popups.newEntity = {
	view: 'popup',
	id: 'entity_tree__new_entity_popup',
  css: 'admin_context_menu entity_tree__new_entity_popup',
	width: 200,
	body: {
		view: 'list',
    id: 'entity_tree__new_entity_list',
    class: 'entity_tree__new_entity_list',
    borderless: true,
		data: UIControls.getNewEntityPopupData(),
		datatype: 'json',
		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        switch (newv) {
          case 'add_website':
            $$('add_website_window').show();
            break;
          case 'new_entity':
            $$('add_entity_window').show();
            break;
          case 'new_resource':
            $$('add_resource_window').show();
            break;
          case 'new_task':
            $$('add_task_window').show();
            break;
          case 'new_proto':
            $$('add_proto_window').show();
            break;
          case 'import_wizard':
            // global var openRefineImportEntity
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

UILayout.popups.newRootVersion = {
	view: 'popup',
	id: 'entity_tree__new_root_version_popup',
  css: 'admin_context_menu entity_tree__new_root_version_popup',
	width: 190,
	body: {
		view: 'list',
    id: 'entity_tree__new_root_version_list',
    class: 'entity_tree__new_root_version_list',
    borderless: true,
		data: [
      { id: 'new_version', value: 'New Empty Version' },
//      { id: 'copy_version', value: 'Clone Current Version' },
      // { id: 'import_version', value: 'Import to New Version' },
//      { id: 'import_version_csv', value: 'Import New Version from CSV As Is' }
      { id: 'view_version', value: 'View Other Version...' },
      { id: 'switch_version', value: 'Switch Default Version...' },
		],
		datatype: 'json',
//		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        switch (newv) {
          case 'new_version':
            $$('add_version_window').show();
            break;
          case 'switch_version':
            //var version = parseInt(prompt("Please enter version number", "Switch Root Version"));
            $$('change_version_window').mode = 'switch';
            $$('change_version_window').show();
            break;
          case 'view_version':
            $$('change_version_window').mode = 'view';
            $$('change_version_window').show();
            break;
          case 'copy_version':
            break;
          case 'import_version':
            break;
          case 'import_version_csv':
            break;
        }
        $$('entity_tree__new_root_version_popup').hide();
      }
    }
	}
};

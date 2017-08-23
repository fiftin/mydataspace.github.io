UILayout.popups.newRootVersion = {
	view: 'popup',
	id: 'entity_tree__new_root_version_popup',
  css: 'entity_tree__new_root_version_popup',
	width: 270,
	body: {
		view: 'list',
    id: 'entity_tree__new_root_version_list',
    class: 'entity_tree__new_root_version_list',
    borderless: true,
		data: [
      { id: 'new_version', value: 'New Empty Version' },
      { id: 'copy_version', value: 'New Version as Copy of Current' },
      { id: 'import_version', value: 'Import New Version Wizard' },
      { id: 'import_version_csv', value: 'Import New Version from CSV As Is' }
		],
		datatype: 'json',
//		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        switch (newv) {
          case 'new_version':
            break;
          case 'copy_version':
            break;
          case 'import_version':
            break;
          case 'import_version_csv':
            break;
        }
      }
    }
	}
};

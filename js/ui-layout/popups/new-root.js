UILayout.popups.newRoot = {
	view: 'popup',
	id: 'entity_tree__new_root_popup',
  css: 'entity_tree__new_root_popup',
	width: 220,
	body: {
		view: 'list',
    id: 'entity_tree__new_root_list',
    class: 'entity_tree__new_root_list',
    borderless: true,
		data: [
      { id: 'new_root', value: 'New Empty Root' },
      { id: 'import_wizard', value: 'Import Root Wizard' },
      { id: 'import_csv', value: 'Import Root from CSV As Is' }
		],
		datatype: 'json',
//		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        switch (newv) {
          case 'new_root':
            break;
          case 'import_wizard':
            break;
          case 'import_csv':
            break;
        }
      }
    }
	}
};

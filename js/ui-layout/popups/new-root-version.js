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
      { id: 'switch_version', value: 'Switch Version...' },
		],
		datatype: 'json',
//		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        switch (newv) {
          case 'new_version':
            Mydataspace.entities.create({
              root: UI.entityTree.currentId,
              path: '',
              fields: [{ name: '$newVersion', value: true }]
            }).then(function(data) {
              alert('New version created');
            });
            break;
          case 'switch_version':
            var version = parseInt(prompt("Please enter version number", "Switch Root Version"));
            Mydataspace.entities.change({
              root: UI.entityTree.currentId,
              path: '',
              fields: [{ name: '$version', value: version }]
            }).then(function(data) {
              alert('Switched to version ' + version);
            });
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

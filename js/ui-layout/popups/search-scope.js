UILayout.popups.searchScope = {
  view: 'popup',
  id: 'entity_tree__root_scope_popup',
    css: 'entity_tree__root_scope_popup',
  width: 160,
  body:{
    view: 'list',
        id: 'entity_tree__root_scope_popup_list',
        class: 'entity_tree__root_scope_popup_list',
        borderless: true,
    data:[
          { id: 'user', value: 'Search in Yours', icon: 'user' },
          { id: 'globe', value: 'Search of All', icon: 'globe' },
          { id: 'database', value: 'Root', icon: 'database' }
    ],
    datatype: 'json',
    template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
    autoheight: true,
    select: true,
    on: {
      onItemClick: function(newv) {
        $$('entity_tree__root_scope_popup').hide();
        $$('entity_tree__root_scope').define('icon', newv);
        $$('entity_tree__root_scope').refresh();
        $('.entity_tree__search input').focus();
      }
    }
  }
};

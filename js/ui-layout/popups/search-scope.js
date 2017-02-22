UILayout.popups.searchScope = {
  view: 'popup',
  id: 'entity_tree__root_scope_popup',
    css: 'entity_tree__root_scope_popup',
  width: 130,
  body:{
    view: 'list',
        id: 'entity_tree__root_scope_popup_list',
        class: 'entity_tree__root_scope_popup_list',
        borderless: true,
    data:[
          { id: 'user', value: 'Yours', icon: 'user' },
          { id: 'globe', value: 'All', icon: 'globe' },
          { id: 'edit', value: 'Custom', icon: 'edit' },
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

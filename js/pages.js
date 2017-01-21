function Pages() {
  this.currentPage = 'data';
}

Pages.prototype.setCurrentPage = function(page) {
  if (this.currentPage === page) {
    return;
  }
  this.currentPage = page;
  switch (page) {
    case 'data':
      $$('my_data_panel').show();
      $$('my_apps_panel').hide();
      break;
    case 'apps':
      $$('my_data_panel').hide();
      $$('my_apps_panel').show();
      break;
    default:
      throw new Error('Illegal page: ' + this.currentPage);
  }
  if ($$('menu__item_list').getSelectedId() !== page) {
    $$('menu__item_list').select(page);
  }
  this.updatePageState(page);
};

Pages.prototype.updatePageState = function(page) {
  if (this.currentPage !== page) {
    return;
  }
  switch (page) {
    case 'apps':
      if ($$('app_list').getFirstId() == null) {
        document.getElementById('no_items').innerText = STRINGS.NO_APPS;
        document.getElementById('no_items').style.display = 'block';
        $$('my_apps_panel__right_panel').hide();
        $$('my_apps_panel__resizer').hide();
      } else {
        document.getElementById('no_items').style.display = 'none';
        $$('my_apps_panel__right_panel').show();
        $$('my_apps_panel__resizer').show();
      }
      break;
    case 'data':
      if ($$('entity_tree').getFirstId() == null) {
        document.getElementById('no_items').style.display = 'block';
        document.getElementById('no_items__new_root_input').focus();
        $$('my_data_panel__right_panel').hide();
        $$('my_data_panel__resizer_2').hide();
        $$('my_data_panel__central_panel').hide();
        $$('my_data_panel__resizer_1').hide();
      } else {
        document.getElementById('no_items').style.display = 'none';
        $$('my_data_panel__right_panel').show();
        $$('my_data_panel__resizer_2').show();
        $$('my_data_panel__central_panel').show();
        $$('my_data_panel__resizer_1').show();
      }
      break;
    default:
      throw new Error('Illegal page: ' + this.currentPage);
  }
};

Pages.prototype.refreshCurrentPage = function() {
  this.refreshPage(this.currentPage);
};

Pages.prototype.refreshPage = function(page, selectOnlyCurrentPage) {
  switch (page) {
    case 'apps':
      UI.refreshApps();
      break;
    case 'data':
      UI.entityTree.refresh();
      break;
    default:
      throw new Error('Illegal page: ' + page);
  }
  if ($$('menu__item_list').getSelectedId() !== page
      && (selectOnlyCurrentPage && this.currentPage === page || !selectOnlyCurrentPage)) {
    $$('menu__item_list').select(page);
  }
};

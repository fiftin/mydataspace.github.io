/**
 * Created with JetBrains PhpStorm.
 * User: fifti
 * Date: 15.08.16
 * Time: 13:59
 * To change this template use File | Settings | File Templates.
 */
function EntityList() {
  
}

EntityList.prototype.setSelectedId = function(id) {
  this.selectedId = id;
  this.refreshData();
};

/**
 * Reload data (from server) of entity list.
 * Uses entityList_fill internally.
 */
EntityList.prototype.refreshData = function() {
  var identity = UIHelper.dataFromId(this.selectedId);
  var search = $$('entity_list__search').getValue();
  if (common.isPresent(search)) {
    identity['filterByName'] = search;
  }
  $$('entity_list').disable();
  Mydataspace.request('entities.getChildren', identity, function(data) {
    var showMoreChildId =
      UIHelper.childId(this.selectedId, UIHelper.ENTITY_LIST_SHOW_MORE_ID);
    var entityId = UIHelper.idFromData(data);
    var children = data.children.map(UIHelper.entityFromData);
    if (this.selectedId === entityId) {
      if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
        children[children.length - 1] = {
          id: UIHelper.childId(entityId, UIHelper.ENTITY_LIST_SHOW_MORE_ID),
          value: STRINGS.SHOW_MORE
        }
      }
      this.fill(entityId, children);
      $$('entity_list').addCss(showMoreChildId, 'entity_list__show_more_item');
    }
    $$('entity_list').enable();
  }.bind(this), function(err) { UI.error(err); });
};

/**
 * Fills entity list by items from children array.
 *
 * @param parentEntityId Root entity (selected in entity tree).
 *                       Displays as '.' in entity list.
 * @param children Items of entity list.
 */
EntityList.prototype.fill = function(parentEntityId, children) {
  $$('entity_list').clearAll();
  for (var i in children) {
    $$('entity_list').add(children[i], -1);
  }
  $$('entity_list').add({ id: parentEntityId,  value: '.' }, 0);
  $$('entity_list').select(parentEntityId);
};

EntityList.prototype.addChildren = function(children) {
  var showMoreChildId =
    UIHelper.childId(this.selectedId, UIHelper.ENTITY_LIST_SHOW_MORE_ID);
  if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
    delete children[children.length - 1];
  } else {
    $$('entity_list').remove(showMoreChildId);
  }
  var startIndex = this.count() + 1;
  var offset = 0;
  for (var i in children) {
    $$('entity_list').add(children[i], startIndex + offset);
    offset++;
  }
};

EntityList.prototype.showMore = function() {
  var req = UIHelper.dataFromId(this.selectedId);
  req.offset = this.count();
  Mydataspace.request('entities.getChildren', req, function(data) {
    var children = data.children.map(UIHelper.entityFromData);
    this.addChildren(children);
  }.bind(this));
};

/**
 * Calculates number of items of entity list.
 * @returns {number} Number of items in entity list.
 */
EntityList.prototype.count = function() {
  var lastId = $$('entity_list').getLastId();
  var lastIndex = $$('entity_list').getIndexById(lastId) - 1;
  if (lastId.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID)) {
    return lastIndex;
  }
  return lastIndex + 1;
};

EntityList.prototype.getSelectedId = function() {
  return this.selectedId;
};

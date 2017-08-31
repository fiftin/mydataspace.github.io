var Identity = {
  /**
   * Returns UI-formatted entity data from data received from server.
   */
  entityFromData: function(data) {
    var entityId = Identity.idFromData(data);
    var children = [];
    if (!MDSCommon.isBlank(data.numberOfChildren) && data.numberOfChildren > 0) {
      children.push({
        id: Identity.childId(entityId, UIHelper.ENTITY_TREE_DUMMY_ID),
        value: ''
      });
    }
    return {
      id: entityId,
      value: Identity.nameFromData(data),
      count: data.numberOfChildren,
      associatedData: data,
      data: children
    };
  },

  /**
   * Returns name of entity or root from data.
   */
  nameFromData: function(data) {
    if (MDSCommon.isBlank(data.path)) {
      return data.root;
    }
    return data.path.split('/').slice(-1)[0];
  },

  /**
   * Forms string with id of entity.
   * @param data Entity data included root & path.
   * @returns string Entity id
   */
  idFromData: function(data) {
    if (MDSCommon.isBlank(data.path)) {
      return data.root;
    }
    return data.root + ':' + data.path;
  },

  dataFromId: function(id) {
    var idParts = id.split(':');
    var ret = {
      root: idParts[0],
      path: idParts.length === 1 ? '' : idParts[1]
    };
    return ret;
  },

  childId: function(entityId, childSubPath) {
    if (entityId.indexOf(':') !== -1) {
      return entityId + '/' + childSubPath;
    }
    return entityId + ':' + childSubPath;
  },

  parentId: function(entityId) {
    var i = entityId.lastIndexOf('/');
    if (i === -1) {
      var parts = entityId.split(':');
      if (parts.length === 1) {
        return 'root';
      }
      return parts[0];
    }
    return entityId.slice(0, i);
  },

  renameData: function(renameData, itemData) {
    var newItemData = MDSCommon.copy(itemData);
    if (MDSCommon.isBlank(renameData.path)) {
      newItemData.root = renameData.name;
    } else {
      var path = MDSCommon.getParentPath(renameData.path) + '/' + renameData.name;
      if (newItemData.path === renameData.path) {
        newItemData.path = path;
      } else {
        if (newItemData.path.indexOf(path + '/') !== 0) {
          throw new Error('Illegal path of destination item');
        }
        newItemData.path = path + newItemData.path.substr(renameData.path.length);
      }
    }
    return newItemData;
  },

  isRootId: function(id) {
    return id.indexOf(':') < 0;
  }
};

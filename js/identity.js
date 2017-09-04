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
    var v = MDSCommon.findValueByName(data.fields || [], '$version');
    var version = '';
    if (typeof v === 'number' && v > 0) {
      version = '?' + v;
    }
    
    if (MDSCommon.isBlank(data.path)) {
      return data.root + version;
    }
    return data.root + ':' + data.path + version;
  },

  dataFromId: function(id) {
    var idVersionParts = id.split('?');
    var idParts = idVersionParts[0].split(':');
    var ret = {
      root: idParts[0],
      path: idParts.length === 1 ? '' : idParts[1]
    };
    
    if (MDSCommon.isInt(idVersionParts[1])) {
      ret.version = parseInt(idVersionParts[1]);
    }

    return ret;
  },

  childId: function(entityIdWithVersion, childSubPath) {
    var idVersionParts = entityIdWithVersion.split('?');
    var entityId = idVersionParts[0];
    if (entityId.indexOf(':') !== -1) {
      return entityId + '/' + childSubPath;
    }
    var version = idVersionParts[1] != null ? '?' + idVersionParts[1] : '';
    return entityId + ':' + childSubPath + version;
  },

  parentId: function(entityIdWithVersion) {
    var idVersionParts = entityIdWithVersion.split('?');
    var entityId = idVersionParts[0];
    var i = entityId.lastIndexOf('/');
    var version = idVersionParts[1] != null ? '?' + idVersionParts[1] : '';
    if (i === -1) {
      var parts = entityId.split(':');
      if (parts.length === 1) {
        return 'root';
      }
      return parts[0] + version;
    }
    return entityId.slice(0, i) + version;
  },


  rootId: function(entityIdWithVersion) {
    var data = Identity.dataFromId(entityIdWithVersion);
    var version = data.version && data.version > 0 ? '?' + data.version : '';
    return data.root + version; 
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

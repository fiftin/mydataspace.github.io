UIHelper = {
  NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM: 6,
  MAX_STRING_FIELD_LENGTH: 1000,
  FIELD_TYPES: {
    s: {
      title: 'String',
      isValidValue: function(value) {
        return value.toString().length < UIHelper.MAX_STRING_FIELD_LENGTH;
      }
    },
    j: {
      title: 'Script',
      isValidValue: function(value) {
        return value.toString().length < UIHelper.MAX_STRING_FIELD_LENGTH;
      }
    },
    u: {
      title: 'Script URL',
      isValidValue: function(value) {
        return value.toString().length < UIHelper.MAX_STRING_FIELD_LENGTH;
      }
    },
    r: {
      title: 'Real',
      isValidValue: function(value) {
        return common.isNumber(value) || (typeof value === 'string' && /^\d[\d\.]*$/.test(value));
      }
    },
    i: {
      title: 'Integer',
      isValidValue: function(value) {
        return common.isInt(value) || (typeof value === 'string' && /^\d+$/.test(value));
      }
    }
  },

  getFieldsForSave: function(dirtyFields, currentFieldNames, oldFields) {
    if (typeof dirtyFields === 'undefined') dirtyFields = {};
    var deletedFields = {};
    for (var fieldName in oldFields) {
      if (currentFieldNames.indexOf(fieldName) === -1) {
        deletedFields[fieldName] = { value: null };
      }
    }
    return common.mapToArray(common.extend(dirtyFields, deletedFields));
  },

  /**
   * Returns UI-formatted entity data from data received from server.
   */
  entityFromData: function(data) {
    var entityId = UIHelper.idFromData(data);
    var children = [];
    if (!common.isBlank(data.numberOfChildren) && data.numberOfChildren > 0) {
      children.push({
        id: UIHelper.childId(entityId, 'dummy'),
        value: ''
      });
    }
    return {
      id: entityId,
      value: UIHelper.nameFromData(data),
      data: children
    };
  },

  nameFromData: function(data) {
    if (common.isBlank(data.path)) {
      return data.root;
    }
    return data.path.split('/').slice(-1)[0];
  },

  idFromData: function(data) {
    if (common.isBlank(data.path)) {
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
  }
}

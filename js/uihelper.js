UIHelper = {
  /**
   * Number of entities received by single request.
   */
  NUMBER_OF_ENTITIES_LOADED_AT_TIME: 20,
  /**
   * Width of label of field in form.
   */
  LABEL_WIDTH: 120,
  NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM: 6,
  MAX_STRING_FIELD_LENGTH: 1000,
  ENTITY_TREE_SHOW_MORE_ID: 'show_more_23478_3832ee',
  ENTITY_TREE_DUMMY_ID: 'dummy_483__4734_47e4',
  ENTITY_LIST_SHOW_MORE_ID: 'show_more_47384_3338222',
  FIELD_TYPES: {
    s: {
      title: STRINGS.STRING,
      isValidValue: function(value) {
        return value.toString().length < UIHelper.MAX_STRING_FIELD_LENGTH;
      }
    },
    r: {
      title: STRINGS.REAL,
      isValidValue: function(value) {
        return common.isNumber(value);
      }
    },
    i: {
      title: STRINGS.INT,
      isValidValue: function(value) {
        return common.isInt(value);
      }
    },
    j: {
      title: 'JS',
      isValidValue: function(value) {
        return value.toString().length < UIHelper.MAX_STRING_FIELD_LENGTH;
      }
    },
    u: {
      title: 'JS URL',
      isValidValue: function(value) {
        return value.toString().length < UIHelper.MAX_STRING_FIELD_LENGTH;
      }
    }
  },

  FIELD_TYPE_ICONS: {
    s: 'commenting',
    w: 'lock',
    t: 'align-justify',
    i: 'italic',
    r: 'calculator',
    b: 'check-square-o',
    d: 'calendar-o',
  },

  getFieldTypesAsArrayOfIdValue: function() {
    var ret = [];
    for (var key in UIHelper.FIELD_TYPES) {
      ret.push({
        id: key,
        value: UIHelper.FIELD_TYPES[key].title
      });
    }
    return ret;
  },

  /**
   *
   * @param dirtyFields
   * @param currentFieldNames
   * @param oldFields
   * @returns {*}
   */
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
        id: UIHelper.childId(entityId, UIHelper.ENTITY_TREE_DUMMY_ID),
        value: ''
      });
    }
    return {
      id: entityId,
      value: UIHelper.nameFromData(data),
      count: data.numberOfChildren,
      data: children
    };
  },

  nameFromData: function(data) {
    if (common.isBlank(data.path)) {
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
  },

  popupCenter: function(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
    return newWindow;
  }
};

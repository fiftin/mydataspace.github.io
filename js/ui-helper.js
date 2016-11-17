UIHelper = {
  SCREEN_XS: 700,
  /**
   * Number of entities received by single request.
   */
  NUMBER_OF_ENTITIES_LOADED_AT_TIME: 20,
  /**
   * Width of label of field in form.
   */
  LABEL_WIDTH: 120,
  NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM: 7,
  MAX_STRING_FIELD_LENGTH: 1000,
  MAX_TEXT_FIELD_LENGTH: 1000000,
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
    j: {
      title: 'Text',
      isValidValue: function(value) {
        return value.toString().length < UIHelper.MAX_TEXT_FIELD_LENGTH;
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
    // j: {
    //   title: 'JS',
    //   isValidValue: function(value) {
    //     return value.toString().length < UIHelper.MAX_STRING_FIELD_LENGTH;
    //   }
    // },
    u: {
      title: 'URL',
      isValidValue: function(value) {
        return value.toString().length < UIHelper.MAX_STRING_FIELD_LENGTH;
      }
    }
  },

  FIELD_TYPE_ICONS: {
    s: 'commenting',
    w: 'lock',
    j: 'align-justify',
    i: 'italic',
    r: 'calculator',
    b: 'check-square-o',
    d: 'calendar-o',
    u: 'link'
  },

  expandFields: function(fields) {
      if (fields == null || (!Array.isArray(fields) && typeof fields !== 'object')) {
          return fields;
      }
      if (Array.isArray(fields)) {
          return fields.map(function(field) {
              return UIHelper.expandField(field);
          });
      } else {
          var ret = {};
          for (var key in fields) {
              var field = UIHelper.expandField(fields[key], key);
              ret[field.name] = field;
          }
          return ret;
      }
  },

  expandField: function(field, name) {
    if (name == null) {
      name = '';
    }
    if (field == null) {
      return field;
    }
    for (var key in field) {
      if (field[key] != null && typeof field[key] === 'object') {
        if (name !== '') {
          name += '.';
        }
        name += key;
        return UIHelper.expandField(field[key], name);
      }
    }

    if (name !== '') {
        field.name = name;
    }

    return field;
  },

  /**
   * User can only view entities. All buttons for manipulations is hidden in
   * this mode.
   */
  isViewOnly: function() {
    return window.location.hash != null &&
           window.location.hash !== '' &&
           window.location.hash !== '#';
  },

  getEntityTypeByPath: function(path) {
    var depth = UIHelper.getEntityDepthByPath(path);
    switch (path) {
      case '':
        return 'root';
      case 'protos':
        return 'protos';
      case 'tasks':
        return 'tasks';
      default:
        if (path.startsWith('tasks') && depth === 2) {
          return 'task';
        } else if (path.startsWith('protos') && depth === 2) {
          return 'proto';
        }
    }
    return 'none';
  },

  getIconByPath: function(path, isEmpty, isOpened) {
    var depth = UIHelper.getEntityDepthByPath(path);
    var icon;
    switch (path) {
      case '':
        icon = 'database';
        break;
      case 'protos':
        icon = 'cubes';
        break;
      case 'tasks':
        icon = 'code';
        break;
      default:
        if (path.startsWith('tasks') && depth === 2) {
          icon = 'file-code-o';
        } else if (path.startsWith('protos') && depth === 2) {
          icon = 'cube';
        } else if (isEmpty) {
          icon = 'file-o';
        } else {
          icon = isOpened ? 'folder-open' : 'folder';
        }
    }
    return icon;
  },

  getEntityDepthByPath: function(path) {
   var depth = 1;
   for (var i = 0; i < path.length; i++) {
     if (path[i] === '/') {
       depth++;
     }
   }
   return depth;
  },

  isProto: function(id) {
    if (id == null) {
      return false;
    }
    var identity = UIHelper.dataFromId(id);
    if (identity.path == null) {
      return false;
    }
    return identity.path.startsWith('protos/') &&
           UIHelper.getEntityDepthByPath(identity.path) === 2;
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

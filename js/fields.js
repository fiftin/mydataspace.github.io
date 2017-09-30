var Fields = {
  MAX_STRING_FIELD_LENGTH: 1000,
  MAX_TEXT_FIELD_LENGTH: 1000000,
  FIELD_INDEXED_ICONS: {
    'on': 'sort-alpha-asc', // 'sort-alpha-asc', 'sort-amount-asc',
    'fulltext': 'text-height',
    'off': 'ban'
  },

  FIELD_TYPES: {
    s: {
      title: STRINGS.STRING,
      isValidValue: function(value) {
        return value.toString().length < Fields.MAX_STRING_FIELD_LENGTH;
      }
    },
    j: {
      title: STRINGS.TEXT,
      isValidValue: function(value) {
        return value.toString().length < Fields.MAX_TEXT_FIELD_LENGTH;
      }
    },
    r: {
      title: STRINGS.REAL,
      isValidValue: function(value) {
        return MDSCommon.isNumber(value);
      }
    },
    i: {
      title: STRINGS.INT,
      isValidValue: function(value) {
        return MDSCommon.isInt(value);
      }
    },
    u: {
      title: 'URL',
      isValidValue: function(value) {
        return MDSCommon.isUrl(value);
      }
    },
    b: {
      title: STRINGS.BOOL,
      isValidValue: function(value) {
        return MDSCommon.isBool(value);
      }
    },
    d: {
      title: STRINGS.DATE,
      isValidValue: function(value) {
        return MDSCommon.isDate(value);
      }
    },
    e: {
      title: STRINGS.EMAIL,
      isValidValue: function(value) {
        return MDSCommon.isEmail(value);
      }
    },
    p: {
      title: STRINGS.PHONE,
      isValidValue: function(value) {
        return MDSCommon.isPhone(value);
      }
    }
  },

  FIELD_TYPE_LIST: [
    { id: 's', value: STRINGS.STRING, icon: 'commenting' },
    { id: 'j', value: STRINGS.TEXT, icon: 'align-justify' },
    { id: 'i', value: STRINGS.INT, icon: 'italic' },
    { id: 'r', value: STRINGS.REAL, icon: 'calculator'  },
    { id: 'u', value: 'URL', icon: 'link' },
    { id: 'b', value: STRINGS.BOOL, icon: 'check-square-o' },
    { id: 'd', value: STRINGS.DATE, icon: 'calendar-o' },
    { id: 'e', value: STRINGS.EMAIL, icon: 'envelope' },
    { id: 'p', value: STRINGS.PHONE, icon: 'phone' },
    { id: '*', value: STRINGS.SECRET, icon: 'lock' }
  ],

  FIELD_TYPE_ICONS: {
    s: 'commenting',
    j: 'align-justify',
    i: 'italic',
    r: 'calculator',
    u: 'link',
    b: 'check-square-o',
    d: 'calendar-o',
    e: 'envelope',
    p: 'phone',
    '*': 'lock',
  },

  expandFields: function(fields) {
      if (fields == null || (!Array.isArray(fields) && typeof fields !== 'object')) {
          return fields;
      }
      if (Array.isArray(fields)) {
          return fields.map(function(field) {
              return Fields.expandField(field);
          });
      } else {
          var ret = {};
          for (var key in fields) {
              var field = Fields.expandField(fields[key], key);
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
        return Fields.expandField(field[key], name);
      }
    }

    if (name !== '') {
        field.name = name;
    }

    return field;
  },

  getFieldIndexedAsArrayOfIdValue: function() {
    var ret = [];
    for (var key in Fields.FIELD_INDEXED) {
      ret.push({
        id: key,
        value: Fields.FIELD_INDEXED[key].value
      });
    }
    return ret;
  },

  getFieldTypesAsArrayOfIdValue: function() {
    var ret = [];
    for (var key in Fields.FIELD_TYPES) {
      ret.push({
        id: key,
        value: Fields.FIELD_TYPES[key].title
      });
    }
    return ret;
  },

  /**
   * Compate two collections of fields to determine what fields are changed,
   * deleted or created.
   * @param dirtyFields
   * @param currentFieldNames
   * @param oldFields
   * @returns {*} Object with fields for update.
   */
  getFieldsForSave: function(dirtyFields, currentFieldNames, oldFields) {
    if (typeof dirtyFields === 'undefined') dirtyFields = {};
    var deletedFields = {};
    for (var fieldName in oldFields) {
      if (currentFieldNames.indexOf(fieldName) === -1) {
        deletedFields[fieldName] = { value: null };
      }
    }
    return MDSCommon.mapToArray(MDSCommon.extend(dirtyFields, deletedFields));
  }
};

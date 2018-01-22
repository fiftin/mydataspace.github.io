webix.protoUI({
	name: "ace-editor",
	defaults:{
		mode: "javascript",
		theme: "chrome"
	},
	$init:function(config){
		this.$ready.push(this._render_cm_editor);
	},

	_render_cm_editor:function(){
		webix.require([
			"ace/src-noconflict/ace.js"
		], this._render_when_ready, this);
	},

	_render_when_ready:function(){
        var basePath = webix.codebase+"ace/src-noconflict/";

        ace.config.set("basePath", basePath);
        ace.config.set("modePath", basePath);
        ace.config.set("workerPath", basePath);
        ace.config.set("themePath", basePath);

		this.editor = ace.edit(this.$view);
        this.editor.$blockScrolling = Infinity;

        this.editor.setOptions({
			fontFamily: "Monaco,consolas,monospace",
			fontSize: "13px"
		});

        if(this.config.theme)
            this.editor.setTheme("ace/theme/"+this.config.theme);
        if(this.config.mode)
            this.editor.getSession().setMode("ace/mode/"+this.config.mode);
        if(this.config.value)
            this.setValue(this.config.value);
		if (this._focus_await)
            this.focus();

        this.editor.navigateFileStart();
        this.callEvent("onReady", [this.editor]);
	},

	setValue:function(value){
		if(!value && value !== 0)
			value = "";

		this.config.value = value;
		if(this.editor){
			this.editor.setValue(value, -1);
		}
	},

	getValue:function(){
		return this.editor ? this.editor.getValue() : this.config.value;
	},

	focus:function(){
		this._focus_await = true;
		if (this.editor)
			this.editor.focus();
	},

	getEditor:function(){
		return this.editor;
	}

}, webix.ui.view, webix.EventSystem);

/**
 * Earlier this class provided info about complex URL used for search roots in admin dashboard.
 * Now this functionality has been removed.
 * @type {{isEmpty: Router.isEmpty, getCommonSearchParts: Router.getCommonSearchParts, isSearch: Router.isSearch, isRoot: Router.isRoot, isFilterByName: Router.isFilterByName, getSearch: Router.getSearch, isMe: Router.isMe}}
 */
var Router = {
  window: window,

  /**
   * Check if URL has search part.
   * Examples of URLs with search part:
   *
   * /test
   * /#hello
   * /#me:hello
   * /#hello*
   * /#me:hello*
   *
   * @returns {boolean} True if URL has search part.
   */
  isEmpty: function() {
    return !Router.isRoot() && (MDSCommon.isBlank(window.location.hash) || window.location.hash === '#');
  },

  getVersion: function() {
    return MDSCommon.parseQuery(Router.window.location.search).v;
  },

  /**
   * Route links to single root.
   */
  isRoot: function() {
    if (Router.window.location.pathname === '/') {
      return false;
    }
    var parts = Router.window.location.pathname.split('/').filter(function(x) { return MDSCommon.isPresent(x); });
    if (parts.length >= 2) {
      return true;
    }
    return parts[0] != null && parts[0].length > 2;
  },


  getCommonSearchParts: function() {
    if (Router.isRoot()) {
      return null;
    }
    var parts = Router.window.location.hash.substring(1).split(':');
    var ret = {};
    if (parts.length === 1) {
      ret.search = parts[0];
    } else if (parts.length === 2) {
      ret.user = parts[0];
      ret.search = parts[1];
    } else {
      throw new Error('Illegal route');
    }
    return ret;
  },

  isSearch: function() {
    if (Router.isRoot()) {
      return false;
    }

    var parts = Router.getCommonSearchParts();
    if (parts == null || MDSCommon.isBlank(parts.search)) {
      return false;
    }
    var s = parts.search;
    return s.indexOf('*') === 0 && s.lastIndexOf('*') === s.length - 1;
  },

  isFilterByName: function() {
    if (Router.isRoot()) {
      return false;
    }
    var parts = Router.getCommonSearchParts();
    if (parts == null || MDSCommon.isBlank(parts.search) || parts.search === '*') {
      return false;
    }
    return parts.search.indexOf('*') === parts.search.length - 1;
  },

  getSearch: function() {
    if (Router.isRoot()) {
      var parts = Router.window.location.pathname.split('/').filter(function (x) { return MDSCommon.isPresent(x); });
      switch (parts.length) {
        case 0:
          throw new Error('Unknown error');
          break;
        case 1:
          if (parts[0].length <= 2) {
            throw new Error('Unknown error');
          }
          return parts[0];
          break;
        case 2:
          if (parts[0].length <= 2) {
            return parts[1];
          }
          return parts;
        default:
          if (parts[0].length <= 2) {
            return parts.slice(1);
          }
          return parts;
      }
    } else {
      var parts = Router.getCommonSearchParts();
      if (parts == null) {
        return '';
      }
      return parts.search.replace(/\*/g, '');
    }
  },

  isMe: function() {
    if (Router.isRoot()) {
      return false;
    }
    var parts = Router.getCommonSearchParts();
    return parts == null || parts != null && parts.user === 'me';
  }
};

UIConstants = {
	ENTITY_ICONS: {
		'root': 'database',
		'protos': 'cubes',
		'proto': 'cube',
		'tasks': 'code',
		'task': 'file-code-o',
		'logs': 'history',
		'log': 'file-movie-o',
		'resources': 'diamond',
		'resource': 'file-image-o',
		'processes': 'cogs',
		'process': 'cog',
		'likes': 'heart',
		'like': 'heart-o',
		'comments': 'comments',
		'comment': 'comment',
		'views': 'photo',
		'view': 'file-image-o',
    'website': 'globe',
    'wizards': 'magic',
    'wizard': 'magic'
	},

	ROOT_FIELDS: [
		'avatar',
		'name',
		'tags',
		'websiteURL',
		'description',
		'country',
		'language',
		'category',
		'readme'
	],

	HIDDEN_ROOT_FIELDS: [
		'vk',
		'isVKAuth',
		'facebook',
		'isFacebookAuth',
		'twitter',
		'isTwitterAuth',
		'odnoklassniki',
		'isOdnoklassnikiAuth'
	],

	IGNORED_PATHS: [
		// 'comments',
		// 'views',
		// 'likes'
		// 'processes'
	],

	SYSTEM_PATHS: [
		'resources',
		'tasks',
		'protos',
		'comments',
		'views',
		'likes',
		'processes',
    'website',
    'wizards'
	],

	CATEGORY_ICONS: {
		biz: 'briefcase',
		economy: 'area-chart',
		health: 'heart',
		edu: 'graduation-cap',
		ecology: 'leaf',
		culture: 'paint-brush',
		security: 'shield',
		transport: 'car',
		geo: 'map',
		state: 'university',
		tourism: 'plane'
	}
};


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
  APP_LABEL_WIDTH: 160,
  NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM: 7,

  ENTITY_TREE_SHOW_MORE_ID: 'show_more_23478_3832ee',
  ENTITY_TREE_DUMMY_ID: 'dummy_483__4734_47e4',
  ENTITY_LIST_SHOW_MORE_ID: 'show_more_47384_3338222',

  setVisible: function(components, isVisible) {
    if (!Array.isArray(components)) {
      components = [components];
    }
    for (var i in components) {
      var component = components[i];
      if (typeof component === 'string') {
        component = $$(component);
      }
      if (isVisible) {
        component.show();
      } else {
        component.hide();
      }
    }
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
      case 'resources':
      case 'tasks':
      case 'likes':
      case 'comments':
      case 'processes':
      case 'views':
      case 'website':
      case 'wizards':
        return path;
      default:
          if (/^wizards\/[^\/]+$/.test(path)) {
            return 'wizard';
          }
          if (/^tasks\/[^\/]+$/.test(path)) {
              return 'task';
          }
          if (/^tasks\/[^\/]+\/logs$/.test(path)) {
              return 'logs';
          }
          if (/^tasks\/[^\/]+\/logs\/[^\/]+$/.test(path)) {
              return 'log';
          }
          if (path.startsWith('protos/') && depth === 2) {
            return 'proto';
          }
          if (path.startsWith('likes/') && depth === 2) {
            return 'like';
          }
          if (path.startsWith('comments/') && depth === 2) {
            return 'comment';
          }
          if (path.startsWith('views/') && depth === 2) {
            return 'view';
          }
          if (path.startsWith('resources/')) {
            return 'resource';
          }
    }
    return 'none';
  },

  getIconByPath: function(path, isEmpty, isOpened) {
    var icon = UIConstants.ENTITY_ICONS[UIHelper.getEntityTypeByPath(path)];
    if (icon) {
        return icon;
    }
    if (isEmpty) {
      return 'file-o';
    } else {
      return isOpened ? 'folder-open' : 'folder';
    }
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

  isTaskPath: function(path) {
    if (path == null) {
      return false;
    }
    return path.startsWith('tasks/') &&
      UIHelper.getEntityDepthByPath(path) === 2;
  },

  isProtoPath: function(path) {
    if (path == null) {
      return false;
    }
    return path.startsWith('protos/') &&
           UIHelper.getEntityDepthByPath(path) === 2;
  },

  isProto: function(id) {
    if (id == null) {
      return false;
    }
    var identity = Identity.dataFromId(id);
    return UIHelper.isProtoPath(identity.path);
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
  },

  isValidJWT: function(token) {
    return isValidJWT(token);
  },

  getWizardUrlById: function(id) {
    var data = Identity.dataFromId(id);
    if (MDSCommon.isPresent(data.path)) {
      var path = MDSCommon.getParentPath(data.path);
      return 'https://wizard.myda.space/' + data.root + (MDSCommon.isPresent(path) ? '/' + path : '') + '/' + 'item.html'
    } else {
      return 'https://wizard.myda.space/' + data.root + '/' + 'root.html'
    }
  }

};

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
        return MDSCommon.isURL(value);
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

var Identity = {
  /**
   * Returns UI-formatted entity data from data received from server.
   */
  entityFromData: function(data) {
    var entityId = Identity.idFromData(data);
    var children;
    if (!MDSCommon.isBlank(data.numberOfChildren) && data.numberOfChildren > 0) {
      if (MDSCommon.isPresent(data.children)) {
        children = data.children.filter(function(x) {
          return (x.root !== 'root' || x.path !== '') && UIConstants.IGNORED_PATHS.indexOf(x.path) < 0;
        }).map(Identity.entityFromData);
      } else {
        children = [{
          id: Identity.childId(entityId, UIHelper.ENTITY_TREE_DUMMY_ID),
          value: ''
        }];
      }
    } else {
      children = [];
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
   * Entity ID format:
   * root:path?version
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

  idFromChildProtoData: function(data) {
    if (MDSCommon.isPresent(data.root)) {
      return data.root + ':' + data.path;
    }
    if (data.path.indexOf('protos/') !== 0) {
      throw new Error('Illegal child proto path: "' + data + '". Must starts with "protos/"');
    }
    return data.path.substring('protos/'.length);
  },

  dataFromChildProtoId: function(id) {
    if (id.indexOf('root:') === 0) {
      var parts = id.split(':');
      return {
        root: parts[0],
        path: parts[1]
      }
    } else {
      return {
        root: '',
        path: 'protos/' + id
      }
    }
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
    } else {
      ret.version = 0;
    }

    return ret;
  },

  childId: function(entityIdWithVersion, childSubPath) {
    var idVersionParts = entityIdWithVersion.split('?');
    var entityId = idVersionParts[0];
    var version = idVersionParts[1] != null ? '?' + idVersionParts[1] : '';
    if (entityId.indexOf(':') !== -1) {
      return entityId + '/' + childSubPath + version;
    }
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

	/**
	 * Changes root or path of itemData according to renameData.
	 * @param renameData
	 * @param itemData
	 * @returns {*}
	 */
  renameData: function(renameData, itemData) {
    var newItemData = MDSCommon.copy(itemData);
    if (MDSCommon.isBlank(renameData.path)) {
      newItemData.root = renameData.name;
    } else {
      var parentPath = MDSCommon.getParentPath(renameData.path);
			var path = MDSCommon.isPresent(parentPath) ? parentPath + '/' + renameData.name : renameData.name;

      if (newItemData.path === renameData.path) {
        newItemData.path = path;
      } else {
        if (newItemData.path.indexOf(renameData.path + '/') !== 0) {
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

UIControls = {
  getFieldTypeSelectTemplate: function() {
    var options = [];
    for (var id in Fields.FIELD_TYPES) {
      options.push({ id: id, value: Fields.FIELD_TYPES[id].title });
    }
    return {
      view: 'combo',
      required: true,
      name: 'type',
      value: 's',
      // template:"#name#",
      label: STRINGS.TYPE,
      options: options
    };
  },

  getEntityTypeSelectTemplate: function() {
    return {
      view: 'combo',
      label: STRINGS.OTHERS_CAN,
      name: 'othersCan',
      value: 'view_children',
      options: [
        // { id: 'nothing', value: STRINGS.NOTHING },
        // { id: 'read', value: STRINGS.ONLY_READ },
        { id: 'view_children', value: STRINGS.ONLY_READ },
        { id: 'create_child', value: STRINGS.CREATE_ONE_CHILD },
        { id: 'create_children', value: STRINGS.CREATE_CHILDREN }
      ],
      labelWidth: UIHelper.LABEL_WIDTH
    };
  },

	getRootFieldLabel: function(name) {
  	return '<div style="visibility: hidden">fake</div>' +
			'<div class="entity_form__field_label">' +
			STRINGS.ROOT_FIELDS[name] +
			'</div>' +
			'<div class="entity_form__field_label_ellipse_right"></div>' +
			'<div class="entity_form__field_label_ellipse"></div>';
	},

  getRootFieldSelectTemplate: function(name, value, values) {
		var options = [];
		for (var id in values) {
			options.push({ id: id, value: values[id] });
		}
		return {
			view: 'combo',
			label: STRINGS.ROOT_FIELDS[name],
			labelWidth: UIHelper.LABEL_WIDTH,
			name: 'fields.' + name + '.value',
			id: 'entity_form__' + name + '_value',
			value: value,
			options: options
		};
  },

	getRootFieldTextTemplate: function(name, value) {
  	return {
  		view: 'text',
			label: UIControls.getRootFieldLabel(name),
			labelWidth: UIHelper.LABEL_WIDTH,
			name: 'fields.' + name + '.value',
			id: 'entity_form__' + name + '_value',
			value: value,
			height: 38,
			css: 'entity_form__text_label',
			placeholder: STRINGS.ROOT_FIELD_PLACEHOLDERS[name]
		};
	},

  getRootFieldTextAreaTemplate: function(name, value) {
    return {
      view: 'textarea',
      label: UIControls.getRootFieldLabel(name),
      labelWidth: UIHelper.LABEL_WIDTH,
      name: 'fields.' + name + '.value',
      id: 'entity_form__' + name + '_value',
      value: value,
      height: 52,
      readonly: true,
      css: 'entity_form__text_label',
      placeholder: STRINGS.ROOT_FIELD_PLACEHOLDERS[name],
      on: {
        onBlur: function() {
          if (UI.entityForm.editScriptFieldId == 'entity_form__' + name + '_value') {
            UI.entityForm.editScriptFieldId = null;
          }
        },

        onFocus: function() {
          UI.entityForm.editScriptFieldId = 'entity_form__' + name + '_value';
          $$('edit_script_window__editor').setValue($$(UI.entityForm.editScriptFieldId).getValue());
          $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
          if (!$$('edit_script_window').isVisible()) {
            $$('edit_script_window').show();
          }
        }
      }
    };
  },

	getRootFieldView: function(type, data, values) {
  	var valueView;
  	switch (type) {
			case 'select':
				valueView = UIControls.getRootFieldSelectTemplate(data.name, data.value, values);
				break;
			case 'text':
				valueView = UIControls.getRootFieldTextTemplate(data.name, data.value);
				break;
      case 'textarea':
        valueView = UIControls.getRootFieldTextAreaTemplate(data.name, data.value);
        break;
      default:
        throw new Error('Unknown root field type: ' + type);
		}
		return {
			id: 'entity_form__' + data.name,
			css: 'entity_form__field',
			cols: [
				{ view: 'text',
					value: data.name,
					name: 'fields.' + data.name + '.name',
					hidden: true
				},
				{ view: 'text',
					value: data.type,
					id: 'entity_form__' + data.name + '_type',
					name: 'fields.' + data.name + '.type',
					hidden: true
				},
				valueView
			]
		};
	},

  /**
   * Returns object with initialized event handlers for typical modal dialog.
   */
  getOnForFormWindow: function(id) {
    var formId = id + '_form';
    var windowId = id + '_window';
    return {
      onHide: function() {
        $$(formId).clearValidation();
        $$(formId).setValues($$(formId).getCleanValues());
      },
      onShow: function() {
        $$(formId).focus();
        $$(formId).setDirty(false);
        $$(windowId + '__cancel_button').define('hotkey', 'escape');
      }
    };
  },

  addSpinnerToWindow: function(windowId) {
    $$(windowId.replace(/_window$/, '_form')).disable();
    var head = $$(windowId).getNode().querySelector('.webix_win_head > .webix_view > .webix_template');
    var spinner = document.createElement('i');
    spinner.className = 'fa fa-cog fa-spin fa-2x fa-fw webix_win_head_spinner';
    head.appendChild(spinner);
  },

  removeSpinnerFromWindow: function(windowId) {
    var head = $$(windowId).getNode().querySelector('.webix_win_head > .webix_view > .webix_template');
    var spinners = head.getElementsByClassName('webix_win_head_spinner');
    if (spinners.length !== 0) {
      head.removeChild(spinners[0]);
    }
    $$(windowId.replace(/_window$/, '_form')).enable();
  },

  getSubmitCancelForFormWindow: function(id, isLongExecutable) {
    if (isLongExecutable == null) {
      isLongExecutable = true;
    }
    var formId = id + '_form';
    var windowId = id + '_window';
    return { cols: [
        { view: 'button',
          id: windowId + '__create_button',
          value: STRINGS.CREATE,
          type: 'form',
          click: function() {
            if (isLongExecutable) {
              UIControls.addSpinnerToWindow(windowId);
            }
            $$(formId).callEvent('onSubmit');
          }
        },
        { view: 'button',
          id: windowId + '__cancel_button',
          value: STRINGS.CANCEL,
          click: function() { $$(windowId).hide() }
        }
      ]
    }
  },

  getLoginButtonView: function(providerName) {
    var authProvider = Mydataspace.getAuthProvider(providerName);
    return {
      view: 'button',
      label: authProvider.title,
      type: 'iconButton',
      icon: authProvider.icon,
      width: 250,
      height: 50,
      css: 'login_panel__' + providerName + '_button',
      click: function() {
        if (Mydataspace.isLoggedIn()) {
          throw new Error(STRINGS.ALREADY_LOGGED_IN);
        }
        Mydataspace.login(providerName);
      }
    };
  },

  getChangeVersionPopupData: function(isReadOnly) {
    if (isReadOnly) {
      return [{ id: 'new_version', value: STRINGS.ADD_VERSION }];
    }
    return [
      { id: 'new_version', value: STRINGS.ADD_VERSION },
//      { id: 'copy_version', value: 'Clone Current Version' },
      // { id: 'import_version', value: 'Import to New Version' },
//      { id: 'import_version_csv', value: 'Import New Version from CSV As Is' }
      { id: 'view_version', value: STRINGS.view_other_version_window_title },
      { id: 'switch_version', value: STRINGS.switch_default_version_window_title }
    ];
  },

  getNewEntityPopupData: function(id) {
    var path = id ? Identity.dataFromId(id).path : '';
    switch (path) {
      case '':
        return [
          {id: 'new_entity', value: STRINGS.new_entity, icon: 'file-o'},
          {id: 'import_wizard', value: STRINGS.import_entity},
          {id: 'new_resource', value: STRINGS.new_resource, icon: 'diamond'},
          {id: 'new_task', value: STRINGS.new_task, icon: 'file-code-o'},
          {id: 'new_proto', value: STRINGS.new_proto, icon: 'cube'}
//      { id: 'import_csv', value: 'Import Entity from CSV As Is' }
        ];
      case 'tasks':
        return [
          {id: 'new_task', value: STRINGS.new_task, icon: 'file-code-o'}
        ];
      case 'protos':
        return [
          {id: 'new_proto', value: STRINGS.new_proto, icon: 'cube'}
        ];
      case 'resources':
        return [
          {id: 'new_resource', value: STRINGS.new_resource, icon: 'diamond'}
        ];
      default:
        return [
          {id: 'new_entity', value: STRINGS.new_entity, icon: 'file-o'},
          {id: 'import_wizard', value: STRINGS.import_entity}
        ];
    }
  }
};

function EntityForm() {
  this.editing = false;
  this.loadedListeners = [];
}

EntityForm.prototype.onLoaded = function(listener) {
  this.loadedListeners.push(listener);
};

EntityForm.prototype.emitLoaded = function(data) {
  this.loadedListeners.forEach(function(listener) {
    listener(data);
  });
};

/**
 * Switch Entity Form to edit/view mode.
 */
EntityForm.prototype.setEditing = function(editing) {
  if (this.selectedId == null) {
      return;
  }

  this.editing = editing;
  $$('edit_script_window').hide();
  var entityType = UIHelper.getEntityTypeByPath(Identity.dataFromId(this.selectedId).path);

  UIHelper.setVisible('EDIT_ENTITY_LABEL', !editing);
  UIHelper.setVisible('RUN_SCRIPT_LABEL', editing && entityType === 'task');
  UIHelper.setVisible(['SAVE_ENTITY_LABEL', 'CANCEL_ENTITY_LABEL', 'ADD_FIELD_LABEL'], editing);

  if (editing) {
    webix.html.addCss($$('edit_script_window__toolbar').getNode(), 'entity_form__toolbar--edit');
    webix.html.addCss($$('entity_form__toolbar').getNode(), 'entity_form__toolbar--edit');
    $$('edit_script_window__editor').getEditor().setReadOnly(false);
  } else {
    webix.html.removeCss($$('edit_script_window__toolbar').getNode(), 'entity_form__toolbar--edit');
    webix.html.removeCss($$('entity_form__toolbar').getNode(), 'entity_form__toolbar--edit');
    $$('edit_script_window__editor').getEditor().setReadOnly(true);
  }
};

EntityForm.prototype.isEditing = function() {
  return this.editing;
};

EntityForm.prototype.listen = function() {
  var self = this;
  Mydataspace.on('entities.delete.res', function() {
    $$('entity_form').disable();
  });
};

EntityForm.prototype.isProto = function() {
  return UIHelper.isProto(this.selectedId);
};

EntityForm.prototype.getSelectedId = function () {
  return this.selectedId;
};

EntityForm.prototype.setSelectedId = function(id) {
  if (this.selectedId === id) {
    return;
  }
  this.selectedId = id;
  $$('edit_script_window').hide();
  this.refresh();
};


EntityForm.prototype.setLogRecords = function(fields, ignoredFieldNames, addLabelIfNoFieldsExists) {
  if (!Array.isArray(ignoredFieldNames)) {
    ignoredFieldNames = [];
  }
  if (addLabelIfNoFieldsExists == null) {
    addLabelIfNoFieldsExists = true;
  }
  var viewFields = document.getElementById('view__fields');
  if (MDSCommon.isBlank(fields)) {
    viewFields.innerHTML =
      addLabelIfNoFieldsExists ?
      '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>' :
      '';
  } else {
    viewFields.innerHTML = '';
    var numberOfChildren = 0;
    for (var i in fields) {
      var field = fields[i];
      if (ignoredFieldNames.indexOf(field.name) >= 0) {
        continue;
      }
      numberOfChildren++;
      var html = MDSCommon.textToHtml(field.value);
      var status = field.name.split('_')[1];
      var recordClass = 'view__log_record--' + status;
      if (MDSCommon.isBlank(html)) {
        switch (status) {
          case 'success':
            html = 'Script executed successfully';
            break;
          case 'fail':
            html = 'Script failed';
            break;
        }
      }
      var divFd = $('<div class="view__log_record ' + recordClass + '">' +
                        html +
                    '</div>').appendTo(viewFields);
    }
  }
  if (numberOfChildren === 0) {
    viewFields.innerHTML =
      addLabelIfNoFieldsExists ?
      '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>' :
      '';
  }
  return viewFields;
};


EntityForm.prototype.setViewFields = function(fields,
                                              ignoredFieldNames,
                                              addLabelIfNoFieldsExists,
                                              comparer,
                                              classResolver) {
  if (!Array.isArray(ignoredFieldNames)) {
    ignoredFieldNames = [];
  }
  if (addLabelIfNoFieldsExists == null) {
    addLabelIfNoFieldsExists = true;
  }
  var viewFields = document.getElementById('view__fields');
  if (MDSCommon.isBlank(fields)) {
    viewFields.innerHTML =
      addLabelIfNoFieldsExists ?
      '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>' :
      '';
  } else {
    viewFields.innerHTML = '';
    var numberOfChildren = 0;
    if (comparer) {
        fields.sort(comparer);
    }
    for (var i in fields) {
      var field = fields[i];
      if (field.name.indexOf('$') !== -1 || ignoredFieldNames.indexOf(field.name) >= 0) {
        continue;
      }
      numberOfChildren++;
      var html = MDSCommon.textToHtml(field.value);
      var multiline = html.indexOf('\n') >= 0;
      var multilineClass = multiline ? 'view__field_value--multiline' : '';
      var multilineEnd = multiline ? '    <div class="view__field_value__end"></div>\n' : '';
      var fieldClass = classResolver ? classResolver(field) : '';
      var divFd = $('<div class="view__field ' + fieldClass + '">\n' +
                    '  <div class="view__field_name">\n' +
                    '    <div class="view__field_name_box">\n' +
                           field.name +
                    '    </div>\n' +
                    '  </div>\n' +
                    '  <div class="view__field_value ' + multilineClass + '">\n' +
                    '    <div class="view__field_value_box">\n' +
                           (MDSCommon.isPresent(field.value) ? html : '&mdash;') +
                    '    </div>\n' +
                         multilineEnd +
                    '  </div>\n' +
                    '</div>').appendTo(viewFields);
      if (multiline) {
        divFd.data('value', field.value);
      }
    }
  }
  if (numberOfChildren === 0) {
    viewFields.innerHTML =
      addLabelIfNoFieldsExists ?
      '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>' :
      '';
  }
  return viewFields;
};

EntityForm.prototype.setRootView = function(data) {
  $.ajax({ url: '/fragments/root-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    var websiteURL = MDSCommon.findValueByName(data.fields, 'websiteURL');
    var description = MDSCommon.findValueByName(data.fields, 'description');
    var readme = MDSCommon.findValueByName(data.fields, 'readme');
    var tags = (MDSCommon.findValueByName(data.fields, 'tags') || '').split(' ').filter(function(tag) {
      return tag != null && tag !== '';
    }).map(function(tag) {
      return '<a class="view__tag" href="/?q=%23' + tag + '" onclick="openSearch_webix__header__search(\'' + tag + '\'); return false;">' + tag + '</a>';
    }).join(' ');


    view.innerHTML = html;
    var ava = MDSCommon.findValueByName(data.fields, 'avatar');
    if (MDSCommon.isPresent(ava)) {
      ava = Mydataspace.options.cdnURL + '/avatars/sm/' + ava + '.png';
    }
    document.getElementById('view__overview_image').src = ava || '/images/icons/root.svg';
    document.getElementById('view__title').innerText =
      MDSCommon.findValueByName(data.fields, 'name') || MDSCommon.getPathName(data.root);

    document.getElementById('view__tags').innerHTML = tags || '';

    if (data.root !== 'nothing' && data.root !== 'notfound') {
      document.getElementById('view__page_link').href = '/' + data.root;
      document.getElementById('view__page_link').classList.remove('hidden');
    }

    if (tags && websiteURL) {
      document.getElementsByClassName('view__overview_image_wrap')[0].classList.add('view__overview_image_wrap--large');
      document.getElementById('view__overview_image').classList.add('view__overview_image--large');
    } else if (tags || websiteURL) {
      document.getElementsByClassName('view__overview_image_wrap')[0].classList.add('view__overview_image_wrap--medium');
      document.getElementById('view__overview_image').classList.add('view__overview_image--medium');
    }


    if (MDSCommon.isBlank(websiteURL)) {
      document.getElementById('view__websiteURL').style.display = 'none';
    } else {
      document.getElementById('view__websiteURL').style.display = 'inline';
      document.getElementById('view__websiteURL').innerText = websiteURL;
      document.getElementById('view__websiteURL').href = websiteURL;
    }

    if (MDSCommon.isBlank(description)) {
      if (MDSCommon.isBlank(websiteURL)) {
        document.getElementById('view__description').innerHTML = '<i>' + STRINGS.NO_README + '</i>';
      }
    } else {
      document.getElementById('view__description').innerText = description;
    }
          
          
    document.getElementById('view__counters_likes_count').innerText =
      MDSCommon.findValueByName(data.fields, '$likes');
    document.getElementById('view__counters_comments_count').innerText =
      MDSCommon.findValueByName(data.fields, '$comments');


    if (data.root === 'nothing' || data.root === 'notfound') {
      document.getElementById('view__counters').style.display = 'none';
    }

    if (MDSCommon.isBlank(readme)) {
      document.getElementById('view__readme').style.display = 'none';
    } else {
      document.getElementById('view__readme').style.display = 'block';
    }
    document.getElementById('view__readme').innerHTML = md.render(readme);
    var viewFields = this.setViewFields(data.fields,
                                        ['name',
                                         'avatar',
                                         'description',
                                         'websiteURL',
                                         'readme',
                                         'tags'],
                                        false);
    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(this).data('value');
      if (value != null) {
        $$('edit_script_window__editor').setValue(value);
        if (!$$('edit_script_window').isVisible()) {
          $$('edit_script_window').show();
        }
      } else {
        $$('edit_script_window').hide();
      }
      $(this).addClass('view__field--active');
    });
  }.bind(this));
};

EntityForm.prototype.setTaskView = function(data) {
  $.ajax({ url: '/fragments/task-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    document.getElementById('view__overview_icon').className =
      'view__overview_icon fa fa-' +
      UIHelper.getIconByPath(data.path,
                             data.numberOfChildren === 0,
                             false);
    document.getElementById('view__title').innerText =
      MDSCommon.getPathName(data.path);

    const description = data.fields.filter(function(x) { return x.name === 'description'; })[0];
    if (description != null) {
      $('#view__description').text(description.value);
    } else {
      $('#view__description').remove();
    }
    var viewFields =
        this.setViewFields(data.fields,
                           ['status', 'statusText', 'interval', 'description'],
                           description == null,
                           function(x, y) {
                             if (x.name === 'main.js') {
                                 return 1;
                             }
                             if (y.name === 'main.js') {
                               return -1;
                             }
                             var isScriptX = /.*\.js$/.test(x.name);
                             var isScriptY = /.*\.js$/.test(y.name);
                             if (isScriptX && isScriptY || !isScriptX && !isScriptY) {
                                 if (x < y) {
                                     return -1;
                                 } else if (x.name > y.name) {
                                     return 1;
                                 } else {
                                     return 0;
                                 }
                             } if (isScriptX) {
                                 return 1;
                             } else {
                                 return -1;
                             }
                         }, function(x) {
                           if (x.name === 'main.js') {
                               return 'view__field--script view__field--script--main';
                           }
                           if (/.*\.js$/.test(x.name)) {
                             return 'view__field--script';
                           }
                           return '';
                         });
    var status = MDSCommon.findValueByName(data.fields, 'status');
    if (status != null) {
      var statusClass;
      switch (status) {
        case 'success':
          statusClass = 'view__status--success';
          break;
        case 'fail':
          statusClass = 'view__status--fail';
          break;
      }
      if (statusClass) {
        document.getElementById('view__status').classList.add(statusClass);
      }

      var statusText = MDSCommon.findValueByName(data.fields, 'statusText');
      if (!statusText) {
          switch (status) {
            case 'success':
              statusText = 'Script executed successfully';
              break;
            case 'fail':
              statusText = 'Script failed';
              break;
          }
      }
      document.getElementById('view__status').innerText = statusText;
    }

    var interval = MDSCommon.findValueByName(data.fields, 'interval') || 'paused';
    document.getElementById('view__interval_' + interval).classList.add('view__check--checked');

    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(this).data('value');
      if (value != null) {
        $$('edit_script_window__editor').setValue(value);
        if (!$$('edit_script_window').isVisible()) {
          $$('edit_script_window').show();
        }
      } else {
        $$('edit_script_window').hide();
      }
      $(this).addClass('view__field--active');
    });
  }.bind(this));
};

EntityForm.prototype.setEntityView = function(data) {
  if (this.selectedId == null) {
      return;
  }

  const self = this;
  const entityType = UIHelper.getEntityTypeByPath(Identity.dataFromId(self.selectedId).path);

  $.ajax({ url: '/fragments/entity-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    if (entityType === 'resource') {
      const resourceType = MDSCommon.findValueByName(data.fields, 'type');
      const resourceName = MDSCommon.getPathName(data.path);
      switch (resourceType) {
        case 'avatar':
          document.getElementById('view__overview_icon').parentNode.innerHTML =
            '<img src="' + Mydataspace.options.cdnURL + '/avatars/sm/' + resourceName + '.png" class="view__overview_image" />';
          break;
        case 'image':
          document.getElementById('view__overview_icon').parentNode.innerHTML =
            '<img src="' + Mydataspace.options.cdnURL + '/images/sm/' + resourceName + '.jpg" class="view__overview_image" />';
          break;
        default:
          document.getElementById('view__overview_icon').className =
            'view__overview_icon fa fa-' + UIHelper.getIconByPath(data.path, true, false);
      }
    } else {
      document.getElementById('view__overview_icon').className =
        'view__overview_icon fa fa-' +
        UIHelper.getIconByPath(data.path,
                               data.numberOfChildren === 0,
                               false);
    }
    document.getElementById('view__title').innerText = MDSCommon.getPathName(data.path);

    var viewFields;
    if (entityType === 'proto') {
      $('#view__description').remove();
      viewFields = this.setViewFields(data.fields);
    } else {
      const description = data.fields.filter(function(x) { return x.name === 'description'; })[0];
      if (description != null) {
        $('#view__description').text(description.value);
      } else {
        $('#view__description').remove();
      }
      viewFields = this.setViewFields(data.fields, ['description'], description == null);
    }

    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(this).data('value');
      if (value != null) {
        $$('edit_script_window__editor').setValue(value);
        if (!$$('edit_script_window').isVisible()) {
          $$('edit_script_window').show();
        }
      } else {
        $$('edit_script_window').hide();
      }
      $(this).addClass('view__field--active');
    });
  }.bind(this));
};

EntityForm.prototype.setLogView = function(data) {
  $.ajax({ url: '/fragments/log-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    document.getElementById('view__overview_icon').className =
      'view__overview_icon fa fa-' +
      UIHelper.getIconByPath(data.path,
                             data.numberOfChildren === 0,
                             false);
    document.getElementById('view__title').innerText =
      MDSCommon.getPathName(data.path);
    var viewFields = this.setLogRecords(data.fields);
    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      var value = $(this).data('value');
      if (value != null) {
        $$('edit_script_window__editor').setValue(value);
        if (!$$('edit_script_window').isVisible()) {
          $$('edit_script_window').show();
        }
      } else {
        $$('edit_script_window').hide();
      }
      $(this).addClass('view__field--active');
    });
  }.bind(this));
};

EntityForm.prototype.setView = function(data) {
  $('#view').append('<div class="view__loading"></div>');
  if (MDSCommon.isBlank(data.path)) {
    this.setRootView(data);
  } else if (UIHelper.getEntityTypeByPath(data.path) === 'task') {
    this.setTaskView(data);
  } else if (UIHelper.getEntityTypeByPath(data.path) === 'log') {
    this.setLogView(data);
  } else {
    this.setEntityView(data);
  }
  $$('entity_form').hide();
  $$('entity_view').show();
};

EntityForm.prototype.setData = function(data) {
  var formData = {
    name: Identity.nameFromData(data),
    othersCan: data.othersCan,
    description: data.description,
    maxNumberOfChildren: data.maxNumberOfChildren,
    isFixed: data.isFixed,
    childPrototype: Identity.idFromChildProtoData(data.childPrototype)
  };
  this.clear();
  $$('entity_form').setValues(formData);

  if (MDSCommon.isBlank(data.path)) { // root entity
    this.addRootFields(data.fields);
  } else {
    $$('NO_FIELDS_LABEL').show();
    this.addFields(data.fields, false, UIHelper.getEntityTypeByPath(data.path));
  }
  this.setClean();
  $$('entity_view').hide();
  $$('entity_form').show();
};

EntityForm.prototype.refresh = function() {

  if (this.selectedId == null) {
      return;
  }

  const self = this;
  const entityType = UIHelper.getEntityTypeByPath(Identity.dataFromId(self.selectedId).path);
  const isWithMeta = self.isEditing();
  $$('entity_form').disable();
  const req = !isWithMeta ? 'entities.get' : 'entities.getWithMeta';
  Mydataspace.request(req, MDSCommon.extend(Identity.dataFromId(self.selectedId), { children: true }), function(data) {
    if (!isWithMeta || entityType === 'resource') {
      self.setView(data);

      if (data.mine) {
        $$('DELETE_ENTITY_SHORT_LABEL').show();
      } else {
        $$('DELETE_ENTITY_SHORT_LABEL').hide();
      }

      if (entityType === 'resource' || !data.mine) {
        $$('EDIT_ENTITY_LABEL').hide();
      } else {
        $$('EDIT_ENTITY_LABEL').show();
      }
    } else {
      self.setData(data);
      if (self.isProto()) {
        $('.entity_form__first_input').addClass('entity_form__first_input--proto');
        $$('PROTO_IS_FIXED_LABEL').show();
      } else {
        $('.entity_form__first_input').removeClass('entity_form__first_input--proto');
        $$('PROTO_IS_FIXED_LABEL').hide();
      }
      $$('entity_form').enable();
    }
    self.emitLoaded(data);
    if ($$('edit_script_window').isVisible() && UI.entityForm.editScriptFieldId != null) {
      const editedField = $$(UI.entityForm.editScriptFieldId);
      if (editedField != null) {
        $$('edit_script_window__editor').setValue(editedField.getValue());
        $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
      } else {
        UI.entityForm.editScriptFieldId = null;
      }
    }
  }, function(err) {
    UI.error(err);
    $$('entity_form').enable();
  });
};

/**
 * Creates new entity by data received from the 'New Entity' form.
 * @param formData data received from form by method getValues.
 */
//EntityForm.prototype.createByFormData = function(formData) {
//  var newEntityId = Identity.childId(this.selectedId, formData.name);
//  var data = Identity.dataFromId(newEntityId);
//  data.fields = [];
//  data.type = formData.type;
//  Mydataspace.emit('entities.create', data);
//};

EntityForm.prototype.clone = function() {
  $$('clone_entity_window').show();
};

EntityForm.prototype.delete = function() {
  if (this.selectedId == null) {
    return;
  }

  $$('entity_form').disable();
  UI.deleteEntity(this.selectedId);
  Mydataspace.request('entities.delete', Identity.dataFromId(this.selectedId), function(data) {
    // do nothing because selected item already deleted.
    this.selectedId = null;
  }, function(err) {
    UI.error(err);
    $$('entity_form').enable();
  });
};

EntityForm.prototype.updateToolbar = function() {
  // if (!$$('entity_form').isDirty()) {
  //   $$('SAVE_ENTITY_LABEL').disable();
  // } else {
  //   $$('SAVE_ENTITY_LABEL').enable();
  // }
};

/**
 * Marks entity form as unchanged.
 */
EntityForm.prototype.setClean = function() {
  $$('entity_form').setDirty(false);
  this.updateToolbar();
  $$('entity_form').enable();
};

/**
 * Marks entity form as changed.
 */
EntityForm.prototype.setDirty = function() {
  $$('entity_form').setDirty(true);
  this.updateToolbar();
};


EntityForm.prototype.save = function() {
	var self = this;

  if (self.selectedId == null) {
      return;
  }

  var dirtyData = webix.CodeParser.expandNames($$('entity_form').getDirtyValues());
  var existingData =
    webix.CodeParser.expandNames(
      Object.keys($$('entity_form').elements).reduce(function(ret, current) {
        ret[current] = '';
        return ret;
      }, {}));
  var oldData = webix.CodeParser.expandNames($$('entity_form')._values);
  MDSCommon.extendOf(dirtyData, Identity.dataFromId(self.selectedId));

  dirtyData.fields =
    Fields.expandFields(
      Fields.getFieldsForSave(Fields.expandFields(dirtyData.fields), // dirty fields
                                Object.keys(Fields.expandFields(existingData.fields) || {}), // current exists field names
                                Fields.expandFields(oldData.fields))); // old fields
  $$('entity_form').disable();
  if (typeof dirtyData.childPrototype !== 'undefined') {
    dirtyData.childPrototype = Identity.dataFromChildProtoId(dirtyData.childPrototype);
  }
  Mydataspace.request('entities.change', dirtyData, function(res) {
    if (dirtyData.name != null) {
    	if (Identity.isRootId(self.selectedId)) {
				self.selectedId = Identity.idFromData(MDSCommon.extend(res, { root: dirtyData.name }));
			} else {
				self.selectedId = Identity.idFromData(MDSCommon.extend(res, {
					path: MDSCommon.getChildPath(MDSCommon.getParentPath(res.path), dirtyData.name)
				}));
			}
    }
		self.refresh();
    $$('entity_form').enable();
  }, function(err) {
    UI.error(err);
    $$('entity_form').enable();
  });
};

/**
 * Removes all fields from the form.
 */
EntityForm.prototype.clear = function() {
  var rows = $$('entity_form').getChildViews();
  for (var i = rows.length - 1; i >= UIHelper.NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM; i--) {
    var row = rows[i];
    if (typeof row !== 'undefined') {
      $$('entity_form').removeView(row.config.id);
    }
  }
};

EntityForm.prototype.addFields = function(fields, setDirty, type) {

  for (var i in fields) {
    var field = fields[i];
    if (field.name.indexOf('$') === 0) {
      continue;
    }

    switch (type) {
      case 'task':
        switch (field.name) {
          case 'status':
          case 'statusText':
            break;
          case 'interval':
            this.addTaskIntervalField(field, setDirty);
            break;
          default:
            this.addField(field, setDirty, type === 'proto');
            break;
        }
        break;
      default:
        this.addField(field, setDirty, type === 'proto');
        break;
    }
  }
};

EntityForm.prototype.addRootFields = function(fields, setDirty) {
  fields.sort (function(x, y) {
    var xIndex = UIConstants.ROOT_FIELDS.indexOf(x.name);
    var yIndex = UIConstants.ROOT_FIELDS.indexOf(y.name);
    if (xIndex >= 0 && yIndex < 0) {
      return -1;
    }
    if (xIndex < 0 && yIndex >= 0) {
      return 1;
    }
    if (xIndex < 0 && yIndex < 0) {
      if (x.name < y.name) {
        return -1;
      } else if (x.name > y.name) {
        return 1;
      } else {
        return 0;
      }
    }
    if (xIndex < yIndex) {
      return -1;
    } else if (xIndex > yIndex) {
      return 1;
    } else {
      return 0;
    }
  });

  for (var i in fields) {
    var field = fields[i];
    if (field.name.indexOf('$') === 0) {
      continue;
    }
    if (UIConstants.HIDDEN_ROOT_FIELDS.indexOf(field.name) >= 0) {
      continue;
    }
    if (UIConstants.ROOT_FIELDS.indexOf(field.name) >= 0) {
      this.addRootField(field, setDirty);
    } else {
      this.addField(field, setDirty, false);
    }
  }
};

EntityForm.prototype.onUploadAvatar = function(event) {
  UI.uploadResource(
    event.target.files[0],
    Identity.dataFromId(this.selectedId).root,
    'avatar',
    function(res) {
      var entityName = res.resources[0];
      $$('entity_form__root_avatar_value').setValue(entityName);
      $('#entity_form__root_img').prop('src', Mydataspace.options.cdnURL + '/avatars/sm/' + entityName + '.png');    },
    function(err) {
      console.log(err);
    }
  );
};

EntityForm.prototype.addTaskIntervalField = function(data) {
  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  $$('NO_FIELDS_LABEL').hide();
  $$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.intervals), 6);
};

EntityForm.prototype.addRootField = function(data) {
  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  $$('NO_FIELDS_LABEL').hide();
  switch (data.name) {
		case 'avatar':
			$$('entity_form').addView({
				id: 'entity_form__' + data.name,
				css: 'entity_form__field entity_form__field--without-overflow',
				cols: [
					{ view: 'text',
						value: data.name,
						name: 'fields.' + data.name + '.name',
						hidden: true
					},
					{ view: 'text',
						value: data.type,
						id: 'entity_form__' + data.name + '_type',
						name: 'fields.' + data.name + '.type',
						hidden: true
					},
					{ view: 'text',
						value: data.value,
						name: 'fields.' + data.name + '.value',
						id: 'entity_form__root_avatar_value',
						hidden: true
					},
					{
						view: 'label',
						css: 'entity_form__field_label_avatar',
						label: '<div style="visibility: hidden">fake</div>' +
						'<div class="entity_form__field_label">' +
						STRINGS.ROOT_FIELDS[data.name] +
						'</div>' +
						'<div class="entity_form__field_label_ellipse_right"></div>' +
						'<div class="entity_form__field_label_ellipse"></div>',
						width: UIHelper.LABEL_WIDTH,
						height: 38
					},
					{
						borderless: true,
						css: 'entity_form__root_img_template',
						template: '<img id="entity_form__root_img" class="entity_form__root_img" src="' +
						(MDSCommon.isPresent(data.value) ? Mydataspace.options.cdnURL + '/avatars/sm/' + data.value + '.png' : '/images/icons/root.svg') +
						'" alt="Icon" />',
						width: 32
					},
					{ width: 16 },
					{
						borderless: true,
						css: 'entity_form__root_img_upload_template',
						template: '<label class="entity_form__root_img_upload_lbl">' +
						' <input type="file" ' +
						'        onchange="UI.entityForm.onUploadAvatar(event);"' +
						'        required />' +
						' <span>' + STRINGS.ROOT_AVATAR_UPLOAD + '</span>' +
						'</label>'
					},
					{ width: 6 },
					{
						view: 'button',
						label: STRINGS.ROOT_AVATAR_REMOVE,
						id: 'ROOT_AVATAR_REMOVE_LABEL',
						click: function() {
							$$('entity_form__root_avatar_value').setValue('');
							document.getElementById('entity_form__root_img').setAttribute('src', '/images/icons/root.svg');
						}
					}
				]
			});
			break;
		case 'category':
			$$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.categories));
			break;
		case 'language':
			$$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.languages));
			break;
		case 'country':
			$$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.countries));
			break;
    case 'readme':
      $$('entity_form').addView(UIControls.getRootFieldView('textarea', data));
      break;
		default:
			$$('entity_form').addView(UIControls.getRootFieldView('text', data));
			break;
	}
};

/**
 * Add new field to form.
 * @param {object} data       Data of field
 * @param {boolean} setDirty  Mark form as modified after field added.
 * @param {boolean} isProto   Is field of prototype-entity.
 */
EntityForm.prototype.addField = function(data, setDirty, isProto) {
  var self = this;

  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  $$('NO_FIELDS_LABEL').hide();
  if (typeof setDirty === 'undefined') {
    setDirty = false;
  }
  if (setDirty) {
    var values = webix.copy($$('entity_form')._values);
  }

  $$('entity_form').addView({
    id: 'entity_form__' + data.name,
    css: 'entity_form__field entity_form__field--text',
    cols: [
      { view: 'text',
        value: data.name,
        name: 'fields.' + data.name + '.name',
        hidden: true
      },
      { view: 'text',
        value: data.type,
        id: 'entity_form__' + data.name + '_type',
        name: 'fields.' + data.name + '.type',
        hidden: true
      },
      { view: 'text',
        value: data.indexed,
        id: 'entity_form__' + data.name + '_indexed',
        name: 'fields.' + data.name + '.indexed',
        hidden: true
      },
      { view: data.type === 'j' ? 'textarea' : 'text',
        label: '<div style="visibility: hidden">fake</div>' +
               '<div class="entity_form__field_label">' +
                data.name +
               '</div>' +
               '<div class="entity_form__field_label_ellipse_right"></div>' +
               '<div class="entity_form__field_label_ellipse"></div>',
        labelWidth: UIHelper.LABEL_WIDTH,
        name: 'fields.' + data.name + '.value',
        id: 'entity_form__' + data.name + '_value',
        value: data.value,
        height: 32,
        css: 'entity_form__text_label',
        readonly: data.type === 'j',
        on: {
          onBlur: function() {
            if (self.editScriptFieldId == 'entity_form__' + data.name + '_value') {
              self.editScriptFieldId = null;
            }
          },

          onFocus: function() {
            if (data.type === 'j') {
              self.editScriptFieldId = 'entity_form__' + data.name + '_value';
              $$('edit_script_window__editor').setValue($$(UI.entityForm.editScriptFieldId).getValue());
              $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
              if (!$$('edit_script_window').isVisible()) {
                $$('edit_script_window').show();
              }
            } else {
              $$('edit_script_window').hide();
            }
          }
        }
      },
      { view: 'button',
        width: 30,
        type: 'iconButton',
        icon: Fields.FIELD_TYPE_ICONS[data.type],
        css: 'entity_form__field_type_button',
        popup: 'entity_form__field_type_popup',
        options: Fields.getFieldTypesAsArrayOfIdValue(),
        id: 'entity_form__' + data.name + '_type_button',
        on: {
          onItemClick: function() {
            self.currentFieldName = data.name;
            $$('entity_form__field_type_popup_list').unselectAll();
          }
        }
      },
      { view: 'button',
        type: 'icon',
        css: 'entity_form__field_delete',
        icon: 'remove',
        width: 10,
        click: function() {
          self.deleteField(data.name);
        }
      },
      { view: 'button',
        width: 10,
        type: 'iconButton',
        icon: !isProto ? null : Fields.FIELD_INDEXED_ICONS[data.type === 'j' ? 'fulltext' : (data.indexed || 'off').toString()],
        css: 'entity_form__field_indexed_button',
        popup: 'entity_form__field_indexed_popup',
        disabled: !isProto || data.type === 'j',
        id: 'entity_form__' + data.name + '_indexed_button',
        on: {
          onItemClick: function() {
            self.currentFieldName = data.name;
            $$('entity_form__field_indexed_list').unselectAll();
          }
        }
      }
    ]
  });
  if (setDirty) {
    $$('entity_form')._values = values;
    self.updateToolbar();
  }
};

EntityForm.prototype.deleteField = function(name) {
  var values = webix.copy($$('entity_form')._values);
  $$('entity_form').removeView('entity_form__' + name);
  $$('entity_form')._values = values;
  this.setDirty();
  var rows = $$('entity_form').getChildViews();
  if (rows.length === UIHelper.NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM) {
    $$('NO_FIELDS_LABEL').show();
  }
};

/**
 * Created with JetBrains PhpStorm.
 * User: fifti
 * Date: 15.08.16
 * Time: 13:59
 * To change this template use File | Settings | File Templates.
 */
function EntityList() {

}

/**
 * Hide/show toolbar buttons according passed state - readonly or not.
 */
EntityList.prototype.setReadOnly = function(isReadOnly) {
  $$('entity_tree__new_root_version_list').clearAll();
  $$('entity_tree__new_root_version_list').parse(UIControls.getChangeVersionPopupData(isReadOnly));
  UIHelper.setVisible('ADD_ENTITY_LABEL', !isReadOnly);
  UIHelper.setVisible('NEW_VERSION_LABEL', !isReadOnly && Identity.isRootId(this.getRootId()));
};



//EntityList.prototype.changeItems = function(applyForData) {
//  var nextId;
//  var id = $$('entity_list').getFirstId();
//  while (id) {
//    var index = $$('entity_list').getIndexById(id);
//    $$('entity_list').copy(id, index, null, {
//      newId: id === UIHelper.ENTITY_LIST_SHOW_MORE_ID
//                    ? UIHelper.ENTITY_LIST_SHOW_MORE_ID
//                    : Identity.idFromData(applyForData(Identity.dataFromId(id)))
//    });
//    nextId = $$('entity_list').getNextId(id);
//    $$('entity_list').remove(id);
//    id = nextId;
//  }
//};


/**
 * Listen delete/create/rename events to update items in list.
 */
EntityList.prototype.listen = function() {
  var self = this;

  Mydataspace.on('entities.delete.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var entityId = Identity.idFromData(data);

      if ($$('entity_list').getFirstId() === entityId) { // Parent item "."
        self.setRootId(null);
        return;
      }

      if ($$('entity_list').getItem(entityId) == null) {
        return;
      }

      // ignore event if root item deleted
      if (entityId === self.getRootId()) {
        this.setRootId(null);
        return;
      }

      if (entityId === self.getCurrentId()) { // Select other item if selected item is deleted.
        var nextId = $$('entity_list').getPrevId(entityId) || $$('entity_list').getNextId(entityId);
        $$('entity_list').select(nextId);
      }

      $$('entity_list').remove(entityId);
    }
  });

  Mydataspace.on('entities.create.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var parentId = Identity.parentId(Identity.idFromData(data));
      var entity = Identity.entityFromData(data);
      if (self.getRootId() === parentId) {
        $$('entity_list').add(entity, 1);
        $$('entity_list').select(entity.id);
      }
    }
  });

  Mydataspace.on('entities.rename.res', function(data) {
    var id = Identity.idFromData(data);
    if ($$('entity_list').getFirstId() === id) { // can't rename ".." (current) entity, which children displayed in list
      return;
    }

    var item = $$('entity_list').getItem(id);

    if (!item) {
      return;
    }

    var index = $$('entity_list').getIndexById(id);
    var entity = Identity.entityFromData(MDSCommon.extend(item.associatedData, {
      path: MDSCommon.getChildPath(MDSCommon.getParentPath(item.associatedData.path), data.name)
    }));

    $$('entity_list').add(entity, index);
    $$('entity_list').remove(id);
  });
};


/**
 * Set Id of entity witch items displayed in list. This method reloading data.
 */
EntityList.prototype.setRootIdWithoutRefresh = function(id) {
  if (this.rootId === id) {
    return;
  }

  // if (this.rootId != null) {
  //   Mydataspace.request('entities.unsubscribe', MDSCommon.extend(Identity.dataFromId(this.rootId), {
  //     events: ['entities.rename.res']
  //   }));
  // }

  this.rootId = id;

  // if (id != null) {
  //   Mydataspace.request('entities.subscribe', MDSCommon.extend(Identity.dataFromId(id), {
  //     events: ['entities.rename.res']
  //   }));
  // }
};


/**
 * Set Id of entity witch items displayed in list. This method reloading data.
 */
EntityList.prototype.setRootId = function(id) {
  this.setRootIdWithoutRefresh(id);
  this.refresh();
};


/**
 * Id of entity witch items displayed in list.
 */
EntityList.prototype.getRootId = function() {
  return this.rootId;
};


/**
 * Set item selected in list.
 */
EntityList.prototype.setCurrentId = function(id) {
  this.currentId = id;
};


/**
 * Get item selected in list.
 */
EntityList.prototype.getCurrentId = function() {
  return this.currentId;
};


/**
 * Reload data (from server) of entity list.
 * Uses entityList_fill internally.
 * @param {string} [newRootId]
 */
EntityList.prototype.refresh = function(newRootId) {
  var self = this;

  if (newRootId != null) {
    self.setRootIdWithoutRefresh(newRootId);
  }

  if (self.getRootId() == null) {
    return;
  }

  $$('entity_tree__new_entity_list').clearAll();
  $$('entity_tree__new_entity_list').parse(UIControls.getNewEntityPopupData(self.getRootId()));

  var req = Identity.dataFromId(self.getRootId());
  var search = $$('entity_list__search').getValue();

  if (MDSCommon.isPresent(search)) {
    if (search.indexOf('*') === search.length - 1) {
      req['filterByName'] = search.substring(0, search.length - 1);
    } else {
      req['search'] = search;
    }
  }
  $$('entity_list').disable();
  Mydataspace.request('entities.getChildren', req, function(data) {
    var showMoreChildId =
      Identity.childId(self.getRootId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);
    var entityId = Identity.idFromData(data);
    var children = data.children.filter(function(x) {
      return (x.root !== 'root' || x.path !== '') && UIConstants.IGNORED_PATHS.indexOf(x.path) < 0;
    }).map(Identity.entityFromData);
    if (self.getRootId() === entityId) {
      if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
        children[children.length - 1] = {
          id: Identity.childId(entityId, UIHelper.ENTITY_LIST_SHOW_MORE_ID),
          value: STRINGS.SHOW_MORE
        }
      }
      self.fill(entityId, children, data);
      $$('entity_list').addCss(showMoreChildId, 'entity_list__show_more_item');
    }
    self.setReadOnly(!data.mine);
    
    var versionLabel = $$('NEW_VERSION_LABEL');
    var versionLabelText = versionLabel.data.label.split('<span')[0];
    versionLabelText += '<span class="version_btn__version">' + (MDSCommon.findValueByName(data.fields, '$version') || 0) + '</span>';
    versionLabel.define('label', versionLabelText);
    versionLabel.refresh();

    $$('entity_list').enable();
  }, function(err) { UI.error(err); });
};


/**
 * Fills entity list by items from children array.
 *
 * @param parentEntityId Root entity (selected in entity tree).
 *                       Displays as '.' in entity list.
 * @param children Items of entity list.
 * @param data
 */
EntityList.prototype.fill = function(parentEntityId, children, data) {
  $$('entity_list').clearAll();
  for (var i in children) {
    $$('entity_list').add(children[i], -1);
  }
  $$('entity_list').add({ id: parentEntityId,  value: '.', count: data.numberOfChildren }, 0);
  $$('entity_list').select(parentEntityId);
};


/**
 * Creates new entity by data received from the 'New Entity' form.
 * @param formData data received from form by method getValues.
 */
EntityList.prototype.createByFormData = function(formData) {
  var newEntityId = Identity.childId(this.getRootId(), formData.name);
  var data = Identity.dataFromId(newEntityId);
  data.fields = [];
  data.othersCan = formData.othersCan;
  Mydataspace.emit('entities.create', data);
};


EntityList.prototype.addChildren = function(children) {
  var showMoreChildId =
    Identity.childId(this.getRootId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);

  var startIndex;
  if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
    delete children[children.length - 1];
    startIndex = this.count() + 1;
  } else {
    $$('entity_list').remove(showMoreChildId);
    startIndex = this.count() + 2;
  }

  var offset = 0;
  for (var i in children) {
    $$('entity_list').add(children[i], startIndex + offset);
    offset++;
  }
};


EntityList.prototype.showMore = function() {
  var self = this;
  var req = Identity.dataFromId(this.getRootId());
  var search = $$('entity_list__search').getValue();
  if (MDSCommon.isPresent(search)) {
    req['search'] = search;
  }
  req.offset = self.count();
  $$('entity_list').disable();
  Mydataspace.request('entities.getChildren', req, function(data) {
    var children = data.children.filter(function(child) {
      return UIConstants.IGNORED_PATHS.indexOf(child.path) < 0;
    }).map(Identity.entityFromData);
    self.addChildren(children);
    $$('entity_list').enable();
  });
};


/**
 * Calculates number of items of entity list.
 * @returns {number} Number of items in entity list.
 */
EntityList.prototype.count = function() {
  var lastId = $$('entity_list').getLastId();
  var lastIndex = $$('entity_list').getIndexById(lastId);
  if (lastId.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID)) {
    return lastIndex - 1;
  }
  return lastIndex;
};

function EntityTree() {
}


/**
 *
 * @param entityIdOrData
 * @param isReturnId
 * @returns {*}
 */
EntityTree.prototype.findRoot = function(entityIdOrData, isReturnId) {
  var wantedData = typeof entityIdOrData === 'string' ? Identity.dataFromId(entityIdOrData) : entityIdOrData;
  var id = $$('entity_tree').getFirstId();
  var data = Identity.dataFromId(id);
  while (data.root !== wantedData.root) {
    id = $$('entity_tree').getNextSiblingId(id);
    if (!id) {
      return null;
    }
    data = Identity.dataFromId(id);
  }
  return isReturnId ? id : data;
};


EntityTree.prototype.setReadOnly = function(isReadOnly) {
  UIHelper.setVisible('ADD_ROOT_LABEL', !isReadOnly);
};


EntityTree.prototype.getCurrentId = function() {
  return this.currentId;
};


EntityTree.prototype.setCurrentId = function(id) {
  if (this.currentId != null) {
    var unsubscribeData = MDSCommon.extend(Identity.dataFromId(this.currentId));
    Mydataspace.entities.subscribe(unsubscribeData);
    if (unsubscribeData.path !== '') {
      unsubscribeData.path += '/';
    }
    unsubscribeData.path += '*';
    Mydataspace.entities.subscribe(unsubscribeData);
  }

  this.currentId = id;

  if (id != null) {
    var subscribeData = MDSCommon.extend(Identity.dataFromId(id));
    Mydataspace.entities.subscribe( subscribeData);
    if (subscribeData.path !== '') {
      subscribeData.path += '/';
    }
    subscribeData.path += '*';
    Mydataspace.entities.subscribe(subscribeData);
  }
};



EntityTree.prototype.createNewEmptyVersion = function(description) {
  var self = this;
  var currentData = Identity.dataFromId(UI.entityTree.currentId);

  return Mydataspace.entities.create({
    root: currentData.root,
    path: '',
    version: currentData.version,
    fields: [
      { name: '$newVersion', value: true, type: 'b' },
      { name: '$newVersionDescription', value: description, type: 's' }
    ]
  }).then(function(data) {
    var entity = Identity.entityFromData(data);
    var oldVersion = MDSCommon.findValueByName(data.fields || [], '$oldVersion');

    var oldId;
    if (oldVersion != null) {
      oldId = oldVersion === 0 ? data.root : data.root + '?' + oldVersion;
    }

    var i = 0;
    if (oldId != null && $$('entity_tree').getItem(oldId)) {
      i = $$('entity_tree').getBranchIndex(oldId);
    }

    if (oldId) {
      $$('entity_tree').remove(oldId);
    }

    $$('entity_tree').add(entity, i, null);

    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }

    $$('entity_tree').select(entity.id);
    $$('entity_tree').open(entity.id);
    UI.entityList.refresh(entity.id);
    UI.entityForm.refresh();
  });
};

/**
 * Change current version of root.
 * @param {string} rootId Existing Root ID which version you want to change.
 * @param {int} version Version you want to have.
 */
EntityTree.prototype.changeCurrentRootVersion = function(rootId, version) {
  var rootData = Identity.dataFromId(UI.entityList.getRootId());
  var self = this;
  Mydataspace.entities.change({
    root: rootData.root,
    path: '',
    version: rootData.version,
    fields: [{ name: '$version', value: version, type: 'i' }]
  }).then(function(data) {
    var entity = Identity.entityFromData(data);
    var i = $$('entity_tree').getBranchIndex(rootId);
    $$('entity_tree').remove(rootId);
    $$('entity_tree').add(entity, i, null);
    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }
    $$('entity_tree').select(entity.id);
    $$('entity_tree').open(entity.id);
    UI.entityList.refresh(entity.id);
    UI.entityForm.refresh();
  }).catch(function(err) {
    UI.error(err);
  });
};


/**
 * View another version of passed root.
 * @param {string} rootId Existing Root ID which version you want to view.
 * @param {int} version Version you want to view.
 */
EntityTree.prototype.viewRootVersion = function(rootId, version) {
  var data = Identity.dataFromId(rootId);
  var self = this;
  Mydataspace.entities.get({
    root: data.root,
    path: '',
    version: version,
    children: true
  }).then(function(data) {
    var entity = Identity.entityFromData(data);


    var i = $$('entity_tree').getBranchIndex(rootId);

    $$('entity_tree').remove(rootId);

    $$('entity_tree').add(entity, i, null);


    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }

    $$('entity_tree').select(entity.id);
    $$('entity_tree').open(entity.id);
    UI.entityList.refresh(entity.id);
    UI.entityForm.refresh();

  }).catch(function(err) {
    UI.error(err);
  });
};


/**
 * Check if children of entity are loaded.
 * Load children from server if children didn't loaded yet.
 * @param id Parent entity ID
 */
EntityTree.prototype.resolveChildren = function(id) {
  return new Promise(function(resolve, reject) {
    var firstChildId = $$('entity_tree').getFirstChildId(id);
    if (firstChildId != null && firstChildId !== Identity.childId(id, UIHelper.ENTITY_TREE_DUMMY_ID)) {
      resolve();
      return;
    }
    // Load children to first time opened node.
    Mydataspace.request('entities.getChildren', Identity.dataFromId(id), function(data) {
      var entityId = Identity.idFromData(data);
      var children = data.children.filter(function(x) {
        return (x.root !== 'root' || x.path !== '') && UIConstants.IGNORED_PATHS.indexOf(x.path) < 0;
      }).map(Identity.entityFromData);
      UI.entityTree.setChildren(entityId, children);
      resolve();
    }, function(err) {
      reject(err);
    });
  });
};


EntityTree.prototype.setCurrentIdToFirst = function() {
  var firstId = $$('entity_tree').getFirstId();
  this.setCurrentId(firstId);
  return firstId;
};


/**
 * Initializes event listeners.
 */
EntityTree.prototype.listen = function() {
  var self = this;

  Mydataspace.on('entities.create.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var parentId = Identity.parentId(Identity.idFromData(data));
      var entity = Identity.entityFromData(data);
      var oldVersion = MDSCommon.findValueByName(data.fields || [], '$oldVersion');

      if (oldVersion == null &&
        $$('entity_tree').getItem(Identity.childId(parentId, UIHelper.ENTITY_TREE_DUMMY_ID)) == null) {

        // simply add new entity to tree and no more
        $$('entity_tree').add(entity, 0, parentId === 'root' ? null : parentId);

        if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
          self.setChildren(entity.id, entity.data);
        }

        if (parentId === 'root') {
          $$('entity_tree').select(entity.id);
          $$('entity_tree').open(entity.id);
        }

        self.resolveChildren(entity.id).then(function() { $$('entity_tree').open(entity.id); });
      }
    }
  });


  Mydataspace.on('entities.delete.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var entityId;
      if (data.path === '') {
        var rootData = self.findRoot(data);
        if (rootData == null) {
          return;
        }
        entityId = Identity.idFromData(MDSCommon.extend(data, {version: rootData.version}));
      } else {
        entityId = Identity.idFromData(data);
        if ($$('entity_tree').getItem(entityId) == null) {
          return;
        }
      }

      if (entityId === self.getCurrentId()) { // Select other item if selected item is deleted.
        var nextId = $$('entity_tree').getPrevSiblingId(entityId) ||
          $$('entity_tree').getNextSiblingId(entityId) ||
          $$('entity_tree').getParentId(entityId);
        if (nextId) {
          $$('entity_tree').select(nextId);
    }
      }

      $$('entity_tree').remove(entityId);
    }
  });


  Mydataspace.on('entities.change.res', function(res) {
    var dataArray = Array.isArray(res) ? res : [res];
    for (var i in dataArray) {
      var data = dataArray[i];
      var oldVersion = MDSCommon.findValueByName(data.fields || [], '$oldVersion');

      // User only changed current version. Ignore it.
      if (data.path === '' && oldVersion != null) {
        return;
      }

      // Update changed entity view
      var entity = Identity.entityFromData(data);
      var item = $$('entity_tree').getItem(entity.id);
      if (item == null) {
        return;
      }
      $$('entity_tree').updateItem(entity.id, entity);
    }
  });


  Mydataspace.on('entities.rename.res', function(data) {
    var rootData = self.findRoot(data);
    if (rootData == null) {
      return;
    }

    var id = Identity.idFromData(MDSCommon.extend(data, { version: rootData.version }));
    if ($$('entity_tree').getItem(id) == null) {
      return;
    }

    var parentId = $$('entity_tree').getParentId(id);
    var newId = self.cloneItem(id, parentId, Identity.renameData.bind(null, data));
    if (self.getCurrentId() === id) {
      self.setCurrentId(newId);
      $$('entity_tree').select(newId);
    }

    $$('entity_tree').remove(id);

    //var subscribeData = MDSCommon.permit(data, ['root', 'path']);
    //Mydataspace.entities.unsubscribe(subscribeData);
    //Mydataspace.entities.subscribe(MDSCommon.extend(subscribeData, { path: MDSCommon.getChildPath(MDSCommon.getParentPath(data.path), data.name) }));
    //if (subscribeData.path != '') {
    //  subscribeData.path += '/';
    //}
    //subscribeData.path += '*';
    //Mydataspace.entities.unsubscribe(subscribeData);
    //Mydataspace.entities.subscribe(MDSCommon.extend(subscribeData, { path: MDSCommon.getChildPath(MDSCommon.getParentPath(data.path), data.name) }));
  });
};


/**
 * Create a copy of entity with all children.
 * @param {string} id               Id of entity for clone.
 * @param {string} parentId         Id of entity witch must be parent of created copy.
 * @param {function} applyForData   Function applied for associatedData of each entity.
 */
EntityTree.prototype.cloneItem = function(id, parentId, applyForData) {
  var currentParentId = $$('entity_tree').getParentId(id);
  var index = $$('entity_tree').getIndexById(id);

  if (MDSCommon.isPresent(currentParentId) && currentParentId !== 0) {
    var dummyId = Identity.childId(currentParentId, UIHelper.ENTITY_TREE_DUMMY_ID);
    var showMoreId = Identity.childId(currentParentId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
    var newSyntheticId;
    switch (id) {
      case dummyId:
        newSyntheticId = Identity.childId(parentId, UIHelper.ENTITY_TREE_DUMMY_ID);
        break;
      case showMoreId:
        newSyntheticId = Identity.childId(parentId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
        break;
    }
  }

  if (newSyntheticId != null) {
    $$('entity_tree').copy(id, index, null, {
      newId: newSyntheticId,
      parent: parentId
    });
    return;
  }

  var item = $$('entity_tree').getItem(id);
  var data = applyForData(item.associatedData);
  var newId = $$('entity_tree').add(Identity.entityFromData(data), index, parentId);
  var childId = $$('entity_tree').getFirstChildId(id);
  while (childId) {
    this.cloneItem(childId, newId, applyForData);
    childId = $$('entity_tree').getNextSiblingId(childId);
  }
  return newId;
};


// EntityTree.getViewOnlyRoot = function() {
//   return window.location.hash.substring(1).split('/')[0];
// };


/**
 * Load data to Tree component.
 * @param formattedData Data which should be loaded.
 */
EntityTree.prototype.loadFormattedData = function(formattedData) {
  $$('entity_tree').clearAll();
  this.currentId = null;
  $$('entity_tree').parse(formattedData);
  $$('entity_tree').enable();
};


EntityTree.prototype.requestRoots = function(onlyMine, reqData, selectedId) {
  var req = onlyMine ? 'entities.getMyRoots' : 'entities.getRoots';
  var self = this;
  Mydataspace.request(req, reqData, function(data) {
    // convert received data to TreeView format and load its to entity_tree.
    self.loadFormattedData(data['roots'].map(Identity.entityFromData));
    if (selectedId) {
      self.setCurrentId(selectedId);
    }
    UI.pages.updatePageState('data');
  }, function(err) {
    UI.error(err);
    $$('entity_tree').enable();
  });
};


EntityTree.prototype.refresh = function(root) {
  var self = this;
  $$('entity_tree').disable();

  if (MDSCommon.isBlank(root) && Router.isEmpty()) {
    if (Mydataspace.isLoggedIn()) {
      self.requestRoots(true, {});
    }
  } else if (MDSCommon.isBlank(root) && Router.isSearch()) {
    self.requestRoots(Router.isMe(), {
      search: Router.getSearch()
    });
  } else if (MDSCommon.isBlank(root)  && Router.isFilterByName()) {
    self.requestRoots(Router.isMe(), {
      filterByName: Router.getSearch()
    });
  } else if (MDSCommon.isPresent(root)  || Router.isRoot()) {
    var search = Router.getSearch();
    if (Array.isArray(search)) {
      search = search[0];
    }
    var requiredRoot = root || search;
    Mydataspace.request('entities.get', {
      root: requiredRoot,
      path: '',
      version: Router.getVersion()
    }, function(data) {
      self.loadFormattedData([Identity.entityFromData(data)]);
      UI.pages.updatePageState('data');
    }, function(err) {
      if (err.message === "Cannot read property 'Entity' of undefined") {
        UI.entityTree.refresh('notfound');
        return;
      }
      UI.error(err);
      $$('entity_tree').enable();
    });
  }
};


/**
 * Override entity's children recursively.
 */
EntityTree.prototype.setChildren = function(entityId, children) {
  var self = this;
  var dummyChildId = Identity.childId(entityId, UIHelper.ENTITY_TREE_DUMMY_ID);
  var showMoreChildId = Identity.childId(entityId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
  var firstChildId = $$('entity_tree').getFirstChildId(entityId);
  if (firstChildId != null && firstChildId !== dummyChildId) {
    return;
  }
  if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
    children[children.length - 1] = {
      id: Identity.childId(entityId, UIHelper.ENTITY_TREE_SHOW_MORE_ID),
      value: STRINGS.SHOW_MORE
    }
  }
  children.reverse().forEach(function(entity) {
    $$('entity_tree').add(entity, 0, entityId);
    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }
  });
  if (firstChildId !== null) {
    $$('entity_tree').remove(firstChildId);
  }
  $$('entity_tree').addCss(showMoreChildId, 'entity_tree__show_more_item');
};


EntityTree.prototype.addChildren = function(entityId, children) {
  var self = this;
  var showMoreChildId = Identity.childId(entityId, UIHelper.ENTITY_TREE_SHOW_MORE_ID);
  if (!$$('entity_tree').exists(showMoreChildId)) {
    return;
  }
  var offset;
  if (children.length === UIHelper.NUMBER_OF_ENTITIES_LOADED_AT_TIME) {
    delete children[children.length - 1];
    offset = 1;
  } else {
    $$('entity_tree').remove(showMoreChildId);
    offset = 0;
  }
  children.forEach(function(entity) {
    var nChildren = self.numberOfChildren(entityId);
    $$('entity_tree').add(entity, nChildren - offset, entityId);
    if (typeof entity.data !== 'undefined' && entity.data.length > 0) {
      self.setChildren(entity.id, entity.data);
    }
  });
};


/**
 * Request and and add more items to entity.
 * @param id Id of parent entity.
 */
EntityTree.prototype.showMore = function(id) {

  var self = this;
  var req = Identity.dataFromId(id);
  req.offset = self.numberOfChildren(id);
  Mydataspace.request('entities.getChildren', req, function(data) {
    var entityId = Identity.idFromData(data);
    var children = data.children.filter(function(child) {
      return UIConstants.IGNORED_PATHS.indexOf(child.path) < 0;
    }).map(Identity.entityFromData);
    self.addChildren(entityId, children);
  });
};


EntityTree.prototype.numberOfChildren = function(id) {
  var n = 0;
  var prevChildId = null;
  var childId = $$('entity_tree').getFirstChildId(id);
  while (childId != null && prevChildId !== childId) {
    n++;
    prevChildId = childId;
    childId = $$('entity_tree').getNextSiblingId(childId);
  }
  return n;
};

/**
 * Find last child ID
 * @param {string} parentId ID of entity which last child you want to find
 * @returns {*} Last child ID or null
 */
EntityTree.prototype.lastChildId = function(parentId) {
  var prevChildId = null;
  var childId = $$('entity_tree').getFirstChildId(parentId);
  while (childId != null && prevChildId !== childId) {
    prevChildId = childId;
    childId = $$('entity_tree').getNextSiblingId(childId);
  }
  return prevChildId;
};

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
        document.getElementById('no_items__no_apps').innerHTML =
          '<div class="no_items__no_apps">' + STRINGS.NO_APPS + '</div>' +
          '<div class="no_items__no_apps_description">' + STRINGS.NO_APPS_DESCRIPTION + '</div>' +
          '<div class="no_items__no_apps_create">' +
            '<button onclick="$$(\'add_app_window\').show()" class="btn btn-success btn-lg no_items__btn no_items__btn--center">' +
              STRINGS.NO_APPS_CREATE +
            '</button>' +
          '</div>';
        document.getElementById('no_items__no_apps').style.display = 'block';
        document.getElementById('no_items__no_data').style.display = 'none';
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
      if ($$('entity_tree').getFirstId() == null) { // && Router.isMe() && !Router.isSearch()) {
        document.getElementById('no_items__no_apps').style.display = 'none';
        document.getElementById('no_items__no_data').style.display = 'block';
        document.getElementById('no_items').style.display = 'block';
        document.getElementById('no_items__new_root_input').focus();
        $$('my_data_panel__right_panel').hide();
        $$('my_data_panel__resizer_2').hide();
        $$('my_data_panel__central_panel').hide();
        if (window.parent === window && !webix.without_header) $$('my_data_panel__resizer_1').hide();
      } else {
        document.getElementById('no_items').style.display = 'none';
        $$('my_data_panel__right_panel').show();
        $$('my_data_panel__resizer_2').show();
        $$('my_data_panel__central_panel').show();
        if (window.parent === window && !webix.without_header) $$('my_data_panel__resizer_1').show();
        if ($$('entity_tree').getFirstId() == null) {
          if (Router.isRoot()) { // root not found
            UI.entityTree.refresh('notfound');
          } else { // nothing found
            UI.entityTree.refresh('nothing');
          }
        }
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

var UILayout = {
  HEADER_HEIGHT: 50 + 2,
  windows: {},
  popups: {}
};

UILayout.windows.addApp = {
    view: 'window',
    id: 'add_app_window',
    width: 400,
    position: 'center',
    modal: true,
    head: STRINGS.NEW_APP_WINDOW,
    on: UIControls.getOnForFormWindow('add_app'),
    body: {
      view: 'form',
      id: 'add_app_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if (!$$('add_app_form').validate()) {
            return;
          }
          // Send request to create new app
          var data = $$('add_app_form').getValues();
          data.path = '';
          data.fields = [];
          Mydataspace.request('apps.create', data, function(res) {
            UIControls.removeSpinnerFromWindow('add_app_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_app_window');

          });
        }
      },
      elements: [
        { view: 'text', id: 'NAME_LABEL_3', label: STRINGS.NAME, required: true, name: 'name', labelWidth: UIHelper.APP_LABEL_WIDTH },
        { view: 'text',
          id: 'SITE_URL_LABEL',
          label: STRINGS.SITE_URL,
          required: true,
          name: 'url',
          labelWidth: UIHelper.APP_LABEL_WIDTH,
          attributes:{ title: STRINGS.SITE_URL_DESCRIPTION }
        },
        UIControls.getSubmitCancelForFormWindow('add_app')
      ]
    }
};

UILayout.windows.addRoot = {
    view: 'window',
    id: 'add_root_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.ADD_ROOT,
    on: UIControls.getOnForFormWindow('add_root'),
    body: {
      view: 'form',
      id: 'add_root_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if (!$$('add_root_form').validate()) {
            return;
          }
          // Send request to create new root entity
          var data = $$('add_root_form').getValues();
          data.path = '';
          data.fields = [];
          Mydataspace.request('entities.create', data, function() {
            $$('add_root_window').hide();
            UIControls.removeSpinnerFromWindow('add_root_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_root_window');
            switch (err.name) {
              case 'SequelizeValidationError':
                if (err.message === 'Validation error: Validation len failed') {
                  var msg = data.root.length > 10 ? 'Too long root name' : 'Too short root name';
                  $$('add_root_form').elements.root.define('invalidMessage', msg);
                  $$('add_root_form').markInvalid('root', true);
                }
                break;
              case 'SequelizeUniqueConstraintError':
                $$('add_root_form').elements.root.define('invalidMessage', 'Name already exists');
                $$('add_root_form').markInvalid('root', true);
                break;
              default:
                UI.error(err);
                break;
            }
          });
        }
      },
      elements: [
        { view: 'text', id: 'NAME_LABEL', label: STRINGS.NAME, required: true, name: 'root', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_root')
      ]
    }
};

UILayout.windows.addEntity = {
    view: 'window',
    id: 'add_entity_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.new_entity,
    on: UIControls.getOnForFormWindow('add_entity'),
    body: {
      view: 'form',
      id: 'add_entity_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if ($$('add_entity_form').validate()) {
            var formData = $$('add_entity_form').getValues();
            var newEntityId = Identity.childId(UI.entityList.getRootId(), formData.name);
            var data = Identity.dataFromId(newEntityId);
            data.fields = [];
            data.othersCan = formData.othersCan;
            Mydataspace.request('entities.create', data, function() {
              $$('add_entity_window').hide();
              UIControls.removeSpinnerFromWindow('add_entity_window');
            }, function(err) {
              UIControls.removeSpinnerFromWindow('add_entity_window');
              if (err.name === 'SequelizeUniqueConstraintError') {
                $$('add_entity_form').elements.name.define('invalidMessage', 'Name already exists');
                $$('add_entity_form').markInvalid('name', true);
              } else {
                UI.error(err);
              }
            });
          }
        }
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_1', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_entity')
      ]
    }
};

UILayout.windows.cloneEntity = {
    view: 'window',
    id: 'clone_entity_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.CLONE_ENTITY,
    on: UIControls.getOnForFormWindow('add_entity'),
    body: {
      view: 'form',
      id: 'clone_entity_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if ($$('clone_entity_form').validate()) {
            var formData = $$('clone_entity_form').getValues();
            var selectedData = Identity.dataFromId(UI.entityForm.selectedId);
            var data = MDSCommon.extend(formData, {
              fields: [],
              sourceRoot: selectedData.root,
              sourcePath: selectedData.path,
              sourceVersion: selectedData.version
            });

            Mydataspace.request('entities.create', data, function() {
              $$('clone_entity_window').hide();
              UIControls.removeSpinnerFromWindow('clone_entity_window');
            }, function(err) {
              UIControls.removeSpinnerFromWindow('clone_entity_window');
              for (var i in err.errors) {
                var e = err.errors[i];
                switch (e.type) {
                  case 'unique violation':
                    if (e.path === 'entities_root_path') {
                      $$('clone_entity_form').elements.name.define('invalidMessage', 'Name already exists');
                      $$('clone_entity_form').markInvalid('name', true);
                    }
                    break;
                }
              }
            });
          }
        }
      },
      elements: [
        { view: 'text', required: true, id: 'CLONE_ROOT_NAME_LABEL', label: STRINGS.CLONE_ROOT_NAME, name: 'root', labelWidth: UIHelper.LABEL_WIDTH },
        { view: 'text', required: true, id: 'CLONE_ENTITY_PATH_LABEL', label: STRINGS.CLONE_ENTITY_PATH, name: 'path', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('clone_entity')
      ]
    }
};

UILayout.windows.addTask = {
    view: 'window',
    id: 'add_task_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.new_task,
    on: UIControls.getOnForFormWindow('add_task'),
    body: {
      view: 'form',
      id: 'add_task_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if ($$('add_task_form').validate()) {
            var formData = $$('add_task_form').getValues();
            var newEntityId = Identity.childId(Identity.rootId(UI.entityList.getRootId()), 'tasks/' + formData.name);
            var data = Identity.dataFromId(newEntityId);
            data.fields = [];
            data.othersCan = formData.othersCan;
            Mydataspace.request('entities.create', data, function() {
              $$('add_task_window').hide();
              UIControls.removeSpinnerFromWindow('add_task_window');
            }, function(err) {
              UIControls.removeSpinnerFromWindow('add_task_window');
              if (err.name === 'SequelizeUniqueConstraintError') {
                $$('add_task_form').elements.name.define('invalidMessage', 'Name already exists');
                $$('add_task_form').markInvalid('name', true);
              } else {
                UI.error(err);
              }
            });
          }
        }
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_7', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_task')
      ]
    }
};

UILayout.windows.addProto = {
    view: 'window',
    id: 'add_proto_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.new_proto,
    on: UIControls.getOnForFormWindow('add_proto'),
    body: {
      view: 'form',
      id: 'add_proto_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if ($$('add_proto_form').validate()) {
            var formData = $$('add_proto_form').getValues();
            var newEntityId = Identity.childId(Identity.rootId(UI.entityList.getRootId()), 'protos/' + formData.name);
            var data = Identity.dataFromId(newEntityId);
            data.fields = [];
            data.othersCan = formData.othersCan;
            Mydataspace.request('entities.create', data, function() {
              $$('add_proto_window').hide();
              UIControls.removeSpinnerFromWindow('add_proto_window');
            }, function(err) {
              UIControls.removeSpinnerFromWindow('add_proto_window');
              if (err.name === 'SequelizeUniqueConstraintError') {
                $$('add_proto_form').elements.name.define('invalidMessage', 'Name already exists');
                $$('add_proto_form').markInvalid('name', true);
              } else {
                UI.error(err);
              }
            });
          }
        }
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_6', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_proto')
      ]
    }
};

UILayout.windows.addResource = {
    view: 'window',
    id: 'add_resource_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.ADD_RESOURCE_WINDOW,
    on: UIControls.getOnForFormWindow('add_resource'),
    body: {
      view: 'form',
      id: 'add_resource_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if ($$('add_resource_form').validate()) {
            var formData = $$('add_resource_form').getValues();
            var newEntityId = Identity.childId(UI.entityList.getRootId(), 'test');
            var data = Identity.dataFromId(newEntityId);
            UI.uploadResource(
              document.getElementById('add_resource_form__file').files[0],
              data.root,
              formData.type,
              function(res) {
                $$('add_resource_window').hide();
                UIControls.removeSpinnerFromWindow('add_resource_window');
                UI.entityList.refresh();
              },
              function(err) {
                UIControls.removeSpinnerFromWindow('add_resource_window');
                if (err.name === 'SequelizeUniqueConstraintError') {
                  $$('add_resource_form').elements.name.define('invalidMessage', 'Name already exists');
                  $$('add_resource_form').markInvalid('name', true);
                } else {
                  UI.error(err);
                }
              });
          }
        }
      },

      elements: [
        {
          cols: [
            { view: 'label',
              id: 'ADD_RESOURCE_FILE',
              required: true,
              label: STRINGS.ADD_RESOURCE_FILE,
              width: UIHelper.LABEL_WIDTH
            },
            {
              template: ' <input type="file" ' +
                        '        id="add_resource_form__file" ' +
                        '        required />',
              css: 'add_resource_form__file_wrap'
            }
          ]
        },
        {
          view: 'combo',
          label: STRINGS.ADD_RESOURCE_TYPE,
          name: 'type',
          value: 'file',
          options: [
            { id: 'avatar', value: STRINGS.AVATAR },
            { id: 'image', value: STRINGS.IMAGE },
            { id: 'file', value: STRINGS.FILE }
          ],
          labelWidth: UIHelper.LABEL_WIDTH
        },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_resource')
      ]
    }
};

UILayout.windows.addField = {
  view: 'window',
  id: 'add_field_window',
  width: 300,
  position: 'center',
  modal: true,
  head: STRINGS.ADD_FIELD,
  on: UIControls.getOnForFormWindow('add_field'),
  body: {
    view: 'form',
    id: 'add_field_form',
    borderless: true,
    on: {
      onSubmit: function() {
        if (!$$('add_field_form').validate()) {
          return;
        }

        UI.entityForm.addField(
          MDSCommon.extend($$('add_field_form').getValues(), { indexed: 'off' }),
          true,
          UIHelper.isProto(UI.entityForm.getSelectedId()));

        setTimeout(function() {
          $$('add_field_window').hide();
        }, 100);
      }
    },

    elements: [
      { view: 'text', required: true, id: 'NAME_LABEL_2', label: STRINGS.NAME, name: 'name' },
      UIControls.getFieldTypeSelectTemplate(),
      { view: 'text', id: 'VALUE_LABEL', label: STRINGS.VALUE, name: 'value' },
      UIControls.getSubmitCancelForFormWindow('add_field', false)
    ],

    rules: {
      name: function(value) { return typeof $$('entity_form__' + value) === 'undefined' },
      value: function(value) {
        var values = $$('add_field_form').getValues();
        var typeInfo = Fields.FIELD_TYPES[values.type];
        return typeof typeInfo !== 'undefined' && typeInfo.isValidValue(value);
      }
    }
  }
};

UILayout.windows.editScript = {
  view: 'window',
  id: 'edit_script_window',
  css: 'edit_script_window',
  head: false,
  left: 0,
  top: UILayout.HEADER_HEIGHT - 2,
  animate: { type: 'flip', subtype: 'vertical' },
  on: {
    onShow: function() {
      $$('edit_script_window').$view.classList.add('animated');
      $$('edit_script_window').$view.classList.add('fadeInUp');

      $$('CLOSE_LABEL').define('hotkey', 'escape');
      var windowWidth =
        $$('admin_panel').$width -
        $$('my_data_panel__right_panel').$width -
        $$('my_data_panel__resizer_2').$width - 2;

      var windowHeight = $$('my_data_panel').$height - 2;

      $$('edit_script_window').define('width', windowWidth);
      $$('edit_script_window').define('height', windowHeight);
      $$('edit_script_window').resize();
      $$('my_data_panel__resizer_2').disable();
    },

    onBlur: function() {
      if (UI.entityForm.editScriptFieldId == null) {
        return;
      }
      $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
    },

    onHide: function() {
      $$('edit_script_window').$view.classList.remove('animated');
      $$('edit_script_window').$view.classList.remove('fadeInUp');
      // $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
      $$('my_data_panel__resizer_2').enable();
    },
  },
  body: {
    rows: [
      { view: 'toolbar',
        id: 'edit_script_window__toolbar',
        elements: [
          { view: 'button',
            type: 'icon',
            icon: 'align-justify',
            width: 70,
            label: 'Text',
            id: 'edit_script_window__toolbar_text_button',
            click: function() {
              $$('edit_script_window__toolbar_text_button').getNode().classList.add('webix_el_button--active');
              $$('edit_script_window__toolbar_md_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_html_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_js_button').getNode().classList.remove('webix_el_button--active');
              const editor = $$('edit_script_window__editor').getEditor();
              editor.getSession().setMode('ace/mode/text');
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'bookmark',
            width: 110,
            label: 'Markdown',
            id: 'edit_script_window__toolbar_md_button',
            click: function() {
              $$('edit_script_window__toolbar_text_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_md_button').getNode().classList.add('webix_el_button--active');
              $$('edit_script_window__toolbar_html_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_js_button').getNode().classList.remove('webix_el_button--active');
              const editor = $$('edit_script_window__editor').getEditor();
              editor.getSession().setMode('ace/mode/markdown');
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'code',
            width: 80,
            label: 'HTML',
            id: 'edit_script_window__toolbar_html_button',
            click: function() {
              $$('edit_script_window__toolbar_text_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_md_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_html_button').getNode().classList.add('webix_el_button--active');
              $$('edit_script_window__toolbar_js_button').getNode().classList.remove('webix_el_button--active');
              const editor = $$('edit_script_window__editor').getEditor();
              editor.getSession().setMode('ace/mode/html');
              editor.getValue();
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'cog',
            width: 110,
            label: 'JavaScript',
            css:   'webix_el_button--active',
            id: 'edit_script_window__toolbar_js_button',
            click: function() {
              $$('edit_script_window__toolbar_text_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_md_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_html_button').getNode().classList.remove('webix_el_button--active');
              $$('edit_script_window__toolbar_js_button').getNode().classList.add('webix_el_button--active');
              const editor = $$('edit_script_window__editor').getEditor();
              editor.getSession().setMode('ace/mode/javascript');
              editor.getValue();
            }
          },
          {},
          { view: 'button',
            type: 'icon',
            icon: 'times',
            id: 'CLOSE_LABEL', label: STRINGS.CLOSE,
            width: 70,
            click: function() {
              $$('edit_script_window').hide();
            }
          }
        ]
      },
      { view: 'ace-editor',
        id: 'edit_script_window__editor',
        mode: 'javascript',
        show_hidden: true,
        on: {
          onReady: function(editor) {
            editor.getSession().setTabSize(2);
            editor.getSession().setUseSoftTabs(true);
            editor.setReadOnly(true);
            editor.getSession().setUseWorker(false);
            editor.commands.addCommand({
              name: 'save',
              bindKey: { win: 'Ctrl-S' },
              exec: function(editor) {
                if (UI.entityForm.editScriptFieldId) {
                  $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
                }
                UI.entityForm.save();
              }
            });
            editor.on('change', function() {
              if (UI.entityForm.editScriptFieldId) {
                $$(UI.entityForm.editScriptFieldId).setValue($$('edit_script_window__editor').getValue());
              }
            });
          }
        }
      }
    ]
  }
};

UILayout.windows.changeVersion = {
  view: 'window',
  id: 'change_version_window',
  width: 700,
  position: 'center',
  modal: true,
  head: STRINGS.switch_default_version_window_title,
  on: {
    onShow: function() {
      // Update dialog title
      var title;
      switch ($$('change_version_window').mode) {
        case 'switch':
          title = STRINGS.switch_default_version_window_title;
          break;
        case 'view':
          title = STRINGS.view_other_version_window_title;
          break;
      }
      $$('change_version_window').getHead().define('template', title);
      $$('change_version_window').getHead().refresh();

      // Load and display data
      Mydataspace.request('entities.getRootVersions', {
        root: Identity.dataFromId(UI.entityList.getRootId()).root
      }).then(function(data) {
        $$('change_version_window__table').clearAll();
        $$('change_version_window__table').parse(data.versions.map(function(version) {
          return MDSCommon.extend(version, { id: version.version });
        }));
      }).catch(function(data) {
        UI.error(data);
      });
    }
  },
  body: {
    rows: [
      { view: 'datatable',
        id: 'change_version_window__table',
        height: 350,
        autowidth: true,
        select: 'row',
        columns: [
          { id: 'version', header: '#', width: 50, sort: 'int' },
          { id: 'createdAt', header: STRINGS.VERSION_CREATED_AT, width: 200 },
          { id: 'versionDescription', header: STRINGS.VERSION_DESCRIPTION, width: 450 }
        ]
      },
      { cols: [
          {},
          { view: 'button',
            value: 'OK',
            type: 'form',
            width: 150,
            click: function() {
              var version = $$('change_version_window__table').getSelectedItem().version;
              var rootId = Identity.rootId(UI.entityList.getRootId());
              switch ($$('change_version_window').mode) {
                case 'switch':
                  UI.entityTree.changeCurrentRootVersion(rootId, version);
                  break;
                case 'view':
                  UI.entityTree.viewRootVersion(rootId, version);
                  break;
              }
              $$('change_version_window').hide();
            }
          },
          { width: 10 },
          { view: 'button',
            id: 'CANCEL_LABEL',
            width: 150,
            value: STRINGS.CANCEL,
            click: function() { $$('change_version_window').hide(); }
          }
        ],
        padding: 17
      }
    ] 
  }
};

UILayout.windows.addVersion = {
    view: 'window',
    id: 'add_version_window',
    width: 450,
    position: 'center',
    modal: true,
    head: STRINGS.ADD_VERSION,
    on: UIControls.getOnForFormWindow('add_version'),
    body: {
      view: 'form',
      id: 'add_version_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if (!$$('add_version_form').validate()) {
            return;
          }
          UI.entityTree.createNewEmptyVersion($$('add_version_form').getValues().versionDescription).then(function() {
            $$('add_version_window').hide();
            UIControls.removeSpinnerFromWindow('add_version_window');
          }).catch(function(err) {
            UI.error(err);
            UIControls.removeSpinnerFromWindow('add_version_window');
          });
        }
      },
      elements: [
        { view: 'text', id: 'VERSION_DESCRIPTION_LABEL', label: STRINGS.VERSION_DESCRIPTION, required: true, name: 'versionDescription', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getSubmitCancelForFormWindow('add_version')
      ]
    }
};

UILayout.popups.fieldIndexed = {
	view: 'popup',
	id: 'entity_form__field_indexed_popup',
    css: 'entity_form__field_indexed_popup',
	width: 180,
	body:{
		view: 'list',
        id: 'entity_form__field_indexed_list',
        class: 'entity_form__field_indexed_list',
        borderless: true,
		data:[
          // { id: 'on', value: 'Search &amp; Order', icon: Fields.FIELD_INDEXED_ICONS['on'] },
          { id: 'fulltext', value: 'Fulltext Search', icon: Fields.FIELD_INDEXED_ICONS['fulltext'] },
          { id: 'off', value: 'None', icon: Fields.FIELD_INDEXED_ICONS['off'] },
		],
		datatype: 'json',
		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        var fieldName = UI.entityForm.currentFieldName;
        var fieldId = 'entity_form__' + fieldName;
        $$(fieldId + '_indexed').setValue(newv);
        $$('entity_form__field_indexed_popup').hide();
				var oldValues = webix.copy($$('entity_form')._values);
				delete oldValues['fields.' + fieldName + '.value'];
        $$('entity_form__' + fieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS[newv]);
        $$('entity_form__' + fieldName + '_indexed_button').refresh();
				$$('entity_form')._values = oldValues;
      }
    }
	}
};

UILayout.popups.fieldType = {
  view: 'popup',
  id: 'entity_form__field_type_popup',
  css: 'entity_form__field_type_popup',
  width: 130,
  body:{
    view: 'list',
    id: 'entity_form__field_type_popup_list',
    class: 'entity_form__field_type_popup_list',
    borderless: true,
    data: Fields.FIELD_TYPE_LIST,
    datatype: 'json',
    template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
    autoheight: true,
    select: true,
        on: {
          onItemClick: function(newv) {
            var fieldName = UI.entityForm.currentFieldName;
            var fieldId = 'entity_form__' + fieldName;
            var fieldValue = $$(fieldId + '_value').getValue();
            $$(fieldId + '_type_button').define('icon', Fields.FIELD_TYPE_ICONS[newv]);
            $$(fieldId + '_type_button').refresh();
            var oldv = $$(fieldId + '_type').getValue();
            $$(fieldId + '_type').setValue(newv);
            $$('entity_form__field_type_popup').hide();
            var oldValues = webix.copy($$('entity_form')._values);
            delete oldValues['fields.' + UI.entityForm.currentFieldName + '.value'];
            if (newv === 'j' || oldv === 'j') {
              webix.ui(
                { view: newv === 'j' ? 'textarea' : 'text',
                  label: fieldName,
                  name: 'fields.' + fieldName + '.value',
                  id: 'entity_form__' + fieldName + '_value',
                  value: fieldValue,
                  labelWidth: UIHelper.LABEL_WIDTH,
                  height: 32,
                  css: 'entity_form__text_label',
                  on: {
                    onFocus: function() {
                      if (newv === 'j') {
                        this.editScriptFieldId = 'entity_form__' + fieldName + '_value';
                        $$('edit_script_window').show();
                      }
                    }
                  }
                },
                $$('entity_form__' + fieldName),
                $$('entity_form__' + fieldName + '_value')
              );
              if (newv === 'j') {
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').disable();
                var fieldIndexed = $$(fieldId + '_indexed').getValue();
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS['fulltext']);
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();
              } else {
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').enable();
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS[fieldIndexed || 'off']);
                $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();
              }
            }
            $$('entity_form')._values = oldValues;
          }
        }
  }
};

UILayout.popups.searchScope = {
  view: 'popup',
  id: 'entity_tree__root_scope_popup',
    css: 'entity_tree__root_scope_popup',
  width: 180,
  body:{
    view: 'list',
        id: 'entity_tree__root_scope_popup_list',
        class: 'entity_tree__root_scope_popup_list',
        borderless: true,
    data:[
          { id: 'user', value: 'Search in Yours', icon: 'user' },
          { id: 'globe', value: 'Search of All', icon: 'globe' },
          { id: 'database', value: 'Root Name', icon: 'database' }
    ],
    datatype: 'json',
    template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
    autoheight: true,
    select: true,
    on: {
      onItemClick: function(newv) {
        if (newv === 'user' && !Mydataspace.isLoggedIn()) {
          $('#signin_modal').modal('show');
          return;
        }
        $$('entity_tree__root_scope_popup').hide();
        $$('entity_tree__root_scope').define('icon', newv);
        $$('entity_tree__root_scope').refresh();
        $('.entity_tree__search input').focus();
      }
    }
  }
};

UILayout.popups.newEntity = {
	view: 'popup',
	id: 'entity_tree__new_entity_popup',
  css: 'admin_context_menu entity_tree__new_entity_popup',
	width: 200,
	body: {
		view: 'list',
    id: 'entity_tree__new_entity_list',
    class: 'entity_tree__new_entity_list',
    borderless: true,
		data: UIControls.getNewEntityPopupData(),
		datatype: 'json',
		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        switch (newv) {
          case 'new_entity':
            $$('add_entity_window').show();
            break;
          case 'new_resource':
            $$('add_resource_window').show();
            break;
          case 'new_task':
            $$('add_task_window').show();
            break;
          case 'new_proto':
            $$('add_proto_window').show();
            break;
          case 'import_wizard':
            // global var openRefineImportEntity
            openRefineImportEntity = Identity.dataFromId(UI.entityTree.getCurrentId());
            $('#import_data_modal').modal('show');
            break;
          case 'import_csv':
            break;
        }
        $$('entity_tree__new_entity_popup').hide();
      }
    }
	}
};

UILayout.popups.newRootVersion = {
	view: 'popup',
	id: 'entity_tree__new_root_version_popup',
  css: 'admin_context_menu entity_tree__new_root_version_popup',
	width: 230,
	body: {
		view: 'list',
    id: 'entity_tree__new_root_version_list',
    class: 'entity_tree__new_root_version_list',
    borderless: true,
		data: UIControls.getChangeVersionPopupData(),
		datatype: 'json',
//		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        switch (newv) {
          case 'new_version':
            $$('add_version_window').show();
            break;
          case 'switch_version':
            //var version = parseInt(prompt("Please enter version number", "Switch Root Version"));
            $$('change_version_window').mode = 'switch';
            $$('change_version_window').show();
            break;
          case 'view_version':
            $$('change_version_window').mode = 'view';
            $$('change_version_window').show();
            break;
          case 'copy_version':
            break;
          case 'import_version':
            break;
          case 'import_version_csv':
            break;
        }
        $$('entity_tree__new_root_version_popup').hide();
      }
    }
	}
};

UILayout.popups.newRoot = {
	view: 'popup',
	id: 'entity_tree__new_root_popup',
  css: 'admin_context_menu entity_tree__new_root_popup',
	width: 150,
	body: {
		view: 'list',
    id: 'entity_tree__new_root_list',
    class: 'entity_tree__new_root_list',
    borderless: true,
		data: [
      { id: 'new_root', value: STRINGS.new_empty_root },
      { id: 'import_wizard', value: STRINGS.import_root }
//      { id: 'import_csv', value: 'Import Root from CSV As Is' }
		],
		datatype: 'json',
//		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        switch (newv) {
          case 'new_root':
            $$('add_root_window').show();
            break;
          case 'import_wizard':
            $('#import_data_modal').modal('show');
            break;
          case 'import_csv':
            break;
        }
        $$('entity_tree__new_root_popup').hide();
      }
    }
	}
};

UILayout.sideMenu =
  {
    view: 'sidemenu',
    id: 'menu',
    width: 200,
    position: 'right',
    state: function(state) {
      state.top = UILayout.HEADER_HEIGHT - 2;
      state.height -= UILayout.HEADER_HEIGHT - 2;
    },
    body: {
      rows: [
        { view: 'template',
          borderless: true,
          id: 'profile',
          css: 'profile',
          template: '<div class="profile__img_wrap"><img class="profile__img" src="#avatar#" /></div>' +
                    '<div class="profile__name">#name#</div>' +
                    '<div class="profile__access_key_wrap" id="profile__access_key_wrap">' +
                      '<a class="profile__access_key_link" href="javascript: void(0)" onclick="return UI.showAccessToken()">' +
                        STRINGS.SHOW_ACCESS_KEY +
                      '</a>' +
                    '</div>',
          data: {
            avatar: '/images/no_avatar.png',
            name: 'No name'
          }
        },
        { view: 'template',
          borderless: true,
          id: 'profile__authorizations',
          css: 'profile__authorizations',
          height: 40,
          template: function(obj) {
            return '<button onclick="Mydataspace.authorizeTasks(\'vk\');" ' +
              'class="profile__authorizations_btn profile__authorizations_btn--vk ' +
              (obj.vk ? 'profile__authorizations_btn--vk--active' : '') +
              '"><i onclick="" class="fa fa-vk"></i></button>';
          },
          data: {}
        },
        { view: 'list',
          id: 'menu__item_list',
          borderless: true,
          scroll: false,
          css: 'menu__item_list',
          template: '<span class="webix_icon fa-#icon#"></span> #value#',
          data:[
            { id: 'data', value: STRINGS.MY_DATA, icon: 'database' },
            { id: 'apps', value: STRINGS.MY_APPS, icon: 'cogs' },
            { id: 'logout', value: STRINGS.SIGN_OUT, icon: 'sign-out' }
          ],
          select: true,
          type: { height: 40 },
          on: {
            onSelectChange: function () {
              switch (this.getSelectedId()) {
                case 'data':
                  UI.pages.setCurrentPage('data');
                  break;
                case 'apps':
                  UI.pages.setCurrentPage('apps');
                  break;
                case 'logout':
                  Mydataspace.logout();
                  break;
                default:
                  // throw new Error('Illegal menu item id');
              }
            }
          }
        }
      ]
    }
  };

UILayout.header =
  { css: 'admin_panel__header',
    cols: [
      { type: 'header' },
      { view: 'button',
        width: 100,
        css: 'menu__language_button menu__language_button--get_started',
        id: 'FEATURES_LABEL',
        label: STRINGS.FEATURES,
        click: function() {
          var currentLang = (localStorage.getItem('language') || 'en').toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/features', '_blank');
        }
      },
      { view: 'button',
        width: 70,
        css: 'menu__language_button',
        id: 'DEMOS_LABEL',
        label: STRINGS.DEMOS,
        click: function() {
          var currentLang = (localStorage.getItem('language') || 'en').toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/demos', '_blank');
        }
      },
      { view: 'button',
        width: 110,
        css: 'menu__language_button',
        id: 'DOCS_LABEL',
        label: STRINGS.DOCS,
        click: function() {
          var currentLang = (localStorage.getItem('language') || 'en').toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/docs', '_blank');
        }
      },
      { width: 10, css: 'menu__spacer' },
      { view: 'button',
        width: 30,
        id: 'menu__language_button_en',
        css: 'menu__language_button ' + (LANGUAGE === 'EN' ? 'menu__language_button--selected' : ''),
        label: 'EN',
        click: function() {
          // localStorage.setItem('language', 'EN');
          UI.updateLanguage('EN');
        }
      },
      { view: 'button',
        width: 30,
        id: 'menu__language_button_ru',
        css: 'menu__language_button ' + (LANGUAGE === 'RU' ? 'menu__language_button--selected' : ''),
        label: 'RU',
        click: function() {
          // localStorage.setItem('language', 'RU');
          UI.updateLanguage('RU');
        }
      },
      { width: 10, css: 'menu__spacer' },
      { view: 'button',
        width: 90,
        id: 'SIGN_IN_LABEL',
        css: 'menu__login_button',
        label: STRINGS.SIGN_IN,
        hidden: UIHelper.isValidJWT(localStorage.getItem('authToken')),
        click: function() {
          $('#signin_modal').modal('show');
        }
      },
      { view: 'icon',
        icon: 'bars',
        hidden: !UIHelper.isValidJWT(localStorage.getItem('authToken')),
        id: 'menu_button',
        css: 'menu_button',
        click: function() {
          if($$('menu').config.hidden) {
            $$('menu').show();
          }
          else
            $$('menu').hide();
        }
      }
    ],
    height: UILayout.HEADER_HEIGHT
  };

UILayout.entityTree =
{ id: 'my_data_panel__left_panel',
  gravity: 0.2,
  hidden: window.parent !== window || webix.without_header,
  rows: [
    { view: 'toolbar',
      elements: [
        { view: 'button',
          type: 'icon',
          icon: 'refresh',
          id: 'REFRESH_LABEL_2', label: STRINGS.REFRESH,
          width: 85,
          click: function() {
            UI.entityTree.refresh();
          }
        },
        { view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ROOT_LABEL', label: STRINGS.ADD_ROOT,
          hidden: true,
          width: 110,
          popup: 'entity_tree__new_root_popup',
//          click: function() {
//            $$('add_root_window').show();
//          }
        },
//        { view: 'button',
//          type: 'icon',
//          icon: 'cloud-upload',
//          //hidden: true,
//          id: 'IMPORT_ROOT_LABEL', label: STRINGS.IMPORT_ROOT_LABEL,
//          width: 35,
//          click: function() {
//            $('#import_data_modal').modal('show');
//          }
//        },
        
        // { view: 'button',
        //   width: 35,
        //   type: 'iconButton',
        //   icon: 'user',
        //   css: 'entity_tree__search_button',
        //   popup: 'entity_tree__root_scope_popup',
        //   id: 'entity_tree__root_scope',
        //   on: {
        //     onItemClick: function() {
        //       // this.currentFieldName = data.name;
        //       // $$('entity_form__field_type_popup_list').select(data.type);
        //     }.bind(this)
        //   }
        // },
        // { view: 'search',
        //   id: 'entity_tree__search',
        //   css: 'entity_tree__search',
        //   align: 'center',
        //   icon: 'close',
        //   placeholder: STRINGS.SEARCH_BY_ROOTS,
        //   on: {
        //     onAfterRender: function() {
        //
        //     },
        //     onTimedKeyPress: function() {
        //       UI.entityTree.updateRouteBySearch();
        //     }
        //   }
        // }
      ]
    },
    { view: 'tree',
      id: 'entity_tree',
      css: 'entity_tree',
      gravity: 0.4,
      select: true,
      template:function(obj, common) {
        var path = Identity.dataFromId(obj.id).path;
        var isTopLevelEntity = path.indexOf('/') < 0 && UIConstants.SYSTEM_PATHS.indexOf(path) < 0;
        if (path === '') { // root
          var ava = MDSCommon.findValueByName(obj.associatedData.fields, 'avatar');
          var name = MDSCommon.findValueByName(obj.associatedData.fields, 'name') || obj.value;
          var description = MDSCommon.findValueByName(obj.associatedData.fields, 'name') ? obj.associatedData.root : null;
          var avatarURL = MDSCommon.isBlank(ava) ? '/images/icons/root.svg' :  Mydataspace.options.cdnURL + '/avatars/sm/' + ava + '.png';
          var folder =
            '<div class="webix_tree_folder_open entity_tree__root_icon_wrap">' +
              '<img class="entity_tree__root_icon" src="' + avatarURL + '" />' +
            '</div>';

          var rootNameClass = 'entity_tree__root_name';
          if (MDSCommon.isBlank(description)) {
            rootNameClass += ' entity_tree__root_name--without-description';
          }
          return common.icon(obj, common) +
                 folder +
                 '<div class="entity_tree__root_wrap">' +
                   '<span class="entity_tree__root">' +
                     '<div class="' + rootNameClass + '">' + name + '</div>' +
                     (MDSCommon.isBlank(description) ? '' : '<div class="entity_tree__root_description">' + description + '</div>') +
                   '</span>' +
                 '</div>';
        }

        var icon = UIHelper.getIconByPath(path,
                                          obj.$count === 0,
                                          obj.open);
        return common.icon(obj, common) +
               '<div class="webix_tree_folder_open fa fa-' + icon + '"></div>' +
               '<span class="webix_tree_item__name ' + (isTopLevelEntity ? ' webix_tree_item__name--top' : '') + '">' + obj.value + '</span>';
      },
      on: {
        onAfterLoad: function() {
          if (!UI.entityTree.getCurrentId()) {
            UI.entityTree.setCurrentIdToFirst();
          }
          $$('entity_tree').select(UI.entityTree.getCurrentId());
          $$('entity_tree').open(UI.entityTree.getCurrentId());
        },
        onBeforeOpen: function(id) {
          UI.entityTree.resolveChildren(id);
        },
        onSelectChange: function(ids) {
          var id = ids[0];
          if (id.endsWith(UIHelper.ENTITY_TREE_SHOW_MORE_ID)) {
            $$('entity_tree').select(UI.entityTree.getCurrentId());
          } else {
            UI.entityTree.setCurrentId(id);
            UI.entityList.setRootId(id);
            UI.entityForm.setSelectedId(id);
          }
        },
        onBeforeSelect: function(id, selection) {
          // Request and add more items if "Show More" clicked
          if (id.endsWith(UIHelper.ENTITY_TREE_SHOW_MORE_ID)) {
            UI.entityTree.showMore(Identity.parentId(id));
          }
        }
      }
    }
  ]
};

UILayout.entityList =
{ id: 'my_data_panel__central_panel',
  gravity: 0.4,
  rows: [
    { view: 'toolbar',
      cols: [
        { view: 'button',
          type: 'icon',
          icon: 'refresh',
          id: 'REFRESH_LABEL', label: STRINGS.REFRESH,
          width: 85,
          click: function() { UI.entityList.refresh(); }
        },
        { view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ENTITY_LABEL', label: STRINGS.ADD_ENTITY,
          width: 70,
          popup: 'entity_tree__new_entity_popup'
        },
        { view: 'button',
          type: 'icon',
          icon: 'clone',
          id: 'NEW_VERSION_LABEL', label: STRINGS.NEW_VERSION,
          width: 110,
          popup: 'entity_tree__new_root_version_popup'
        },
        { view: 'search',
          id: 'entity_list__search',
          css: 'entity_list__search',
          align: 'center',
          icon: 'search',
          placeholder: STRINGS.SEARCH_BY_ENTITIES,
          on: {
            onTimedKeyPress: function(code, e) {
              UI.entityList.refresh();
            },
            onSearchIconClick: function() {
              // $$('entity_list__search').setValue('');
              // UI.entityList.refresh();
            }
          }
        }
      ]
    },
    { view: 'list',
      id: 'entity_list',
      select: true,
      template: function(obj) {
        var path = Identity.dataFromId(obj.id).path;
        var isTopLevelEntity = path.indexOf('/') < 0 && UIConstants.SYSTEM_PATHS.indexOf(path) < 0;
        var icon =
          UIHelper.getIconByPath(path,
                                 obj.count === 0,
                                 false);
        return (obj.id.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID) ? '' :
                  '<div class="entity_list__item_icon fa fa-' + icon + '"></div>') +
               '<div class="entity_list__item">' +
               '<div class="entity_list__item_name' + (isTopLevelEntity ? ' entity_list__item_name--top' : '') + '">' + obj.value + '</div>' +
               (obj.count == null ? '' :
                 '<div class="entity_list__item_count">' + obj.count + '</div>' +
                 '<div class="entity_list__item_count_prefix fa fa-copy"></div>') +
               '</div>';
      },
      on: {
        onBeforeSelect: function(id, selection) {
          if (id.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID)) {
            UI.entityList.showMore();
          } else {
            UI.entityList.setCurrentId(id);
          }
        },
        onSelectChange: function (ids) {
          var id = ids[0];
          if (id.endsWith(UIHelper.ENTITY_LIST_SHOW_MORE_ID)) {
            $$('entity_list').select(UI.entityList.getCurrentId());
          } else {
            UI.entityForm.setSelectedId(id);
          }
        },
        onItemDblClick: function(id) {
          var parentId = Identity.parentId(id);
          if (id === 'root' || parentId === 'root') {
            return;
          }

          if (id === UI.entityTree.getCurrentId()) {
            $$('entity_tree').select(parentId);
          } else {
            UI.entityTree.resolveChildren(parentId).then(function() {
              $$('entity_tree').open(parentId);
              $$('entity_tree').select(id);
            });
          }
        }
      }
    }
  ]
};

UILayout.entityForm =
{ id: 'my_data_panel__right_panel',
  gravity: 0.4,
  rows: [
  { view: 'toolbar',
    id: 'entity_form__toolbar',
    cols: [
      { view: 'button',
        type: 'icon',
        icon: 'refresh',
        id: 'REFRESH_ENTITY_LABEL', label: STRINGS.REFRESH_ENTITY,
        width: 80,
        click: function() {
          UI.entityForm.refresh();
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'save',
        id: 'SAVE_ENTITY_LABEL',
        label: STRINGS.SAVE_ENTITY,
        hidden: true,
        width: 65,
        click: function() {
          UI.entityForm.save();
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'plus',
        id: 'ADD_FIELD_LABEL', label: STRINGS.ADD_FIELD,
        hidden: true,
        width: 100,
        click: function() {
          $$('add_field_window').show();
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'bug',
        id: 'RUN_SCRIPT_LABEL', label: STRINGS.RUN_SCRIPT,
        hidden: true,
        width: 80,
        click: function() {
          UIHelper.popupCenter('/run-script.html', 'Run Script', 600, 400);
        }
      },
      {},
      // { view: 'button',
      //   type: 'icon',
      //   icon: 'copy',
      //   id: 'CLONE_ENTITY_LABEL',
      //   label: STRINGS.CLONE_ENTITY,
      //   width: 80,
      //   click: function() {
      //     UI.entityForm.clone();
      //   }
      // },
      { view: 'button',
        type: 'icon',
        icon: 'remove',
        id: 'DELETE_ENTITY_SHORT_LABEL', label: STRINGS.DELETE_ENTITY_SHORT,
        width: 80,
        click: function() {
          webix.confirm({
            title: STRINGS.DELETE_ENTITY,
            text: STRINGS.REALLY_DELETE,
            ok: STRINGS.YES,
            cancel: STRINGS.NO,
            callback: function(result) {
              if (result) {
                UI.entityForm.delete();
              }
            }
          });
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'pencil-square-o',
        id: 'EDIT_ENTITY_LABEL',
        label: STRINGS.EDIT_ENTITY,
        width: 60,
        click: function() {
          var url = UIHelper.getWizardUrlById(UI.entityForm.getSelectedId());
          $.ajax({
            url: url,
            type: 'HEAD'
          }).then(function() {
            $('#wizard_modal__frame').attr('src', url);
            $('#wizard_modal').modal('show');
          }).catch(function() {
            UI.entityForm.setEditing(true);
            UI.entityForm.refresh();
          });
        }
      },
      { view: 'button',
        type: 'icon',
        icon: 'eye',
        id: 'CANCEL_ENTITY_LABEL', label: STRINGS.CANCEL_ENTITY,
        width: 60,
        hidden: true,
        click: function() {
          UI.entityForm.setEditing(false);
          UI.entityForm.refresh();
        }
      }
    ]
  },
  {
    id: 'entity_view',
    template: '<div id="view" class="view"><div class="view__loading"></div></div>',
    scroll: true,
    css: 'entity_view'
  },
  { view: 'form',
    id: 'entity_form',
    css: 'entity_form',
    complexData: true,
    scroll: true,
    hidden: true,
    elements: [
      { view: 'text',
        id: 'NAME_LABEL_5',
        label: STRINGS.NAME,
        name: 'name',
        labelWidth: UIHelper.LABEL_WIDTH,
        css: 'entity_form__first_input'
      },
      UIControls.getEntityTypeSelectTemplate(),
      { view: 'text',
        id: 'CHILD_PROTO_LABEL',
        label: STRINGS.CHILD_PROTO,
        name: 'childPrototype',
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { view: 'text',
        id: 'MAX_NUMBER_OF_CHILDREN_LABEL',
        label: STRINGS.MAX_NUMBER_OF_CHILDREN,
        name: 'maxNumberOfChildren',
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { view: 'checkbox',
        id: 'PROTO_IS_FIXED_LABEL',
        label: STRINGS.PROTO_IS_FIXED,
        name: 'isFixed',
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { id: 'entity_form__fields_title',
        template: STRINGS.FIELDS,
        type: 'section',
        css: 'entity_form__fields_title'
      },
      { view: 'label',
        id: 'NO_FIELDS_LABEL',
        label: STRINGS.NO_FIELDS,
        align: 'center'
      }
    ],
    on: {
      onChange: function() { UI.entityForm.updateToolbar() }
    }
  }
]};

//
// My Apps Page
//
UILayout.apps =
{ id: 'my_apps_panel',
  height: window.innerHeight - UILayout.HEADER_HEIGHT,
  hidden: true,
  cols: [
    // List of apps
    { rows: [
        { view: 'toolbar',
          elements: [
            { view: 'button',
              type: 'icon',
              icon: 'plus',
              id: 'NEW_APP_LABEL', label: STRINGS.NEW_APP,
              width: 120,
              click: function() {
                $$('add_app_window').show();
              }
            },
            { view: 'button',
              type: 'icon',
              icon: 'refresh',
              id: 'REFRESH_LABEL_1', label: STRINGS.REFRESH,
              width: 100,
              click: function() {
                UI.pages.refreshPage('apps');
              }
            },
            {}
          ]
        },
        { view: 'list',
          id: 'app_list',
          select: true,
          template: '<div>#value#</div>',
          on: {
            onSelectChange: function (ids) {
              $$('app_form').disable();
              Mydataspace.request(
                'apps.get',
                { clientId: ids[0] }, function() {
                  $$('app_form').enable();
                }, function(err) {
                  $$('app_form').enable();
                  UI.error(err);
                });
            }
          }
        }
      ]
    },
    {
      view: 'resizer',
      id: 'my_apps_panel__resizer',
      disabled: true
    },
    // Selected app edit
    { id: 'my_apps_panel__right_panel',
      rows: [
      { view: 'toolbar',
        cols: [
          { view: 'button',
            type: 'icon',
            icon: 'save',
            id: 'SAVE_APP_LABEL', label: STRINGS.SAVE_APP,
            width: 80,
            click: function() {
              UI.appForm_save();
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'refresh',
            id: 'REFRESH_APP_LABEL', label: STRINGS.REFRESH_APP,
            width: 100,
            click: function() {
              $$('app_form').disable();
              Mydataspace.request(
                'apps.get',
                { clientId: $$('app_list').getSelectedId() }, function() {
                  $$('app_form').enable();
                }, function(err) {
                  $$('app_form').enable();
                  UI.error(err);
                });
            }
          },
          {},
          { view: 'button',
            type: 'icon',
            icon: 'remove',
            id: 'DELETE_LABEL', label: STRINGS.DELETE,
            width: 80,
            click: function() {
              webix.confirm({
                title: STRINGS.DELETE_APP,
                text: STRINGS.REALLY_DELETE_APP,
                ok: STRINGS.YES,
                cancel: STRINGS.NO  ,
                callback: function(result) {
                  if (result) {
                    $$('app_form').disable();
                    Mydataspace.request(
                      'apps.delete',
                      { clientId: $$('app_list').getSelectedId() });
                  }
                }
              });
            }
          }
        ]
      },
      { view: 'form',
        id: 'app_form',
        complexData: true,
        scroll: true,
        elements: [
          { view: 'text', id: 'NAME_LABEL_4', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.APP_LABEL_WIDTH },
          { view: 'textarea', id: 'DESCRIPTION_LABEL', label: STRINGS.DESCRIPTION, height: 100, name: 'description', labelWidth: UIHelper.APP_LABEL_WIDTH },
          // { view: 'text', id: 'LOGO_URL_LABEL', label: STRINGS.LOGO_URL, name: 'logoURL', labelWidth: UIHelper.LABEL_WIDTH },
          { view: 'text', id: 'SITE_URL_LABEL_1', label: STRINGS.SITE_URL, name: 'url', labelWidth: UIHelper.APP_LABEL_WIDTH },
          { cols: [
              { width: UIHelper.APP_LABEL_WIDTH },
              {
                template: STRINGS.SITE_URL_DESCRIPTION,
                borderless: true,
                autoheight: true
              }
            ],
            css: 'webix_text_description'
          },
          { view: 'text', id: 'CLIENT_ID_LABEL', css: 'webix_text_readonly', label: STRINGS.CLIENT_ID, name: 'clientId', readonly: true, labelWidth: UIHelper.APP_LABEL_WIDTH },
          { cols: [
            { width: UIHelper.APP_LABEL_WIDTH },
            {
              template: STRINGS.CLIENT_ID_DESCRIPTION,
              borderless: true,
              autoheight: true
            }
          ],
            css: 'webix_text_description'
          },
        ],
        on: {
          onChange: function() { UI.appForm_updateToolbar() }
        }
      }
    ]}
  ]
};

UI = {

  /**
   * @type {EntityForm}
   */
  entityForm: new EntityForm(),

  entityList: new EntityList(),

  entityTree: new EntityTree(),

  pages: new Pages(),

  VISIBLE_ON_SMALL_SCREENS: [
    'SIGN_OUT_LABEL'
  ],

  updateLanguage: function(newLanguage) {
    var currentLang;
    if (newLanguage) {
      currentLang = newLanguage.toUpperCase();
      if (window.localStorage) {
        window.localStorage.setItem('language', currentLang);
      }
    } else {
      var languageMatch = window.location.pathname.match(/^\/(\w\w)(\/.*)?$/);
      if (languageMatch) {
        currentLang = languageMatch[1].toUpperCase();
      } else {
        currentLang = (window.localStorage && window.localStorage.getItem('language')) || 'EN';
      }
    }

    var strings = STRINGS_ON_DIFFERENT_LANGUAGES[currentLang];

    // Language switcher

    for (var lang in STRINGS_ON_DIFFERENT_LANGUAGES) {
      var langButton = $$('menu__language_button_' + lang.toLowerCase());
      if (lang === currentLang) {
        webix.html.addCss(langButton.getNode(), 'menu__language_button--selected');
      } else {
        webix.html.removeCss(langButton.getNode(), 'menu__language_button--selected');
      }
    }

    // Labels

    for (var key in strings) {

      // Must me in upper case
      if (key !== key.toUpperCase()) {
        continue;
      }

      // Value must be string
      if (typeof strings[key] !== 'string') {
        continue;
      }

      var label = $$(key + '_LABEL');
      if (label == null) {
        continue;
      }

      var i = 1;
      while (label != null) {
        var leftPart = strings[key].split('<span')[0];
        var rightPartIndex = label.data.label.indexOf('<span');
        var rightPart = rightPartIndex >= 0 ? label.data.label.substring(rightPartIndex) : '';
        label.define('label', leftPart + rightPart);
        label.refresh();
        label = $$(key + '_LABEL_' + i);
        i++;
      }
    }

    // Side Menu
    var menuItemList = $$('menu__item_list');
    var menuItemListSelectedId = menuItemList.getSelectedId();
    var data = [
      { id: 'data', value: strings.MY_DATA, icon: 'database' },
      { id: 'apps', value: strings.MY_APPS, icon: 'cogs' },
      { id: 'logout', value: strings.SIGN_OUT, icon: 'sign-out' }
    ];
    menuItemList.clearAll();
    for (var i in data) {
      menuItemList.add(data[i]);
    }
    menuItemList.select(menuItemListSelectedId);


    // Dialogs
    var dialogs = ['ADD_ROOT', 'ADD_ENTITY', 'ADD_FIELD', 'ADD_VERSION'];
    for (var i in dialogs) {
      var dialogId = dialogs[i];
      var dialog = $$(dialogId.toLowerCase() + '_window');
      dialog.getHead().define('template', strings[dialogId]);
      dialog.getHead().refresh();
      $$(dialogId.toLowerCase() + '_window__create_button').setValue(strings.CREATE);
      $$(dialogId.toLowerCase() + '_window__cancel_button').setValue(strings.CANCEL);
    }

    // Comboboxes

    // Others

    $$('entity_form__fields_title').define('template', strings.FIELDS);
    $$('entity_form__fields_title').refresh();

    $$('entity_list__search').define('placeholder', strings.SEARCH);
    $$('entity_list__search').refresh();

    // Override URL

    var a = document.createElement('a');
    a.href = window.location.href;
    var pathname = a.pathname.indexOf('/') === 0 ? a.pathname.substring(1) : a.pathname;
    var index = pathname.indexOf('/');
    if (index < 0) {
      index = pathname.length;
    }
    var firstPart = pathname.substring(0, index);
    if (!(firstPart.toUpperCase() in STRINGS_ON_DIFFERENT_LANGUAGES)) {
      index = 0;
    }

    var newLang = currentLang.toLowerCase() === 'en' ? '' : currentLang.toLowerCase();
    var pathWithoutLanguage = pathname.substring(index);
    a.pathname = newLang === '' ? pathWithoutLanguage : '/' + newLang + pathWithoutLanguage;
    if (a.pathname[a.pathname.length - 1] !== '/') {
      a.pathname += '/';
    }
    history.replaceState(
      {},
      document.getElementsByTagName("title")[0].innerHTML,
      a.href);

    // Change logo link
    document.getElementById('logo_link').href = '/' + newLang;

    // No items
    for (var no_item_id in strings.no_items) {
      var noItemsHTML;
      if (Array.isArray(strings.no_items[no_item_id])) {
        noItemsHTML = '<ul class="no_items__notice_list">';
        for (var i in strings.no_items[no_item_id]) {
          noItemsHTML += '<li>' + strings.no_items[no_item_id][i] + '</li>';
        }
        noItemsHTML += '</ul>';
      } else {
        noItemsHTML = strings.no_items[no_item_id];
      }
      document.getElementById(no_item_id).innerHTML = noItemsHTML;
    }
  },

  /**
   * Notify user about error.
   * @param err Object in format:
   *            { name: 'Exception name', message: 'Error message' }
   *            Error object can also contains next fields:
   *            - errors - array of errors if several errors happens.
   */
  error: function(err) {
    switch (err.name) {
      case 'NotAuthorizedErr':
      case 'NotAuthorized':
        break;
      default:
        webix.message({ type: 'error', text: err.message || err.name });
        break;
    }
    console.error(err);
  },

  refresh: function() {
    Mydataspace.emit('users.getMyProfile', {});
    UI.pages.refreshPage('apps', true);
    UI.pages.refreshPage('data', true);
  },

  /**
   * Handler of upload resource-file event for file input.
   * @param fileInput Input file
   * @param root Root for resource
   * @param type Type of resource - avatar, image or file
   * @param done Success upload feedback
   * @param fail Unsuccess upload feedback
   */
  uploadResource: function(fileInput, root, type, done, fail) {
    var formData = new FormData();
    if ((type === 'avatar' || type === 'image') && !fileInput.type.match('image.*')) {
      alert('Only images');
      return;
    }
    formData.append('root', root);
    formData.append('type', type);
    formData.append('file', fileInput);
    $.ajax({
      url: Mydataspace.options.apiURL + '/v1/entities/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      cache: false,
      headers: {
        authorization: 'Bearer ' + localStorage.getItem('authToken')
      }
    }).done(done).fail(fail);
  },

  //
  // Apps
  //
  refreshApps: function() {
    $$('app_list').disable();
    Mydataspace.request('apps.getAll', {}, function() {
      $$('app_list').enable();
    }, function(err) {
      $$('app_list').enable();
      UI.error(err);
    });
  },

  appForm_save: function() {
    $$('app_form').disable();
    Mydataspace.request('apps.change', $$('app_form').getValues(), function() {
      $$('app_form').enable();
    }, function(err) {
      $$('app_form').enable();
      UI.error(err);
    });
  },

  appForm_updateToolbar: function() {
    if (!$$('app_form').isDirty()) {
      $$('SAVE_APP_LABEL').disable();
    } else {
      $$('SAVE_APP_LABEL').enable();
    }
  },

  appForm_setClean: function() {
    $$('app_form').setDirty(false);
    UI.appForm_updateToolbar();
    $$('app_form').enable();
  },

  appForm_setData: function(data) {
    $$('app_form').setValues(data);
    UI.appForm_setClean();
  },

  initConnection: function(withHeader) {
    Mydataspace.on('login', function() {
      if (isEmptyPathnameIgnoreLanguage(window.location.pathname)) {
        document.getElementById('bootstrap').style.display = 'none';
        document.getElementById('webix').style.display = 'block';
      }
      adminPanel_startWaiting(2000);
      UI.updateSizes();
      UI.refresh();
      if (withHeader) {
        $$('SIGN_IN_LABEL').hide();
        $$('menu_button').show();
      }
      $('#signin_modal').modal('hide');
      UI.entityTree.setReadOnly(false);
    });

    Mydataspace.on('logout', function() {
      if (!UIHelper.isViewOnly()) {
        document.getElementById('bootstrap').style.display = 'block';
        document.getElementById('webix').style.display = 'none';
      }
      document.getElementById('no_items').style.display = 'none';
      if (withHeader) {
        $$('menu').hide();
        $$('SIGN_IN_LABEL').show();
        $$('menu_button').hide();
      }
      UI.entityTree.setReadOnly(true);
    });

    UI.entityForm.listen();
    UI.entityList.listen();
    UI.entityTree.listen();

    Mydataspace.on('users.getMyProfile.res', function(data) {
      if (MDSCommon.isBlank(data['avatar'])) {
        data['avatar'] = '/images/no_avatar.png';
      }
      $$('profile').setValues(data);
      $$('profile__authorizations').setValues(data);
    });

    Mydataspace.on('entities.create.res', function() {
      setTimeout(function() {
        UI.pages.updatePageState('data');
      }, 10);
    });

    Mydataspace.on('entities.delete.res', function() {
      setTimeout(function() {
        UI.pages.updatePageState('data');
      }, 10);
    });

    Mydataspace.on('entities.getMyRoots.res', function() {
      setTimeout(function() {
        UI.pages.updatePageState('data');
      }, 10);
    });

    Mydataspace.on('apps.create.res', function(data) {
      $$('add_app_window').hide();
      $$('app_list').add({
        id: data.clientId,
        value: data.name
      });
      UI.pages.updatePageState('apps');
      $$('app_list').select(data.clientId);
    });

    Mydataspace.on('apps.change.res', function(data) {
      $$('app_form').setValues(data);
      $$('app_form').setDirty(false);
      UI.appForm_setData(data);
    });

    Mydataspace.on('apps.delete.res', function(data) {
      var nextId = $$('app_list').getPrevId(data.clientId) || $$('app_list').getNextId(data.clientId);
      if (nextId != null) {
        $$('app_list').select(nextId);
      }
      $$('app_list').remove(data.clientId);
      UI.pages.updatePageState('apps');
    });

    Mydataspace.on('apps.get.res', function(data) {
      UI.appForm_setData(data);
    });

    Mydataspace.on('apps.getAll.res', function(data) {
      var items = data.map(function(x) {
        return {
          id: x.clientId,
          value: x.name
        };
      });
      $$('app_list').clearAll();
      for (var i in items) {
        $$('app_list').add(items[i], -1);
      }
      var firstId = $$('app_list').getFirstId();
      if (firstId !== null) {
        $$('app_list').select(firstId);
      }
      $$('app_list').enable();
      UI.pages.updatePageState('apps');
    });

    Mydataspace.on('apps.err', UI.error);
    Mydataspace.on('entities.err', UI.error);


    Mydataspace.on('tasksAuthorize', function(data) {
      switch (data.provider) {
        case 'vk/tasks':
          var currentData = MDSCommon.copy($$('profile__authorizations').data);
          currentData.vk = data.result;
          $$('profile__authorizations').define('data', currentData);
          $$('profile__authorizations').refresh();
          break;
      }
    });
  },

  /**
   * Initialize UI only once!
   */
  rendered: false,

  render: function(withHeader) {
    if (UI.rendered) {
      return;
    }
    UI.rendered = true;

    //
    // Communication with popup window of script runner.
    //
    window.addEventListener('message', function(e) {
      if (e.data.message === 'getScripts') {
        var fields = Fields.expandFields($$('entity_form').getValues().fields);
        if (typeof fields === 'undefined') {
          fields = {};
        }
        var values = Object.keys(fields).map(function(key) { return fields[key]; });
        values.sort(function(a, b) {
          if (a.type === 'j' && b.type !== 'j') {
            return 1;
          } else if (a.type !== 'j' && b.type === 'j') {
            return -1;
          } else if (a.type === 'j' && b.type === 'j') {
            if (a.name === 'main.js') {
              return 1;
            } else if (b.name === 'main.js') {
              return -1;
            }
            return 0;
          }
          return 0;
        });
        e.source.postMessage(MDSCommon.extend(Identity.dataFromId(UI.entityForm.selectedId), { message: 'fields', fields: values }), '*');
      }
    });


    //
    //
    //
    webix.ui(UILayout.popups.fieldIndexed);
    webix.ui(UILayout.popups.fieldType);
    webix.ui(UILayout.popups.searchScope);
    webix.ui(UILayout.popups.newRoot);
    webix.ui(UILayout.popups.newEntity);
    webix.ui(UILayout.popups.newRootVersion);


    webix.ui(UILayout.windows.editScript);
    webix.ui(UILayout.windows.addRoot);
    webix.ui(UILayout.windows.addEntity);
    webix.ui(UILayout.windows.cloneEntity);
    webix.ui(UILayout.windows.addTask);
    webix.ui(UILayout.windows.addProto);
    webix.ui(UILayout.windows.addResource);
    webix.ui(UILayout.windows.addField);
    webix.ui(UILayout.windows.addApp);
    webix.ui(UILayout.windows.changeVersion);
    webix.ui(UILayout.windows.addVersion);
    webix.ui(UILayout.sideMenu);

    //
    // Admin panel
    //
    var rows = [];
    if (withHeader) {
      rows.push(UILayout.header);
    }
    rows.push(UILayout.apps);


    var dataPanels = [];
    dataPanels.push(UILayout.entityTree);

    if (window.parent === window && !webix.without_header) {
      dataPanels.push({
        id: 'my_data_panel__resizer_1',
        view: 'resizer'
      });
    }

    dataPanels.push(UILayout.entityList);
    dataPanels.push({
      id: 'my_data_panel__resizer_2',
      view: 'resizer'
    });
    dataPanels.push(UILayout.entityForm);
    rows.push({ id: 'my_data_panel',
      height: window.innerHeight - 46,
      cols: dataPanels
    });


    webix.ui({
      id: 'admin_panel',
      container: 'admin_panel',
      height: webix.without_header ? window.innerHeight - (50 + 85) : window.innerHeight,
      rows: rows
    });

    UI.updateSizes();

    webix.event(window, 'resize', function(e) {
      UI.updateSizes();
    });

    window.addEventListener('error', function (e) {
      UI.error(e.error.message);
      return false;
    });

    function updateTreeSearchScope() {
      // if (Router.isRoot() || Router.isFilterByName()) {
      //   $$('entity_tree__root_scope').define('icon', 'database');
      //   $$('entity_tree__search').setValue(Router.getSearch(true));
      // } else if ((Router.isEmpty() || Router.isMe())) {
      //   $$('entity_tree__root_scope').define('icon', 'user');
      //   $$('entity_tree__search').setValue(Router.getSearch());
      // } else {
      //   $$('entity_tree__root_scope').define('icon', 'globe');
      //   $$('entity_tree__search').setValue(Router.getSearch());
      // }
      // $$('entity_tree__root_scope').refresh();
    }

    updateTreeSearchScope();

    $(window).on('hashchange', function() {
      UI.pages.refreshPage('data', true);
      updateTreeSearchScope();
    });

    if (withHeader) {
      UI.updateLanguage();
    }
  },

  updateSizes: function() {

    var height = webix.without_header ? window.innerHeight - (50 + 85) : window.innerHeight;
    $$('admin_panel').define({
      width: window.innerWidth,
      height: height
    });

    $$('my_data_panel').define({
      height: webix.without_header ? window.innerHeight - (50 + 85) : window.innerHeight - UILayout.HEADER_HEIGHT + 2
    });

    $$('edit_script_window').define({
      height: $$('my_data_panel__resizer_2').$height
    });
    $$('admin_panel').resize();
    $$('admin_panel').resize();
    $$('edit_script_window').resize();
  },

  showAccessToken: function() {
    Mydataspace.request('users.getMyAccessToken', {}, function(data) {
      document.getElementById('profile__access_key_wrap').innerHTML = '<div class="profile__access_key">' + data.accessToken + '</div>';
    }, function(err) {

    });
  },

  deleteEntity: function(entityId) {

  }
};

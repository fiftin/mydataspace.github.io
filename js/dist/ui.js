webix.protoUI({
  name: "ace-editor",
  defaults: {
    mode: "javascript",
    theme: "chrome"
  },
  $init: function (config) {
    this.$ready.push(this._render_cm_editor);
  },

  _render_cm_editor: function () {
    webix.require([
      "ace/src-noconflict/ace.js"
    ], this._render_when_ready, this);
  },

  _render_when_ready: function () {
    var basePath = webix.codebase + "ace/src-noconflict/";

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

    if (this.config.theme)
      this.editor.setTheme("ace/theme/" + this.config.theme);
    if (this.config.mode)
      this.editor.getSession().setMode("ace/mode/" + this.config.mode);
    if (this.config.value)
      this.setValue(this.config.value);
    if (this._focus_await)
      this.focus();

    this.editor.navigateFileStart();
    this.callEvent("onReady", [this.editor]);
  },

  setValue: function (value) {
    if (!value && value !== 0)
      value = "";

    this.config.value = value;
    if (this.editor) {
      this.editor.setValue(value, -1);
    }
  },

  getValue: function () {
    return this.editor ? this.editor.getValue() : this.config.value;
  },

  focus: function () {
    this._focus_await = true;
    if (this.editor)
      this.editor.focus();
  },

  getEditor: function () {
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
        case 1:
          if (parts[0].length <= 2) {
            throw new Error('Unknown error');
          }
          return parts[0];
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
      var partsObj = Router.getCommonSearchParts();
      if (partsObj == null) {
        return '';
      }
      return partsObj.search.replace(/\*/g, '');
    }
  },

  isMe: function() {
    if (Router.isRoot()) {
      return false;
    }
    var parts = Router.getCommonSearchParts();
    return parts == null || parts.user === 'me';
  },

  getNewRootSkeleton: function () {
    var m = (Router.window.location.hash || '').match(/new_root=([\w-]+)/);
    if (m) {
      return m[1];
    }
  },

  clear: function() {
    history.replaceState({}, document.title, '.');
  }
};

UIConstants = {
	ENTITY_ICONS: {
		'root': 'database',
		'protos': 'cubes',
		'proto': 'cube',
		'tasks': 'tasks',
		'task': 'file-code-o',
		'logs': 'history',
		'log': 'file-movie-o',
		'resources': 'files-o',
		'resource': 'file-image-o',
		'processes': 'cogs',
		'process': 'cog',
		'likes': 'heart',
		'like': 'heart-o',
		'comments': 'comments',
		'comment': 'comment',
    'website': 'globe',
    'wizards': 'magic',
    'wizard': 'magic',
    'dev': 'keyboard-o',
    'production': 'industry',
    'generators': 'asterisk',
    'generator': 'asterisk',
    'cache': 'clock-o',
    'migration': 'sign-out',
    'includes': 'puzzle-piece',
    'scss': 'paint-brush',
    'public_html': 'code',
    'data': 'database',
    'statistics': 'bar-chart'
	},

	ROOT_FIELDS: [
    'avatar',
    'name',
    'description',
    'websiteURL',
    'tags',
    'country',
    'language',
    'category',
    'readme',
    'domain',
    'license',
    'licenseURL',
    'licenseText'
  ],

  ROOT_FIELDS_TYPES: {
    avatar:         's',
    name:           's',
    tags:           's',
    websiteURL:     'u',
    description:    's',
    country:        's',
    language:       's',
    category:       's',
    readme:         'j',
    datasource:     's',
    datasourceURL:  'u',
    license:        's',
    licenseText:    'j',
    licenseURL:     'u',
    domain:         's'
  },

  // Unused obsolete root fields
	OBSOLETE_ROOT_FIELDS: [
    'country',
    'websiteURL'
  ],

  INVISIBLE_ROOT_FIELDS: [
    'name',
    'avatar',
    'description',
    'websiteURL',
    'readme',
    'tags',
    'category',
    'country',
    'language',
    'license',
    'licenseURL',
    'licenseText'
  ],

  // Root fields not used for websites, only for skeletons
  // HIDDEN_WEBSITE_FIELDS: [
  //   'tags',
  //   'country',
  //   'language',
  //   'category',
  //   'country',
  //   'license',
  //   'licenseURL',
  //   'licenseText',
  //   'websiteURL'
  // ],

  /**
   * This paths not displayed in tree.
   */
	IGNORED_PATHS: {
	  dev: [
      'views',
      'likes',
      'comments',
      // 'processes',
      'statistics',
      // 'cache'
    ],
    cms: [
      'views',
      'likes',
      'comments',
      'processes',
      'statistics',
      'cache',
      'website',
      'protos'
    ]
  },

  IGNORED_WHEN_EMPTY_PATHS: [],

  /**
   *  This paths can't be deleted.
   */
	SYSTEM_PATHS: [
	  'data',
    'cache',
		'resources',
		'protos',
		'comments',
		'views',
		'likes',
		'processes',
    'website',
    'tasks',
    'wizards',
    'production',
    'production/data',
    'production/resources',
    'production/protos',
    'production/cache',
    'dev',
    'dev/data',
    'dev/resources',
    'dev/protos',
    'dev/cache',
    'website/includes',
    'website/public_html',
    'website/migration',
    'website/scss',
    'website/wizards',
    'website/generators',
    'website/tasks',
    'statistics'
	],

  EDITOR_SUPPORTED_EXTENSIONS: {
	  'js': {
	    mode: 'javascript'
    },
    'css': {
      mode: 'css'
    },
    'scss': {
      mode: 'scss'
    },
    'html': {
      mode: 'html'
    },
    'pug': {
      mode: 'jade'
    },
    'json': {
      mode: 'json'
    },
    'yml': {
      mode: 'yml'
    },
    'md': {
      mode: 'markdown'
    },
    'txt': {
      mode: 'text'
    },
    'jsx': {
      mode: 'jsx'
    }
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

  escapeHTML: function (value) {
    var escape = document.getElementById('script_edit_value_escape_textarea');
    if (!escape) {
      escape = document.createElement('textarea');
      escape.setAttribute('id', 'script_edit_value_escape_textarea');
    }
    escape.textContent = value;
    return escape.innerHTML;
  },

  /**
   *
   * @param {string} id
   */
  isTreeShowMore: function (id) {
    return (new RegExp(UIHelper.ENTITY_TREE_SHOW_MORE_ID + '(\\?\\d+)?$')).test(id);
  },

  isListShowMore: function (id) {
    return (new RegExp(UIHelper.ENTITY_LIST_SHOW_MORE_ID + '(\\?\\d+)?$')).test(id);
  },

  setVisible: function (components, isVisible) {
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
  isViewOnly: function () {
    return window.location.hash != null &&
      window.location.hash !== '' &&
      window.location.hash !== '#';
  },

  getEntityTypeByPath: function (path) {
    var depth = UIHelper.getEntityDepthByPath(path);
    switch (path) {
      case '':
        return 'root';
      case 'statistics':
      case 'protos':
      case 'resources':
      case 'tasks':
      case 'likes':
      case 'comments':
      case 'processes':
      case 'website':
      case 'wizards':
      case 'generators':
      case 'data':
      case 'cache':
      case 'env/production':
      case 'env/production/data':
      case 'env/production/protos':
      case 'env/production/resources':
      case 'env/production/cache':
      case 'env/dev':
      case 'env/dev/data':
      case 'env/dev/protos':
      case 'env/dev/resources':
      case 'env/dev/cache':
      case 'website/tasks':
      case 'website/wizards':
      case 'website/generators':
      case 'website/migration':
      case 'website/includes':
      case 'website/scss':
      case 'website/public_html':
        return path.split('/').slice(-1)[0];
      default:
        if (/^website\/generators\/[^\/]+$/.test(path)) {
          return 'generator';
        }
        if (/^(website\/)?tasks\/[^\/]+$/.test(path) || /^website\/tasks\/[^\/]+$/.test(path)) {
          return 'task';
        }
        if (/^(website\/)?tasks\/[^\/]+\/logs$/.test(path)) {
          return 'logs';
        }
        if (/^(website\/)?tasks\/[^\/]+\/logs\/[^\/]+$/.test(path)) {
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

  getIconByPath: function (path, isEmpty, isOpened) {
    var icon = UIConstants.ENTITY_ICONS[UIHelper.getEntityTypeByPath(path)];
    if (icon) {
      return icon;
    }
    if (isEmpty) {
      return isOpened ? 'folder-open-o' : 'folder-o';
    } else {
      return isOpened ? 'folder-open' : 'folder';
    }
  },

  getEntityDepthByPath: function (path) {
    var depth = 1;
    for (var i = 0; i < path.length; i++) {
      if (path[i] === '/') {
        depth++;
      }
    }
    return depth;
  },

  isTaskPath: function (path) {
    if (path == null) {
      return false;
    }
    return path.startsWith('tasks/') &&
      UIHelper.getEntityDepthByPath(path) === 2;
  },

  isProtoPath: function (path) {
    if (path == null) {
      return false;
    }
    return path.startsWith('protos/') &&
      UIHelper.getEntityDepthByPath(path) === 2;
  },

  isProto: function (id) {
    if (id == null) {
      return false;
    }
    var identity = Identity.dataFromId(id);
    return UIHelper.isProtoPath(identity.path);
  },

  popupCenter: function (url, title, w, h) {
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

  isValidJWT: function (token) {
    return isValidJWT(token);
  },

  getWizardUrlById: function (id) {
    var data = Identity.dataFromId(id);
    if (MDSCommon.isPresent(data.path)) {
      var path = MDSCommon.getParentPath(data.path);
      return 'https://wizard.web20.site/' + data.root + (MDSCommon.isPresent(path) ? '/' + path : '') + '/' + 'item.html'
    } else {
      return 'https://wizard.web20.site/' + data.root + '/' + 'root.html'
    }
  },

  loadDatasourcesToCombo: function (id) {
    Mydataspace.request('entities.get', {
      root: 'datasources',
      path: 'data',
      children: true
      //fields: ['name']
    }).then(function (data) {
      var options = data.children.map(function (ds) {
        var id = MDSCommon.getPathName(ds.path);
        return {
          id: id,
          value: MDSCommon.findValueByName(ds.fields, 'name') || id
        }
      });
      $$(id).getList().clearAll();
      $$(id).getList().parse(options);
    });
  },

  isDataHasFiles: function (data) {
    for (var i in data.fields) {
      if (data.fields[i].name.indexOf('.') >= 0) {
        return true;
      }
    }
    return false;
  },

  getExtensionInfoForFile: function (fileName) {
    var index = fileName.indexOf('.');
    if (index === -1) {
      return UIConstants.EDITOR_SUPPORTED_EXTENSIONS['txt'];
    }
    return UIConstants.EDITOR_SUPPORTED_EXTENSIONS[fileName.substr(index + 1)] || UIConstants.EDITOR_SUPPORTED_EXTENSIONS['txt'];
  },


  /**
   *
   * @param {HTMLElement|string} element
   * @param {string} str
   * @param {string} [contentType]
   */
  setInnerContentOrRemove: function (element, str, contentType) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (MDSCommon.isBlank(str)) {
      element.parentNode.removeChild(element);
    } {
      switch (contentType) {
        case 'html':
          element.innerHTML = str;
          break;
        default:
          element.innerText = str;
          break;
      }
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
    },
    '*': {
      title: STRINGS.SECRET,
      isValidValue: function(value) {
        return value.toString().length < Fields.MAX_STRING_FIELD_LENGTH;
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
    '*': 'lock'
  },

  /**
   *
   * @param {array|object} fields
   * @returns {*}
   */
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

    if (!MDSCommon.isBlank(data.numberOfChildren) && data.numberOfChildren > 0 || UIHelper.isDataHasFiles(data)) {
      if (MDSCommon.isPresent(data.children)) {
        children = data.children.filter(function(x) {
          return (x.root !== 'root' || x.path !== '') && UIConstants.IGNORED_PATHS[UI.getMode()].indexOf(x.path) < 0;
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
    // if (MDSCommon.isBlank(v) && MDSCommon.isBlank(data.path)) {
    //   v = MDSCommon.findValueByName(data.fields || [], '$currentVersion');
    // }

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

  dataFromId: function(id, options) {
    if (!options) {
      options = {};
    }

    var fileIdParts = id.split('#');
    id = fileIdParts[0];

    var idVersionParts = id.split('?');
    var idParts = idVersionParts[0].split(':');
    var ret = {
      root: idParts[0],
      path: idParts.length === 1 ? '' : idParts[1]
    };
    
    if (MDSCommon.isInt(idVersionParts[1])) {
      ret.version = parseInt(idVersionParts[1]);
    }

    if (fileIdParts[1] && !options.ignoreField) {
      ret.fields = [fileIdParts[1]];
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
    //var version = typeof data.version === 'number' ? '?' + data.version : '';
    return data.root;// + version;
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
    return MDSCommon.isPresent(id) && id.indexOf(':') < 0;
  },

  isWebsiteId: function(id) {
    return Identity.dataFromId(id).path === 'website';
  },

  getFileNameFromId: function (id) {
    var i = id.indexOf('#');
    if (i === -1) {
      throw new Error('Id has no file');
    }
    return id.substr(i + 1);
  },

  getEntityIdFromFileId: function (id) {
    var i = id.indexOf('#');
    if (i === -1) {
      return id;
    }
    return id.substr(0, i);
  },

  isFileId: function (id) {
    return id.indexOf('#') >= 0;
  }

};

UIControls = {
  getFieldTypeSelectTemplate: function() {
    var options = [];
    for (var id in Fields.FIELD_TYPES) {
      options.push({
        id: id,
        value: Fields.FIELD_TYPES[id].title,
        icon: Fields.FIELD_TYPE_ICONS[id]
      });
    }
    return {
      view: 'richselect',
      required: true,
      name: 'type',
      value: 's',
      label: STRINGS.TYPE,
      suggest: {
        template: '<span class="webix_icon fa-#icon#"></span> #value#',
        body: {
          data: options,
          template: '<span class="webix_icon fa-#icon#"></span> #value#'
        }
      }
    };
  },

  getRootTypeSelectTemplate: function () {
    return {
      view: 'combo',
      label: STRINGS.ROOT_TYPE,
      name: 'type',
      value: 'd',
      options: [
        { id: 'd', value: STRINGS.root_types.d },
        { id: 't', value: STRINGS.root_types.t }
      ],
      labelWidth: UIHelper.LABEL_WIDTH
    };
  },

  getEntityTypeSelectTemplate: function(id) {
    return {
      view: 'richselect',
      label: STRINGS.OTHERS_CAN,
      name: 'othersCan',
      value: 'view_children',
      id: id,
      options: [
        // { id: 'nothing', value: STRINGS.NOTHING },
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

  getRootFieldSelectTemplate: function(name, value, values, isFixed, icons) {
    if (!icons) {
      icons = {};
    }

		var options = [];
		for (var id in values) {
			options.push({ id: id, value: values[id], icon: icons[id] });
		}
		return {
			view: isFixed ? 'richselect' : 'combo',
			label: STRINGS.ROOT_FIELDS[name],
			labelWidth: UIHelper.LABEL_WIDTH,
			name: 'fields.' + name + '.value',
			id: 'entity_form__' + name + '_value',
			value: value,
			options: options,
      placeholder: STRINGS.ROOT_FIELD_PLACEHOLDERS[name]
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
      css: 'entity_form__text_label entity_form__text_label--root',
      placeholder: STRINGS.ROOT_FIELD_PLACEHOLDERS[name],
      on: {
        onFocus: function() {
          UI.entityForm.showScriptEditWindow(name);
        }
      }
    };
  },

  /**
   *
   * @param type Type of field: text, textarea, select, etc
   * @param data Current field data
   * @param [values] Available field values. Required for select and list fields.
   * @param [icons] Icons of available field values. Required for select and list fields.
   * @returns {{id: string, css: string, cols: *[]}}
   */
	getRootFieldView: function(type, data, values, icons) {
  	var valueView;
  	switch (type) {
      case 'list':
        valueView = UIControls.getRootFieldSelectTemplate(data.name, data.value, values, true, icons);
        break;
			case 'select':
        valueView = UIControls.getRootFieldSelectTemplate(data.name, data.value, values, false, icons);
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
  getOnForFormWindow: function(id, on, focusedFieldId) {
    var formId = id + '_form';
    var windowId = id + '_window';
    return {
      onHide: function() {
        $$(formId).clearValidation();
        $$(formId).setValues($$(formId).getCleanValues());
      },
      onShow: function() {
        setTimeout(function () { $$(formId).focus(focusedFieldId); }, 300);
        $$(formId).setDirty(false);
        $$(windowId + '__cancel_button').define('hotkey', 'escape');
        if (on && typeof on.onShow === 'function') {
          on.onShow.call($$(windowId), id);
        }
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

  removeSpinnerFromWindow: function(window) {
    if (typeof window === 'string') {
      window = $$(window);
    }
    var head = window.getNode().querySelector('.webix_win_head > .webix_view > .webix_template');
    var spinners = head.getElementsByClassName('webix_win_head_spinner');
    if (spinners.length !== 0) {
      head.removeChild(spinners[0]);
    }
    $$(window.config.id.replace(/_window$/, '_form')).enable();
  },

  getSubmitCancelForFormWindow: function(id, isLongExecutable) {
    if (isLongExecutable == null) {
      isLongExecutable = true;
    }
    var formId = id + '_form';
    var windowId = id + '_window';
    var createButtonTitle;

    switch (id) {
      case 'clone_entity':
        createButtonTitle = STRINGS.COPY;
        break;
      case 'rename_file':
        createButtonTitle = STRINGS.RENAME;
        break;
      case 'add_resource':
        createButtonTitle = STRINGS.UPLOAD;
        break;
      default:
        createButtonTitle = STRINGS.CREATE;
        break;
    }

    return { cols: [
        { view: 'button',
          id: windowId + '__create_button',
          value: createButtonTitle,
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
          {id: 'new_entity', value: STRINGS.new_entity, icon: 'folder-o'},
          {id: 'import_wizard', value: STRINGS.import_entity},
          {id: 'new_resource', value: STRINGS.new_resource, icon: 'diamond'},
          {id: 'new_task', value: STRINGS.new_task, icon: 'file-code-o'},
          {id: 'new_proto', value: STRINGS.new_proto, icon: 'cube'}
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
          {id: 'new_entity', value: STRINGS.new_entity, icon: 'folder-o'},
          //{id: 'import_wizard', value: STRINGS.import_entity}
        ];
    }
  }
};

/**
 * @class
 */
function EntityForm() {
  var self = this;
  self.editing = false;
  self.loadedListeners = [];


  window.addEventListener('message', function (e) {
    if ([
      'MDSWizard.getFields',
      'MDSWizard.save'
    ].indexOf(e.data.message) == -1) {
      return;
    }

    var formData = Identity.dataFromId(self.getCurrentId());
    var iframeWindow = (document.getElementById('entity_form_iframe') || {}).contentWindow;
    switch (e.data.message) {
      case 'MDSWizard.getFields':
        Mydataspace.entities.get(formData).then(function (data) {
          iframeWindow.postMessage({ message: 'MDSWizard.getFields.res', fields: data.fields }, '*');
        }).catch(function (err) {
          iframeWindow.postMessage({ message: 'MDSWizard.getFields.err', error: err }, '*');
        });

        break;

      case 'MDSWizard.save':
        if (!e.data.token || e.data.token !== self.saveToken) {
          throw new Error('Invalid save token');
        }
        delete self.saveToken;

        var iframeLock = document.getElementById('entity_form_iframe_lock');
        iframeLock.style.display = 'block';
        Mydataspace.request('entities.change', {
          root: formData.root,
          path: formData.path,
          fields: e.data.fields
        }).then(function () {
          iframeLock.style.display = 'none';
        }).catch(function (err) {
          iframeLock.style.display = 'none';
          iframeWindow.postMessage({ message: 'MDSWizard.save.err', token: e.data.token, error: err }, '*');
        });
        break;
    }
  });
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
  if (this.currentId == null) {
      return;
  }

  this.editing = editing;
  delete self.saveToken;

  UI.entityForm.hideScriptEditWindow();
  var entityType = UIHelper.getEntityTypeByPath(Identity.dataFromId(this.currentId).path);

  UIHelper.setVisible('entity_form__toolbar', editing);
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
  Mydataspace.on('entities.change.res', function(data) {
    if (self.isEditing()) {
      return;
    }
    if (Identity.idFromData(data) !== self.getCurrentId()) {
      return;
    }
    if (MDSCommon.isBlank(data.path)) {
      self.setViewTitle(MDSCommon.findValueByName(data.fields, 'name') || MDSCommon.getEntityName(data.root));
    }
  });
};

EntityForm.prototype.isProto = function() {
  return UIHelper.isProto(this.currentId);
};

EntityForm.prototype.getCurrentId = function () {
  return this.currentId;
};

EntityForm.prototype.setCurrentId = function(id) {
  if (this.currentId === id) {
    return;
  }
  this.currentId = id;
  UI.entityForm.hideScriptEditWindow();
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
  if (MDSCommon.isBlank(fields.filter(function (field) { return field.name.indexOf('$') != 0; }))) {
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

EntityForm.getNoFieldsLabel = function(data) {
  return '<div class="view__no_fields_exists">' + STRINGS.NO_FIELDS + '</div>';
};


EntityForm.prototype.setViewFields = function(data,
                                              ignoredFieldNames,
                                              addLabelIfNoFieldsExists,
                                              comparer,
                                              classResolver) {

  var fields = data.fields.filter(function (field) { return field.name.indexOf('.') === -1; });

  if (!Array.isArray(ignoredFieldNames)) {
    ignoredFieldNames = [];
  }
  if (addLabelIfNoFieldsExists == null) {
    addLabelIfNoFieldsExists = true;
  }
  var viewFields = document.getElementById('view__fields');
  if (MDSCommon.isBlank(fields.filter(function (field) { return field.name !== 'description' && field.name.indexOf('$') != 0; }))) {
    viewFields.classList.add('view__fields--empty');
    viewFields.innerHTML = addLabelIfNoFieldsExists ? EntityForm.getNoFieldsLabel(data) : '';
  } else {
    viewFields.classList.add('view__fields--filled');
    viewFields.innerHTML = '';
    var numberOfChildren = 0;
    if (comparer) {
        fields.sort(comparer);
    }
    for (var i in fields) {
      var field = fields[i];
      if (field.name.indexOf('$') !== -1 ||
        ignoredFieldNames.indexOf(field.name) >= 0 ||
        MDSCommon.isBlank(data.path) && UIConstants.ROOT_FIELDS.indexOf(field.name) >= 0 && MDSCommon.isBlank(field.value)) {
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
    viewFields.innerHTML = addLabelIfNoFieldsExists ? EntityForm.getNoFieldsLabel(data) : '';
  }
  return viewFields;
};

EntityForm.prototype.startAddingField = function() {
  this.startEditing();
  $$('add_field_window').show();
};

EntityForm.prototype.startEditing = function () {
  var self = this;
  self.setEditing(true);
  self.refresh();
};

EntityForm.prototype.setViewTitle = function (title) {
  var viewTitle = document.getElementById('view__title');
  viewTitle.innerText = title;
  viewTitle.innerHTML += '<i style="margin-left: 5px;" class="fa fa-caret-down"></i>';
  viewTitle.addEventListener('click', function () { $$('entity_form_menu').show(this) });
};

EntityForm.prototype.clearTimeouts = function () {
  if (this.viewWebsiteLinkDisabledTimeout) {
    clearTimeout(this.viewWebsiteLinkDisabledTimeout);
    delete this.viewWebsiteLinkDisabledTimeout;
  }
  if (this.viewWebsiteLinkDisabledCountdown) {
    clearTimeout(this.viewWebsiteLinkDisabledCountdown);
    delete this.viewWebsiteLinkDisabledCountdown;
  }
};


EntityForm.prototype.setRootView = function(data) {
  var self = this;
  var language = (getCurrentLanguage() || 'en').toLowerCase();
  var languagePrefix = language === 'en' ? '' : '/' + language;

  self.clearTimeouts();

  $.ajax({ url: languagePrefix + '/fragments/root-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    var description = MDSCommon.findValueByName(data.fields, 'description');
    var readme = MDSCommon.findValueByName(data.fields, 'readme');


    var tags = (MDSCommon.findValueByName(data.fields, 'tags') || '').split(' ').filter(function(tag) {
      return tag != null && tag !== '';
    }).map(function(tag) {
      return '<a class="view__tag" href="search?q=%23' + tag + '" target="_blank">' + tag + '</a>';
    }).join(' ');


    var languageAbbr = MDSCommon.findValueByName(data.fields, 'language');
    var countryAbbr = MDSCommon.findValueByName(data.fields, 'country');
    var category = MDSCommon.findValueByName(data.fields, 'category');
    var country = COUNTRIES[countryAbbr];
    var language = COUNTRIES[languageAbbr];

    if (category) {
      tags = '<span class="view__tag"><i class="view__tag_icon fa fa-' + CATEGORY_ICONS[category] + '"></i><span>' + tr$('categories.' + category) + '</span></span> ' + tags;
    }

    if (country && (languageAbbr === countryAbbr || (language.same || []).indexOf(countryAbbr) != -1)) {
      tags = '<span class="view__tag view__tag--flag view__tag--multi_link">' +
        '<img class="view__tag_icon view__tag_icon--flag" src="/images/square_flags/' + country.name + '.svg" />' +
        '<span class="view__tag_link">' +
        tr$('languagesShort.' + languageAbbr) + '</span> / ' +
        '<span class="view__tag_link">' +
        tr$('countries.' + countryAbbr) + '</span></span> ' + tags;
    } else {
      if (country) {
        tags = '<span class="view__tag view__tag--flag">' +
          '<img class="view__tag_icon view__tag_icon--flag" src="/images/square_flags/' + country.name + '.svg" />' +
          tr$('countries.' + countryAbbr) + '</span> ' + tags;
      }
      if (language) {
        tags = '<span class="view__tag view__tag--flag">' +
          '<img class="view__tag_icon view__tag_icon--flag" src="/images/square_flags/' + language.name + '.svg" />' +
          tr$('languagesShort.' + languageAbbr) + '</span> ' + tags;
      }
    }

    var license = MDSCommon.findValueByName(data.fields, 'license');
    if (MDSCommon.isPresent(license)) {
      var licenseOrig = license;
      license = getLicenseWithoutVersion(license);

      if (license !== 'none') {
        tags = '<span class="view__tag view__tag--license' +
          ' data-license="' + licenseOrig + '"' +
          ' data-root="' + data.root + '"' +
          '><i class="view__tag_icon fa fa-balance-scale"></i>' + tr$('licenses.' + licenseOrig) + '</span> ' + tags;
      }
    }


    view.innerHTML = html;

    var ava = MDSCommon.findValueByName(data.fields, 'avatar');
    if (MDSCommon.isPresent(ava)) {
      ava = Mydataspace.options.cdnURL + '/avatars/sm/' + ava + '.png';
    }
    document.getElementById('view__overview_image').src = ava || '/images/icons/root.svg';

    self.setViewTitle(MDSCommon.findValueByName(data.fields, 'name') || MDSCommon.getEntityName(data.root));

    UIHelper.setInnerContentOrRemove('view__tags', tags, 'html');

    if ((data.children || []).filter(function (child) { return child.path === 'website' }).length > 0) {
      var websiteLink = document.getElementById('view__website_link');
      websiteLink.href = 'https://' + data.root + SITE_SUPER_DOMAIN;
      websiteLink.classList.remove('hidden');
      websiteLink.setAttribute('data-root', data.root);
      var rootTime = new Date().getTime() - new Date(data.createdAt).getTime();

      var TIMEOUT = 0;

      if (rootTime < TIMEOUT) {
        document.getElementById('view__website_link__countdown_wrap').style.display = 'initial';


        websiteLink.setAttribute('disabled', 'disabled');

        document.getElementById('view__website_link__icon').classList.remove('fa-globe');
        document.getElementById('view__website_link__icon').classList.add('fa-cog');
        document.getElementById('view__website_link__icon').classList.add('fa-spin');

        $(websiteLink).tooltip({
          placement: 'bottom',
          title: STRINGS.site_dns_in_progress,
          container: 'body',
          trigger: 'hover'
        });

        var countdown = Math.round((TIMEOUT - rootTime) / 1000);

        var countdownElem = document.getElementById('view__website_link__countdown');

        if (countdownElem) {
          countdownElem.innerText = ' ' + countdown + ' ';
        }

        self.viewWebsiteLinkDisabledCountdown = setInterval(function () {
          countdown -= 1;
          if (countdown < 1) {
            countdown = 1;
          }
          if (countdownElem) {
            countdownElem.innerText = ' ' + countdown + ' ';
          }
        }, 1000);

        self.viewWebsiteLinkDisabledTimeout = setTimeout(function () {
          var websiteLink2 = document.getElementById('view__website_link');
          if (websiteLink2 && websiteLink2.getAttribute('data-root') === data.root) {
            websiteLink.removeAttribute('disabled');

            document.getElementById('view__website_link__icon').classList.add('fa-globe');
            document.getElementById('view__website_link__icon').classList.remove('fa-cog');
            document.getElementById('view__website_link__icon').classList.remove('fa-spin');
          }
          $(websiteLink).tooltip('destroy');
          document.getElementById('view__website_link__countdown_wrap').style.display = 'none';
        }, TIMEOUT - rootTime);
      }
    }

    if (MDSCommon.isBlank(description) && MDSCommon.isBlank(tags)) {
      document.getElementById('view__description').innerHTML = '<i>' + STRINGS.NO_README + '</i>';
    } else {
      document.getElementById('view__description').innerText = description;
      UIHelper.setInnerContentOrRemove('view__description', description);
    }

    // TODO: Uncomment for skeletons
    // document.getElementById('view__counters_likes_count').innerText =
    //   MDSCommon.findValueByName(data.fields, '$likes');
    // document.getElementById('view__counters_comments_count').innerText =
    //   MDSCommon.findValueByName(data.fields, '$comments');

    UIHelper.setInnerContentOrRemove('view__readme', md.render(readme || ''), 'html');

    var viewFields = self.setViewFields(data,
                                        UIConstants.INVISIBLE_ROOT_FIELDS,
                                        false);

    if (viewFields.childNodes.length === 0) {
      viewFields.parentNode.removeChild(viewFields);
    }

    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      $(this).addClass('view__field--active');
      var value = $(this).data('value');
      UI.entityForm.showScriptViewWindow(value);
    });

    data.children.forEach(function (child) {
      switch (child.path) {
        case 'statistics':
          document.getElementById('view_stat_website_visits_month').innerText =
            MDSCommon.humanizeNumber(MDSCommon.findValueByName(child.fields, 'websiteVisitsTotal') || 0);
          document.getElementById('view_stat_website_visitors_month').innerText =
            MDSCommon.humanizeNumber(MDSCommon.findValueByName(child.fields, 'websiteVisitorsTotal') || 0);
          document.getElementById('view_stat_api_calls_month').innerText =
            MDSCommon.humanizeNumber(MDSCommon.findValueByName(child.fields, 'apiCallsTotal') || 0);
          document.getElementById('view_stat_users_month').innerText =
            MDSCommon.humanizeNumber(MDSCommon.findValueByName(child.fields, 'userRegsTotal') || 0);
          break;
      }
    });
  });
};

EntityForm.prototype.setTaskView = function(data) {
  var self = this;
  var language = (getCurrentLanguage() || 'en').toLowerCase();
  var languagePrefix = language === 'en' ? '' : '/' + language;

  self.clearTimeouts();

  $.ajax({ url: languagePrefix + '/fragments/task-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    document.getElementById('view__overview_icon').className =
      'view__overview_icon fa fa-' +
      UIHelper.getIconByPath(data.path,
                             data.numberOfChildren === 0,
                             false);

    self.setViewTitle(MDSCommon.getEntityName(data.path));

    var viewFields =
        this.setViewFields(data,
                           ['status', 'statusText', 'interval'],
                           false,
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
      $(this).addClass('view__field--active');
      var value = $(this).data('value');
      UI.entityForm.showScriptViewWindow(value);
    });
  }.bind(this));
};


EntityForm.prototype.setEntityCmsView = function (data) {
  var self = this;

  if (data.path !== 'data' && data.path.indexOf('data/') !== 0) {
    self.setEntityView(data);
    return;
  }

  var host = data.root + '.wiz.web20.site';
  var path = data.path.substr('data'.length);
  var wizardsPath = 'website/wizards' + path;

  Mydataspace.entities.get({ root: data.root, path: wizardsPath }).then(function (res) {
    return res;
  }).catch(function () {
    return Mydataspace.entities.get({ root: data.root, path: MDSCommon.getParentPath(wizardsPath) });
  }).then(function (res) {
    var url = 'https://' + host + (res.path === wizardsPath ? path + '/view.html' : MDSCommon.getParentPath(path) + '/view-item.html') + '?' + MDSCommon.guid();
    self.setEntityView(data, false).then(function () {
      document.getElementById('view__fields').innerHTML = '<iframe id="entity_form_iframe" class="view__iframe" src="' + url + '"></iframe><div id="entity_form_iframe_lock" class="view__iframe_lock"></div>';
    });
  }).catch(function () {
    self.setEntityView(data);
  });
};

EntityForm.prototype.setEntityView = function(data, ignoreFields) {
  var self = this;

  if (self.currentId == null) {
      return;
  }

  self.clearTimeouts();

  var entityType = UIHelper.getEntityTypeByPath(Identity.dataFromId(self.currentId).path);
  var language = (getCurrentLanguage() || 'en').toLowerCase();
  var languagePrefix = language === 'en' ? '' : '/' + language;

  return $.ajax({ url: languagePrefix + '/fragments/entity-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    if (entityType === 'resource') {
      var resourceType = MDSCommon.findValueByName(data.fields, 'type');
      var resourceName = MDSCommon.getPathName(data.path);
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

    self.setViewTitle(MDSCommon.getEntityName(data.path));

    if (ignoreFields) {
      return;
    }

    var viewFields = self.setViewFields(data);
    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      $(this).addClass('view__field--active');
      var value = $(this).data('value');
      UI.entityForm.showScriptViewWindow(value);
    });
  });
};

EntityForm.prototype.setLogView = function(data) {
  var self = this;
  var language = (getCurrentLanguage() || 'en').toLowerCase();
  var languagePrefix = language === 'en' ? '' : '/' + language;

  self.clearTimeouts();

  $.ajax({ url: languagePrefix + '/fragments/log-view.html', method: 'get' }).then(function(html) {
    var view = document.getElementById('view');
    view.innerHTML = html;
    document.getElementById('view__overview_icon').className =
      'view__overview_icon fa fa-' +
      UIHelper.getIconByPath(data.path,
                             data.numberOfChildren === 0,
                             false);
    document.getElementById('view__title').innerText =
      MDSCommon.getPathName(data.path);
    var viewFields = self.setLogRecords(data.fields);
    $(viewFields).on('click', '.view__field', function() {
      $(viewFields).find('.view__field--active').removeClass('view__field--active');
      $(this).addClass('view__field--active');
      var value = $(this).data('value');
      UI.entityForm.showScriptViewWindow(value);
    });
  });
};

EntityForm.prototype.setView = function(data) {
  var self = this;

  self.clearTimeouts();

  $('#view').append('<div class="view__loading"></div>');
  if (MDSCommon.isBlank(data.path)) {
    self.setRootView(data);
  } else if (UIHelper.getEntityTypeByPath(data.path) === 'task') {
    self.setTaskView(data);
  } else if (UIHelper.getEntityTypeByPath(data.path) === 'log') {
    self.setLogView(data);
  } else {
    switch (UI.getMode()) {
      case 'dev':
        self.setEntityView(data);
        break;
      case 'cms':
        self.setEntityCmsView(data);
        break;
    }
  }
  $$('entity_form').hide();
  $$('entity_view').show();
};

EntityForm.prototype.setNoFieldLabelVisible = function(visible) {
  var label = $$('NO_FIELDS_LABEL');
  if (!label) {
    return;
  }
  if (visible) {
    label.show();
  } else {
    label.hide();
  }
};

EntityForm.prototype.setCmsData = function(data) {
  var self = this;
  self.clear();

  if (data.path !== 'data' && data.path.indexOf('data/') !== 0) {
    self.setData(data);
    return;
  }

  var host = data.root + '.wiz.web20.site';
  var path = data.path.substr('data'.length);
  var wizardsPath = 'website/wizards' + path;

  Mydataspace.entities.get({ root: data.root, path: wizardsPath }).then(function (res) {
    return res;
  }).catch(function () {
    return Mydataspace.entities.get({ root: data.root, path: MDSCommon.getParentPath(wizardsPath) });
  }).then(function (res) {
    var url = 'https://' + host + (res.path === wizardsPath ? path + '/edit.html' : MDSCommon.getParentPath(path) + '/edit-item.html') + '?' + MDSCommon.guid();
    var view = document.getElementById('view');
    view.innerHTML = '</div><iframe id="entity_form_iframe" class="view__iframe" src="' + url + '"></iframe><div id="entity_form_iframe_lock" class="view__iframe_lock">';
  }).catch(function (err) {
    document.getElementById('view').innerHTML = '<i>No editor defined for this item</i>';
  });

  self.setClean();
  $$('entity_form').hide();
  $$('entity_view').show();
};


EntityForm.prototype.setData = function(data) {
  var formData = {
    name: Identity.nameFromData(data),
    othersCan: data.othersCan,
    maxNumberOfChildren: data.maxNumberOfChildren,
    isFixed: data.isFixed,
    childPrototype: Identity.idFromChildProtoData(data.childPrototype)
  };
  this.clear();
  $$('entity_form').setValues(formData);

  var fields = data.fields.filter(function (field) { return field.name.indexOf('.') === -1; });

  if (MDSCommon.isBlank(data.path)) { // root entity
    // add fields from ROOT_FIELDS if not exists in data.fields
    for (var i in UIConstants.ROOT_FIELDS) {
      var field = UIConstants.ROOT_FIELDS[i];
      if (!MDSCommon.findByName(data.fields, field)) {
        fields.push({ name: field, value: '', type: UIConstants.ROOT_FIELDS_TYPES[field] });
      }
    }

    this.addRootFields({ fields: fields, type: data.type });
  } else {
    this.setNoFieldLabelVisible(true);
    this.addFields(fields, false, UIHelper.getEntityTypeByPath(data.path));
  }
  this.setClean();
  $$('entity_view').hide();
  $$('entity_form').show();
};

EntityForm.prototype.refresh = function() {
  var self = this;

  if (this.currentId == null) {
      return;
  }

  var entityType = UIHelper.getEntityTypeByPath(Identity.dataFromId(self.currentId).path);
  var isWithMeta = self.isEditing();
  $$('entity_form').disable();
  var req = !isWithMeta ? 'entities.get' : 'entities.getWithMeta';
  Mydataspace.request(req, MDSCommon.extend(Identity.dataFromId(self.currentId), { children: true }), function(data) {
    if (!isWithMeta || entityType === 'resource') {
      self.setView(data);
    } else if (UI.getMode() === 'cms') {
      self.setCmsData(data);
      $$('entity_form').enable();
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
  }, function(err) {
    UI.error(err);
    $$('entity_form').enable();
  });
};

///**
// * Creates new entity by data received from the 'New Entity' form.
// * @param formData data received from form by method getValues.
// */
//EntityForm.prototype.createByFormData = function(formData) {
//  var newEntityId = Identity.childId(this.currentId, formData.name);
//  var data = Identity.dataFromId(newEntityId);
//  data.fields = [];
//  data.type = formData.type;
//  Mydataspace.emit('entities.create', data);
//};

EntityForm.prototype.export = function () {
  Mydataspace.request('entities.export', Identity.dataFromId(this.currentId));
};

EntityForm.prototype.clone = function(entityId) {
  $$('clone_entity_window').showWithData({ entityId: entityId });
};

EntityForm.prototype.askDelete = function(entityId) {
  webix.confirm({
    title: STRINGS.DELETE_ENTITY,
    text: STRINGS.REALLY_DELETE,
    ok: STRINGS.YES,
    cancel: STRINGS.NO,
    callback: function(result) {
      if (result) {
        UI.entityForm.delete(entityId);
      }
    }
  });
};

EntityForm.prototype.delete = function(entityId) {
  if (entityId == null) {
    entityId = this.currentId;
  }
  if (this.currentId == null) {
    return;
  }

  $$('entity_form').disable();
  UI.deleteEntity(entityId);
  Mydataspace.request('entities.delete', Identity.dataFromId(entityId), function(data) {
    // do nothing because selected item already deleted.
    // this.selectedId = null;
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

  if (self.currentId == null) {
      return;
  }

  if (UI.getMode() === 'cms') {
    var saveToken = MDSCommon.guid();
    document.getElementById('entity_form_iframe').contentWindow.postMessage({ message: 'MDSWizard.saveRequest', token: saveToken }, '*');
    self.saveToken = saveToken;
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
  MDSCommon.extendOf(dirtyData, Identity.dataFromId(self.currentId));

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
    	if (Identity.isRootId(self.currentId)) {
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
    if (field.name.indexOf('$') === 0 || field.name.indexOf('.') >= 0) {
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

EntityForm.prototype.addRootFields = function(options) {
  var fields = options.fields;
  var setDirty = options.setDirty;
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

    if (UIConstants.OBSOLETE_ROOT_FIELDS.indexOf(field.name) >= 0) {
      continue;
    }

    // if (options.type === 'd' && UIConstants.HIDDEN_WEBSITE_FIELDS.indexOf(field.name) >= 0) {
    //   continue;
    // }

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
    Identity.dataFromId(this.currentId).root,
    'avatar',
    function(res) {
      var entityName = res.resources[0];
      $$('entity_form__root_avatar_value').setValue(entityName);

      setTimeout(function () {
        $('#entity_form__root_img').prop('src', Mydataspace.options.cdnURL + '/avatars/sm/' + entityName + '.png');
      }, 1000);
    },
    function(err) {
      console.log(err);
    }
  );
};

EntityForm.prototype.addTaskIntervalField = function(data) {
  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  this.setNoFieldLabelVisible(false);
  $$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.intervals), UIHelper.NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM);
};

EntityForm.prototype.addRootField = function(data) {
  if (typeof $$('entity_form__' + data.name) !== 'undefined') {
    throw new Error('Field with this name already exists');
  }
  this.setNoFieldLabelVisible(false);
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
    // case 'datasource':
    //   var datasourceInitialOptions = {};
    //   if (MDSCommon.isPresent(data.value)) {
    //     datasourceInitialOptions[data.value] = data.value;
    //   }
    //   $$('entity_form').addView(UIControls.getRootFieldView('select', data, datasourceInitialOptions));
    //   UIHelper.loadDatasourcesToCombo('entity_form__' + data.name + '_value');
    //   break;
    case 'license':
      $$('entity_form').addView(UIControls.getRootFieldView('list', data, STRINGS.licenses));
      break;
		case 'category':
			$$('entity_form').addView(UIControls.getRootFieldView('list', data, STRINGS.categories, CATEGORY_ICONS));
			break;
		case 'language':
			$$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.languages));
			break;
		case 'country':
			$$('entity_form').addView(UIControls.getRootFieldView('select', data, STRINGS.countries));
			break;
    case 'readme':
    case 'licenseText':
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
  this.setNoFieldLabelVisible(false);
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
        type: data.type === '*' ? 'password': 'text',
        label: '<div style="visibility: hidden">fake</div>' +
               '<div class="entity_form__field_label">' +
                data.name +
               '</div>' +
               '<div class="entity_form__field_label_ellipse_right"></div>' +
               '<div class="entity_form__field_label_ellipse"></div>',
        labelWidth: UIHelper.LABEL_WIDTH,
        name: 'fields.' + data.name + '.value',
        id: 'entity_form__' + data.name + '_value',
        value: data.type === 'j' ? UIHelper.escapeHTML(data.value) : data.value,
        height: 32,
        css: 'entity_form__text_label',
        readonly: data.type === 'j',
        on: {
          onBlur: function() {
            // if (self.editScriptFieldId == 'entity_form__' + data.name + '_value') {
            //   self.editScriptFieldId = null;
            // }
          },

          onFocus: function() {
            if (data.type === 'j') {
              UI.entityForm.showScriptEditWindow(data.name);
            } else {
              UI.entityForm.hideScriptEditWindow();
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
        icon: !isProto ? null : Fields.FIELD_INDEXED_ICONS[(data.indexed || 'off').toString()],
        css: 'entity_form__field_indexed_button',
        popup: 'entity_form__field_indexed_popup',
        disabled: !isProto,
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
    this.setNoFieldLabelVisible(true);
  }
};

EntityForm.prototype.selectEditScriptTab = function (id, hideOthers) {
  Object.keys(UILayout.editScriptTabs).forEach(function (id2) {
    var tab = $$('edit_script_window__toolbar_' + id2 + '_button');
    var classList = tab.getNode().classList;
    if (id == id2) {
      classList.add('webix_el_button--active');
      tab.show();
    } else {
      classList.remove('webix_el_button--active');
      if (hideOthers) {
        tab.hide();
      } else {
        tab.show();
      }
    }
  });
  var editor = $$('edit_script_window__editor').getEditor();
  var editorTab = UILayout.editScriptTabs[id] || UILayout.editScriptTabs['text'];
  editor.getSession().setMode('ace/mode/' + editorTab.aceMode);
  editor.getValue();
};

EntityForm.prototype.showScriptViewWindow = function (text) {
  $$('edit_script_window').showWithData({ text: text });
};

EntityForm.prototype.showScriptEditWindow = function (fieldName) {
  $$('edit_script_window').showWithData({ fieldName: fieldName });
};

EntityForm.prototype.hideScriptEditWindow = function() {
  $$('edit_script_window').hide();
};
/**
 * @class
 * Created with JetBrains PhpStorm.
 * User: fifti
 * Date: 15.08.16
 * Time: 13:59
 * To change this template use File | Settings | File Templates.
 */
function EntityList() {

}

EntityList.prototype.updateBreadcrumbs = function (id) {
  var breadcrumbs = document.getElementById('entity_list_breadcrumbs');
  if (!breadcrumbs) {
    return;
  }
  var entityId = id || UI.entityTree.getSelectedId();
  var data = Identity.dataFromId(entityId);
  var items = [data.root].concat(data.path === '' ? [] : data.path.split('/'));
  if (MDSCommon.isPresent(data.fields)) {
    items.push(data.fields[0]);
  }
  var html = '';
  var id = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    if (i === 0) {
      id = item;
    } else if (i === 1) {
      id += ':' + item;
    } else {
      id += '/' + item;
    }

    var action = i === items.length - 1 ? '$$(\'entity_list_new_menu\').show(this);' : '$$(\'entity_tree\').select(\'' + id + '\'); return false;';

    html += (i === 0 ? '' : '<span class="admin-breadcrumbs__separator"><i class="fa fa-angle-right"></i></span>') +
      '<a href="javascript: void(0);" class="admin-breadcrumbs__link" onclick="' + action + '">' +
        item +
        (i === items.length - 1 ? '<i style="margin-left: 5px;" class="fa fa-caret-down"></i>' : '') +
      '</a>';
  }
  breadcrumbs.innerHTML = html;
  breadcrumbs.setAttribute('data-entity-id', entityId);
};

/**
 * Hide/show toolbar buttons according passed state - readonly or not.
 */
EntityList.prototype.setReadOnly = function(isReadOnly) {
  $$('entity_tree__new_root_version_list').clearAll();
  $$('entity_tree__new_root_version_list').parse(UIControls.getChangeVersionPopupData(isReadOnly));
  UIHelper.setVisible('NEW_VERSION_LABEL', !isReadOnly && Identity.isWebsiteId(this.getCurrentId()));
  this.isReadOnly = isReadOnly;
};

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
        self.setCurrentId(null);
        return;
      }

      if ($$('entity_list').getItem(entityId) == null) {
        return;
      }

      // ignore event if root item deleted
      if (entityId === self.getCurrentId()) {
        this.setCurrentId(null);
        return;
      }

      if (entityId === self.getSelectedId()) { // Select other item if selected item is deleted.
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
      if (self.getCurrentId() === parentId) {
        if ($$('entity_list').getItem(entity.id)) {
          continue;
        }
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
EntityList.prototype.setCurrentIdWithoutRefresh = function(id) {
  this.currentId = id;
};


/**
 * Set Id of entity witch items displayed in list. This method reloading data.
 */
EntityList.prototype.setCurrentId = function(id) {
  this.setCurrentIdWithoutRefresh(id);
  this.refresh();
};


/**
 * Id of entity witch items displayed in list.
 */
EntityList.prototype.getCurrentId = function() {
  return this.currentId;
};



/**
 * Get item selected in list.
 */
EntityList.prototype.getSelectedId = function() {
  return $$('entity_list').getSelectedId();
};


/**
 * Reload data (from server) of entity list.
 * Uses entityList_fill internally.
 * @param {string} [newRootId]
 */
EntityList.prototype.refresh = function(newRootId) {
  var self = this;

  if (newRootId != null) {
    self.setCurrentIdWithoutRefresh(newRootId);
  }

  if (self.getCurrentId() == null) {
    return;
  }

  self.updateBreadcrumbs();

  $$('entity_tree__new_entity_list').clearAll();
  $$('entity_tree__new_entity_list').parse(UIControls.getNewEntityPopupData(self.getCurrentId()));

  var req = Identity.dataFromId(self.getCurrentId());
  var search = $$('entity_list__search').getValue();

  if (MDSCommon.isPresent(search)) {
    if (search.indexOf('*') === search.length - 1) {
      req['filterByName'] = search.substring(0, search.length - 1);
    } else {
      req['search'] = search;
    }
  }
  req.children = true;
  req.orderChildrenBy = '$createdAt DESC';

  $$('entity_list').disable();
  Mydataspace.request('entities.get', req, function(data) {
    if (!self.getCurrentId()) {
      $$('entity_list').enable();
      return;
    }
    var showMoreChildId =
      Identity.childId(self.getCurrentId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);


    var entityId = Identity.idFromData(data);
    var children = data.children.filter(function(x) {
      return (x.root !== 'root' || x.path !== '') &&
        UIConstants.IGNORED_PATHS[UI.getMode()].indexOf(x.path) < 0 &&
        (UIConstants.IGNORED_WHEN_EMPTY_PATHS.indexOf(x.path) < 0);
    }).map(Identity.entityFromData);
    if (self.getCurrentId() === entityId) {
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
  }, function(err) {
    $$('entity_list').enable();
    UI.error(err);
  });
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


EntityList.prototype.addChildren = function(children) {
  var showMoreChildId =
    Identity.childId(this.getCurrentId(), UIHelper.ENTITY_LIST_SHOW_MORE_ID);

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
  var req = Identity.dataFromId(this.getCurrentId());
  var search = $$('entity_list__search').getValue();
  if (MDSCommon.isPresent(search)) {
    req['search'] = search;
  }
  req.offset = self.count();
  req.children = true;
  $$('entity_list').disable();
  Mydataspace.request('entities.get', req, function(data) {
    var children = data.children.filter(function(child) {
      return UIConstants.IGNORED_PATHS[UI.getMode()].indexOf(child.path) < 0;
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
  if (UIHelper.isListShowMore(lastId)) {
    return lastIndex - 1;
  }
  return lastIndex;
};

/**
 * @class
 */
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

EntityTree.prototype.getSelectedId = function() {
  return $$('entity_tree').getSelectedId();
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
    Mydataspace.entities.subscribe(subscribeData);
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
    sourceRoot: currentData.root,
    sourcePath: '',
    sourceVersion: currentData.version,
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
  var rootData = Identity.dataFromId(UI.entityList.getCurrentId());
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
 * View another version of passed website.
 * @param {string} rootId Existing Root ID which version you want to view.
 * @param {int} version Version you want to view.
 */
EntityTree.prototype.viewRootVersion = function(oldWebsiteId, version) {
  var rootData = Identity.dataFromId(oldWebsiteId);
  var self = this;
  Mydataspace.entities.get({
    root: rootData.root,
    path: 'website',
    version: version,
    children: true
  }).then(function(data) {
    var entity = Identity.entityFromData(data);

    var i = $$('entity_tree').getBranchIndex(oldWebsiteId);

    $$('entity_tree').remove(oldWebsiteId);

    $$('entity_tree').add(entity, i, Identity.rootId(oldWebsiteId));

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
 * @param {string} id Parent entity ID
 * @param {boolean} [selectIndexFile]
 */
EntityTree.prototype.resolveChildren = function(id, selectIndexFile) {
  return new Promise(function(resolve, reject) {
    var firstChildId = $$('entity_tree').getFirstChildId(id);
    if (firstChildId != null && firstChildId !== Identity.childId(id, UIHelper.ENTITY_TREE_DUMMY_ID)) {
      resolve();
      return;
    }
    // Load children to first time opened node.
    Mydataspace.request('entities.get', MDSCommon.extend(Identity.dataFromId(id), { children: true }), function(data) {
      var entityId = Identity.idFromData(data);

      var files = data.fields.filter(function (field) { return field.name.indexOf('.') >= 0; }).map(function (field) {
        return {
          id: entityId + '#' + field.name,
          value: field.name,
          associatedData: {},
          data: {}
        };
      });

      var children = data.children.filter(function(x) {
        return (x.root !== 'root' || x.path !== '') && UIConstants.IGNORED_PATHS[UI.getMode()].indexOf(x.path) < 0;
      }).map(Identity.entityFromData);

      UI.entityTree.setChildren(id, files.concat(children));

      if (selectIndexFile) {
        for (var i in files) {
          if (/^index\.[\w-]+$/.test(files[i].value)) {
            $$('entity_tree').select(files[i].id);
            break;
          }
        }
      }

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

      if (parentId !== 'root' && $$('entity_tree').getItem(parentId) == null) {
        continue;
      }

      var entity = Identity.entityFromData(data);

      if ($$('entity_tree').getItem(entity.id) != null) {
        // already exists
        continue;
      }

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


      // Update files in directory has been opened

      var dummyChildId = Identity.childId(entity.id, UIHelper.ENTITY_TREE_DUMMY_ID);
      var firstChildId = $$('entity_tree').getFirstChildId(entity.id);
      if (firstChildId != null && firstChildId === dummyChildId) {
        continue;
      }

      var currentFileIds = self.getFileIds(entity.id);

      res.fields.forEach(function (field) {
        if (field.name.indexOf('.') === -1) {
          return;
        }
        var fileId = entity.id + '#' + field.name;

        var currentFileIndex = currentFileIds.indexOf(fileId);

        if (currentFileIndex >= 0) {
          currentFileIds.splice(currentFileIndex, 1);
          return;
        }

        $$('entity_tree').add({
          id: fileId,
          value: field.name,
          associatedData: {},
          data: {}
        }, 0, entity.id);
      });

      currentFileIds.forEach(function (fileId) {
        $$('entity_tree').remove(fileId);
        if ($$('script_editor_' + fileId)) {
          $$('script_editor').removeView('script_editor_' + fileId);
        }
      });
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

  return Mydataspace.request(req, reqData).then(function(data) {
    // convert received data to TreeView format and load its to entity_tree.
    self.loadFormattedData(data['roots'].map(Identity.entityFromData));
    if (selectedId) {
      self.setCurrentId(selectedId);
    }
    UI.pages.updatePageState('data');
    return data;
  }, function(err) {
    UI.error(err);
    $$('entity_tree').enable();
  });
};


EntityTree.prototype.refresh = function(root) {
  var self = this;
  $$('entity_tree').disable();

  var newRootSkeleton = Router.getNewRootSkeleton();
  if (newRootSkeleton) {
    if (Mydataspace.isLoggedIn()) {
      Router.clear();
      self.requestRoots(true, {}).then(function (data) {
        if (!data) {
          return;
        }
        var prefix = '';
        if (MDSCommon.isPresent(data.roots)) {
          $$('add_root_window').show();
          prefix = '2';
        }
        no_items__selectTemplate(newRootSkeleton, prefix);
      });
    }
  } else if (MDSCommon.isBlank(root) && Router.isEmpty()) {
    if (Mydataspace.isLoggedIn()) {
      self.requestRoots(true, {});
    }
  } else if (MDSCommon.isBlank(root) && Router.isSearch()) {
    self.requestRoots(Router.isMe(), {
      search: Router.getSearch()
    });
  } else if (MDSCommon.isBlank(root) && Router.isFilterByName()) {
    self.requestRoots(Router.isMe(), {
      filterByName: Router.getSearch()
    });

  } else if (MDSCommon.isPresent(root) || Router.isRoot()) {
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
  req.children = true;
  Mydataspace.request('entities.get', req, function(data) {
    var entityId = Identity.idFromData(data);
    var children = data.children.filter(function(child) {
      return UIConstants.IGNORED_PATHS[UI.getMode()].indexOf(child.path) < 0;
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

EntityTree.prototype.getFileIds = function (id) {
  var ret = [];
  var prevChildId = null;
  var childId = $$('entity_tree').getFirstChildId(id);
  while (childId != null && prevChildId !== childId && Identity.isFileId(childId)) {
    ret.push(childId);
    prevChildId = childId;
    childId = $$('entity_tree').getNextSiblingId(childId);
  }
  return ret;
};


EntityTree.prototype.editFile = function (id) {
  var fileName = Identity.getFileNameFromId(id);
  var fileExtInfo = UIHelper.getExtensionInfoForFile(fileName);
  var editorId = 'script_editor_' + id;

  if (!$$(editorId)) {
    $$('$multiline-tabbar1').show();
    $$('script_editor').addView({
      header: fileName,
      close: true,
      css: 'script_editor__tab',
      body: {
        id: editorId,
        rows: [{ view: 'toolbar',
          css: 'script_editor__toolbar',
          elements: [
            { view: 'template',
              borderless: true,
              // id: 'entity_list_breadcrumbs',
              css: 'entity_list__breadcrumbs',
              template: '<div class="admin-breadcrumbs" id="entity_list_breadcrumbs"></div>'
            },
            { view: 'button',
              type: 'icon',
              icon: 'save',
              // id: 'SAVE_ENTITY_LABEL_2',
              label: STRINGS.SAVE_ENTITY,
              autowidth: true,
              tooltip: 'Ctrl + S',
              on: {
                onItemClick: function () {
                  var editor = $$(editorId + '_ace').editor;
                  var request = MDSCommon.extend(Identity.dataFromId(id, {ignoreField: true}), {
                    fields: [{
                      name: Identity.getFileNameFromId(id),
                      type: 'j',
                      value: editor.getValue()
                    }]
                  });
                  Mydataspace.request('entities.change', request).then(function (data) {
                    $('div[button_id="' + editorId + '"]').removeClass('script_editor__tab--dirty');
                    // TODO: unlock editor
                  }, function (err) {
                    // TODO: handle sating error
                  });
                }
              }
            },
            { view: 'button',
              type: 'icon',
              icon: 'search',
              // id: 'SCRIPT_EDITOR_FIND_LABEL_1',
              label: STRINGS.SCRIPT_EDITOR_FIND,
              autowidth: true,
              tooltip: 'Ctrl + F',
              on: {
                onItemClick: function () {
                  var editor = $$(editorId + '_ace').editor;
                  editor.execCommand('find');
                }
              }
            },
            { view: 'button',
              type: 'icon',
              icon: 'sort-alpha-asc',
              // id: 'SCRIPT_EDITOR_REPLACE_LABEL_1',
              label: STRINGS.SCRIPT_EDITOR_REPLACE,
              autowidth: true,
              tooltip: 'Ctrl + H',
              on: {
                onItemClick: function () {
                  var editor = $$(editorId + '_ace').editor;
                  editor.execCommand('replace');
                }
              }
            } //, {}
          ]
        }, {
          view: 'ace-editor',
          mode: fileExtInfo.mode,
          id: editorId + '_ace',
          show_hidden: true,
          on: {
            onReady: function (editor) {
              editor.getSession().setTabSize(2);
              editor.getSession().setUseSoftTabs(true);
              editor.getSession().setUseWorker(false);
              editor.commands.addCommand({
                name: 'save',
                bindKey: {win: 'Ctrl-S'},
                exec: function (editor) {
                  var request = MDSCommon.extend(Identity.dataFromId(id, {ignoreField: true}), {
                    fields: [{
                      name: Identity.getFileNameFromId(id),
                      type: 'j',
                      value: editor.getValue()
                    }]
                  });

                  Mydataspace.request('entities.change', request).then(function (data) {
                    var $tab = $('div[button_id="' + editorId + '"]');
                    $tab.removeClass('script_editor__tab--dirty');
                    $tab.removeClass('script_editor__tab--error');
                    editor.getSession().clearAnnotations();
                  }, function (err) {
                    if (err.name === 'CodeError') {
                      $('div[button_id="' + editorId + '"]').addClass('script_editor__tab--error');
                      editor.getSession().setAnnotations([{
                        row: err.line - 1,
                        column: err.column,
                        text: err.message,
                        type: 'error'
                      }]);
                    } else {
                      $('div[button_id="script_editor_' + id + '"]').addClass('script_editor__tab--error');
                      UI.error(err);
                    }
                  });
                }
              });
            }
          }
        }]
      }
    });

    Mydataspace.request('entities.get', Identity.dataFromId(id)).then(function (data) {
      $$(editorId + '_ace').setValue(data.fields[0].value);
      $$(editorId + '_ace').editor.on('change', function () {
        $('div[button_id="' + editorId + '"]').addClass('script_editor__tab--dirty');
      });
    });
  }
  $$('script_editor').show();
  $$('script_editor').setValue(editorId);

  var fileParentId = Identity.getEntityIdFromFileId(id);
  UI.entityList.updateBreadcrumbs(id);
  UI.setCurrentId(fileParentId);
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
      if ($$('entity_tree').getFirstId() == null) {
        document.getElementById('no_items__no_apps').style.display = 'none';
        document.getElementById('no_items__no_data').style.display = 'block';
        document.getElementById('no_items').style.display = 'block';
        [1,2,3].forEach(function (value) {
          setTimeout(function () {
            document.getElementById('no_items__new_root_input').focus();
          }, value * 1000);
        });
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

webix.protoUI({
  name:"multiline-tabbar",
  $init:function(){
    //this.attachEvent("onKeyPress", this._onKeyPress);
  },
  defaults:{
    template:function(obj,common) {
      var contentWidth, html, i, leafWidth, resultHTML, style, sum, tabs, verticalOffset, width;

      common._tabs = tabs = common._filterOptions(obj.options);

      html = '<div class="webix_all_tabs">';
      for(i = 0; i<tabs.length; i++) {
        // tab innerHTML
        html += common._getTabHTML(tabs[i]);
      }

      html += '</div>';

      return html;
    }
  },
  _getInputNode:function(){
    return this.$view.getElementsByClassName("multiline-tabbar__tab");
  },
  _getTabHTML: function(tab){
    var	html,
      className = 'multiline-tabbar__tab',
      config = this.config;

    if(tab.id== config.value)
      className+=" webix_selected";

    html = '<div class="' + className + '" button_id="'+tab.id+'" role="tab" aria-selected="'+(tab.id== config.value?"true":"false")+'" tabindex="'+(tab.id== config.value?"0":"-1")+'">';

    var icon = tab.icon?("<span class='webix_icon fa-"+tab.icon+"'></span> "):"";
    html+=icon + tab.value;

    if (tab.close || config.close)
      html+="<span role='button' tabindex='0' aria-label='"+webix.i18n.aria.closeTab+"' class='multiline-tabbar__tab-close webix_tab_close webix_icon fa-times'></span>";

    html += '</div>';
    return html;
  }
}, webix.ui.segmented);

webix.protoUI({
  name:"multiline-tabview",
  defaults:{
    type:"clean"
  },
  setValue:function(val){
    this._cells[0].setValue(val);
  },
  getValue:function(){
    return this._cells[0].getValue();
  },
  getTabbar:function(){
    return this._cells[0];
  },
  getMultiview:function(){
    return this._cells[1];
  },
  addView:function(obj){
    var id = obj.body.id = obj.body.id || webix.uid();

    this.getMultiview().addView(obj.body);

    obj.id = obj.body.id;
    obj.value = obj.header;
    delete obj.body;
    delete obj.header;

    var t = this.getTabbar();
    t.addOption(obj);
    t.refresh();

    return id;
  },
  removeView:function(id){
    var t = this.getTabbar();
    t.removeOption(id);
    t.refresh();
  },
  $init:function(config){
    this.$ready.push(this._init_tabview_handlers);

    var cells = config.cells;
    var tabs = [];

    webix.assert(cells && cells.length, "tabview must have cells collection");

    for (var i = cells.length - 1; i >= 0; i--){
      var view = cells[i].body||cells[i];
      if (!view.id) view.id = "view"+webix.uid();
      tabs[i] = { value:cells[i].header, id:view.id, close:cells[i].close, width:cells[i].width, hidden:  !!cells[i].hidden};
      cells[i] = view;
    }

    var tabbar = { view:"multiline-tabbar", multiview:true };
    var mview = { view:"multiview", cells:cells, animate:(!!config.animate) };

    if (config.value)
      tabbar.value = config.value;

    if (config.tabbar)
      webix.extend(tabbar, config.tabbar, true);
    if (config.multiview)
      webix.extend(mview, config.multiview, true);

    tabbar.options = tabbar.options || tabs;

    config.rows = [
      tabbar, mview
    ];

    delete config.cells;
    delete config.tabs;
  },
  _init_tabview_handlers:function(){
    this.getTabbar().attachEvent("onOptionRemove", function(id){
      var view = webix.$$(id);
      if (view)
        view.destructor();
    });
  }
}, webix.ui.layout);
UILayout.windows.addApp = {
    view: 'ModalDialog',
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
    view: 'ModalDialog',
    id: 'add_root_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.ADD_ROOT,
    on: UIControls.getOnForFormWindow('add_root', {
      onShow: function (id) {
        if (PROJECT_NAME === 'web20') {
          no_items__selectTemplate(STRINGS.default_template, 2);
        }
      }
    }),
    body: {
      view: 'form',
      id: 'add_root_form',
      borderless: true,
      on: {
        onSubmit: function() {
          if (!$$('add_root_form').validate({ disabled: true })) {
            UIControls.removeSpinnerFromWindow('add_root_window');
            return;
          }

          // Send request to create new root entity
          var data = $$('add_root_form').getValues();
          data.path = '';
          data.fields = [];

          var sourceRoot = $('#no_items__template_wrap2').data('root');
          if (sourceRoot && sourceRoot !== 'root') {
            data.sourceRoot = sourceRoot;
            data.sourcePath = '';
          }

          Mydataspace.request('entities.create', data).then(function () {
            return Mydataspace.request('apps.create', {
              name: data.root,
              url: 'https://' + data.root + SITE_SUPER_DOMAIN,
              description: 'Automatically created application for website ' + data.root + SITE_SUPER_DOMAIN + '. Please do not change it'
            });
          }).then(function (app) {
            if (!app || !sourceRoot || sourceRoot === 'root') {
              return;
            }

            return Promise.all([Mydataspace.request('entities.change', {
              root: data.root,
              path: '',
              fields: [{name: 'name', value: '', type: 's'}]
            }), Mydataspace.request('entities.change', {
              root: data.root,
              path: 'website/public_html/js',
              fields: [{
                name: 'client.js',
                value: '//\n' +
                '// This file generated automatically. Please do not edit it.\n' +
                '//\n' +
                '\n' +
                'var MDSWebsite = new MDSClient({\n' +
                '  clientId: \'' + app.clientId + '\',\n' +
                '  permission: \'' + data.root + '\'\n' +
                '}).getRoot(\'' + data.root + '\');\n' +
                'MDSWebsite.connect();',
                type: 'j'
              }]
            })]);
          }).then(function () {
            $$('add_root_window').hide();
            UIControls.removeSpinnerFromWindow('add_root_window');
          }).catch(function (err) {
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
        { view: 'template',
          borderless: true,
          height: 160,
          hidden: PROJECT_NAME !== 'web20',
          template: '<div style="margin-bottom: 5px; margin-top: -5px;">' + STRINGS.select_template_label + '</div>' +
          '<div id="no_items__template_wrap2" class="no_items__template_wrap" onclick="no_items__initTemplates(2)">\n' +
          '  <div id="no_items__template2" class="snippet__overview snippet__overview--no-margin">\n' +
          '    <img id="no_items__template_img2" class="snippet__image"  />\n' +
          '    <div class="snippet__info" style="padding-bottom: 0">\n' +
          '      <div id="no_items__template_title2" class="snippet__title"></div>\n' +
          '      <div id="no_items__template_description2" class="snippet__description snippet__description--full"></div>\n' +
          // '      <div id="no_items__template_tags2" class="snippet__tags"></div>\n' +
          '    </div>\n' +
          '  </div>\n' +
          '</div>'
        },
        { view: 'text', id: 'NAME_LABEL', label: STRINGS.NAME, required: true, name: 'root', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getRootTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_root')
      ]
    }
};

UILayout.windows.addEntity = {
    view: 'ModalDialog',
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
          var window = $$('add_entity_window');
          var form = this;

          if (!form.validate({ disabled: true })) {
            UIControls.removeSpinnerFromWindow('add_entity_window');
            return;
          }

          var formData = form.getValues();
          var destFolderId = window.getShowData().entityId || UI.entityList.getCurrentId();
          var newEntityId = Identity.childId(destFolderId, formData.name);
          var data = Identity.dataFromId(newEntityId);

          data.fields = [];
          data.othersCan = formData.othersCan;
          Mydataspace.request('entities.create', data, function() {
            window.hide();
            UIControls.removeSpinnerFromWindow('add_entity_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_entity_window');
            if (err.name === 'SequelizeUniqueConstraintError') {
              form.elements.name.define('invalidMessage', 'Name already exists');
              form.markInvalid('name', true);
            } else {
              UI.error(err);
            }
          });
        }
      },
      elements: [
        { view: 'text',
          required: true,
          id: 'NAME_LABEL_1',
          label: STRINGS.NAME,
          name: 'name',
          labelWidth: UIHelper.LABEL_WIDTH
        },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_entity')
      ],

      rules: {
        name: function(value) {
          return /^[\w-]+$/.test(value);
        }
      }
    }
};

UILayout.windows.cloneEntity = {
    view: 'ModalDialog',
    id: 'clone_entity_window',
    width: 350,
    position: 'center',
    modal: true,
    head: STRINGS.CLONE_ENTITY,
    on: UIControls.getOnForFormWindow('clone_entity', {
      onShow: function () {
        var entityId = this.getShowData().entityId;
        var data = Identity.dataFromId(entityId);
        if (Identity.isFileId(entityId)) {
          $$('NAME_LABEL_11').setValue(Identity.getFileNameFromId(entityId));
          $$('clone_entity_others_can').hide();
          $$('NAME_LABEL_11').show();
        } else {
          $$('clone_entity_others_can').show();
          $$('NAME_LABEL_11').hide();
        }

        var path = data.path.match(/^((website\/[\w-]+)|([\w-]+))/);
        if (!path) {
          return;
        }
        path = path[1];
        var options;
        switch (path) {
          case 'website/tasks':
            options = [
              { id: 'website/tasks', value: 'tasks', icon: UIConstants.ENTITY_ICONS['tasks'] }
            ];
            break;
          case 'website/scss':
            options = [
              { id: 'website/scss', value: 'scss', icon: UIConstants.ENTITY_ICONS['scss'] },
              { id: 'website/public_html', value: 'public_html', icon: UIConstants.ENTITY_ICONS['public_html'] },
              { id: 'website/includes', value: 'includes', icon: UIConstants.ENTITY_ICONS['includes'] },
              { id: 'website/generators', value: 'generators', icon: UIConstants.ENTITY_ICONS['generators'] }
            ];
            break;
          case 'website/generators':
          case 'website/includes':
          case 'website/wizards':
          case 'website/public_html':
            options = [
              { id: 'website/public_html', value: 'public_html', icon: UIConstants.ENTITY_ICONS['public_html'] },
              { id: 'website/includes', value: 'includes', icon: UIConstants.ENTITY_ICONS['includes'] },
              { id: 'website/generators', value: 'generators', icon: UIConstants.ENTITY_ICONS['generators'] }
            ];
            break;
          case 'protos':
          case 'data':
            options = [
              { id: 'data', value: 'data', icon: UIConstants.ENTITY_ICONS['data'] },
              { id: 'protos', value: 'protos', icon: UIConstants.ENTITY_ICONS['protos'] }
            ];
            break;
          default:
            options = [
              { id: 'data', value: 'data', icon: UIConstants.ENTITY_ICONS['data'] },
              { id: 'website/public_html', value: 'public_html', icon: UIConstants.ENTITY_ICONS['public_html'] },
            ];
            break;
        }

        $$('CLONE_ENTITY_LOCATION_LABEL').setValue(path);
        $$('CLONE_ENTITY_LOCATION_LABEL').define('options', options);
        $$('CLONE_ENTITY_LOCATION_LABEL').refresh();
      }
    }, 'path'),
    body: {
      view: 'form',
      id: 'clone_entity_form',
      borderless: true,
      on: {
        onSubmit: function() {
          var window = $$('clone_entity_window');
          var form = this;
          if (!form.validate({ disabled: true })) {
            UIControls.removeSpinnerFromWindow(window);
            return;
          }

          var formData = form.getValues();
          var entityId = window.getShowData().entityId;
          var entityData = Identity.dataFromId(entityId);
          var path = MDSCommon.getChildPath(formData.location, formData.path);
          var req;

          if (Identity.isFileId(entityId)) {
            var filename = Identity.getFileNameFromId(entityId);
            req = Mydataspace.entities.get({
              root: entityData.root,
              path: entityData.path
            }).then(function (sourceData) {
              return Mydataspace.entities.change({
                root: entityData.root,
                path: path,
                fields: [{
                  name: formData.name,
                  value: MDSCommon.findValueByName(sourceData.fields, filename),
                  type: 's'
                }]
              });
            });
          } else {
            var data = {
              root: entityData.root,
              path: path,
              othersCan: formData.othersCan,
              fields: [],
              sourceRoot: entityData.root,
              sourcePath: entityData.path,
              sourceVersion: entityData.version
            };
            req = Mydataspace.entities.create(data).catch(function (err) {
              if (err.name === 'SequelizeUniqueConstraintError') {
                data.path += '/' + MDSCommon.getEntityName(entityData.path);
                return Mydataspace.entities.create(data);
              } else {
                return Promise.reject(err);
              }
            });
          }

          req.then(function() {
            window.hide();
            UIControls.removeSpinnerFromWindow(window);
          }, function(err) {
            UIControls.removeSpinnerFromWindow(window);

            switch (err.name) {
              case 'EntityDoesNotExist':
                form.markInvalid('path', 'Path does not exists');
                break;
              default:
                for (var i in err.errors) {
                  var e = err.errors[i];
                  switch (e.type) {
                    case 'unique violation':
                      if (e.path === 'entities_root_path') {
                        form.elements.name.define('invalidMessage', 'Name already exists');
                        form.markInvalid('name', true);
                      }
                      break;
                  }
                }
            }
          });
        }
      },
      elements: [
        { view: 'text',
          required: true,
          id: 'NAME_LABEL_11',
          label: STRINGS.NAME,
          name: 'name',
          labelWidth: UIHelper.LABEL_WIDTH
        },
        { view: 'text',
          // required: true,
          id: 'CLONE_ENTITY_PATH_LABEL',
          label: STRINGS.CLONE_ENTITY_PATH,
          name: 'path',
          labelWidth: UIHelper.LABEL_WIDTH,
          placeholder: STRINGS.CLONE_ENTITY_PATH_PLACEHOLDER
        },
        { view: 'richselect',
          required: true, id: 'CLONE_ENTITY_LOCATION_LABEL',
          label: STRINGS.CLONE_ENTITY_LOCATION,
          name: 'location',
          labelWidth: UIHelper.LABEL_WIDTH,
          value: 'public_html'
        },
        UIControls.getEntityTypeSelectTemplate('clone_entity_others_can'),
        UIControls.getSubmitCancelForFormWindow('clone_entity')
      ],

      rules: {
        path: function(value) {
          return /^(([\w-]+)(\/[\w-]+)*)?$/.test(value);
        }
      }
    }
};

UILayout.windows.addTask = {
    view: 'ModalDialog',
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
          var window = $$('add_task_window');
          var form = this;
          if (!$$('add_task_form').validate({ disabled: true })) {
            UIControls.removeSpinnerFromWindow('add_task_window');
            return;
          }

          var formData = form.getValues();
          var newEntityId = Identity.childId(Identity.rootId(window.getShowData().entityId || UI.entityList.getCurrentId()), 'website/tasks/' + formData.name);
          var data = Identity.dataFromId(newEntityId);
          data.fields = [];
          data.othersCan = formData.othersCan;
          Mydataspace.entities.create(data).then(function() {
            window.hide();
            UIControls.removeSpinnerFromWindow('add_task_window');
          }, function(err) {
            UIControls.removeSpinnerFromWindow('add_task_window');
            if (err.name === 'SequelizeUniqueConstraintError') {
              form.elements.name.define('invalidMessage', 'Name already exists');
              form.markInvalid('name', true);
            } else {
              UI.error(err);
            }
          });
        }
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_7', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        // UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_task')
      ],

      rules: {
        name: function(value) {
          return /^[\w-]+$/.test(value);
        }
      }
    }
};

UILayout.windows.addProto = {
    view: 'ModalDialog',
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
          var window = $$('add_proto_window');
          if (!$$('add_proto_form').validate()) {
            UIControls.removeSpinnerFromWindow('add_proto_window');
            return;
          }
          var formData = $$('add_proto_form').getValues();
          var newEntityId = Identity.childId(Identity.rootId(window.getShowData().entityId || UI.entityList.getCurrentId()), 'protos/' + formData.name);
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
      },
      elements: [
        { view: 'text', required: true, id: 'NAME_LABEL_6', label: STRINGS.NAME, name: 'name', labelWidth: UIHelper.LABEL_WIDTH },
        UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_proto')
      ]
    }
};

UILayout.windows.addResource = {
    view: 'ModalDialog',
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
          if (!$$('add_resource_form').validate({ disabled: true })) {
            UIControls.removeSpinnerFromWindow('add_resource_window');
            return;
          }
          var formData = $$('add_resource_form').getValues();
          var newEntityId = Identity.childId(UI.entityList.getCurrentId(), 'test');
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
          view: 'richselect',
          label: STRINGS.ADD_RESOURCE_TYPE,
          name: 'type',
          value: 'file',
          labelWidth: UIHelper.LABEL_WIDTH,
          suggest: {
            template: '<span class="webix_icon fa-#icon#"></span> #value#',
            body: {
              data: [
                { id: 'avatar', value: STRINGS.AVATAR, icon: 'user' },
                { id: 'image', value: STRINGS.IMAGE, icon: 'image' },
                { id: 'file', value: STRINGS.FILE, icon: 'file' }
              ],
              template: '<span class="webix_icon fa-#icon#"></span> #value#'
            }
          }
        },
        // UIControls.getEntityTypeSelectTemplate(),
        UIControls.getSubmitCancelForFormWindow('add_resource')
      ]
    }
};

UILayout.windows.addField = {
  view: 'ModalDialog',
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
        if (!$$('add_field_form').validate({ disabled: true })) {
          return;
        }

        UI.entityForm.addField(
          MDSCommon.extend($$('add_field_form').getValues(), { indexed: 'off' }),
          true,
          UIHelper.isProto(UI.entityForm.getCurrentId()));

        setTimeout(function() {
          $$('add_field_window').hide();
        }, 100);

        setTimeout(function() {
          var n = window.localStorage.getItem('dont_forgot_to_save');
          if (MDSCommon.isPresent(n) && parseInt(n) > 3) {
            return;
          } else if (MDSCommon.isInt(n)) {
            n = parseInt(n) + 1;
          } else {
            n = 1;
          }
          window.localStorage.setItem('dont_forgot_to_save', n.toString());
          UI.info(STRINGS.dont_forgot_to_save);
        }, 600);
      }
    },

    elements: [
      { view: 'text', required: true, id: 'NAME_LABEL_2', label: STRINGS.NAME, name: 'name' },
      MDSCommon.extend(UIControls.getFieldTypeSelectTemplate(), {
        on: {
          onChange: function (newv, oldv) {
            if (newv === '*') {
              $$('VALUE_LABEL').show();
              $$('VALUE_LABEL').define('type', 'password');
              $$('VALUE_LABEL').refresh();
            } else if (oldv === '*') {
              $$('VALUE_LABEL').define('type', 'text');
              $$('VALUE_LABEL').refresh();
            } else if (newv === 'j') {
              $$('VALUE_LABEL').hide();
            } else {
              $$('VALUE_LABEL').show();
            }
          }
        }
      }),
      { view: 'text', id: 'VALUE_LABEL', label: STRINGS.VALUE, name: 'value' },
      UIControls.getSubmitCancelForFormWindow('add_field', false)
    ],

    rules: {
      name: function(value) {
        return /^[\w-]+$/.test(value) && typeof $$('entity_form__' + value) === 'undefined'
      },
      value: function(value) {
        var values = $$('add_field_form').getValues();
        var typeInfo = Fields.FIELD_TYPES[values.type];
        return typeof typeInfo !== 'undefined' && typeInfo.isValidValue(value);
      }
    }
  }
};

UILayout.windows.addFile = {
  view: 'ModalDialog',
  id: 'add_file_window',
  width: 300,
  position: 'center',
  modal: true,
  move:true,
  resize: true,
  head: STRINGS.ADD_FILE,
  on: UIControls.getOnForFormWindow('add_file', {
    onShow: function (id) {
      var options;
      switch (this.getShowData().fileType) {
        case 'scss':
          options = [
            { id: 'scss', value: 'SCSS File (*.scss)' },
            { id: 'css', value: 'CSS File (*.css)' }
          ];
          break;
        case 'pug':
          options = [
            { id: 'pug', value: 'Pug File (*.pug)' },
            { id: 'html', value: 'HTML File (*.html)' }
          ];
          break;
        default:
          options = [
            { id: 'pug', value: 'Pug File (*.pug)' },
            { id: 'html', value: 'HTML File (*.html)' },
            { id: 'scss', value: 'SCSS File (*.scss)' },
            { id: 'css', value: 'CSS File (*.css)' },
            { id: 'xml', value: 'XML File (*.xml)' },
            { id: 'js', value: 'JavaScript File (*.js)' },
            { id: 'jsx', value: 'ReactJS File (*.jsx)' },
            { id: 'json', value: 'JSON File (*.json)' },
            { id: 'yml', value: 'YAML File (*.yml)' },
            { id: 'txt', value: 'Text File (*.txt)' }
          ];
          break;
      }

      $$('NAME_LABEL_8').define('placeholder', STRINGS.ADD_FILE_NAME_PLACEHOLDER + (this.getShowData().fileType || 'html'));
      $$('NAME_LABEL_8').refresh();

      $$('FILE_TYPE_LABEL').define('options', options);
      $$('FILE_TYPE_LABEL').refresh();
    }
  }, 'name'),
  body: {
    view: 'form',
    id: 'add_file_form',
    borderless: true,
    on: {
      onSubmit: function() {
        var form = this;
        var window = $$('add_file_window');

        if (!form.validate({ disabled: true })) {
          UIControls.removeSpinnerFromWindow('add_file_window');
          return;
        }

        var formData = form.getValues();

        var filenameParts = formData.name.trim().split('.');

        var req = MDSCommon.extend(Identity.dataFromId(window.getShowData().entityId || UI.entityList.getCurrentId()), {
          fields: [{
            name: filenameParts[0] + '.' + formData.type,
            value: '',
            type: 'j'
          }]
        });

        // TODO: add file
        Mydataspace.request('entities.change', req).then(function (data) {
          $$('add_file_window').hide();
          UIControls.removeSpinnerFromWindow('add_file_window');
        }, function (err) {
          UIControls.removeSpinnerFromWindow('add_file_window');
        });
      }
    },

    elements: [
      { view: 'text',
        required: true,
        id: 'NAME_LABEL_8',
        label: STRINGS.NAME,
        name: 'name',
        on: {
          onChange: function () {
            var filename = this.getValue();
            var parts = filename.split('.');
            if (parts.length > 2) {
              return false;
            }
            $$('FILE_TYPE_LABEL').setValue(parts[1]);
          },
          onTimedKeyPress: function () {
            var filenameParts = this.getValue().trim().split('.');
            if (filenameParts.length > 2 || MDSCommon.isBlank(filenameParts[1])) {
              return;
            }
            $$('FILE_TYPE_LABEL').setValue(filenameParts[1]);
          }
        }
      },
      {
        view: 'richselect',
        required: true,
        id: 'FILE_TYPE_LABEL',
        label: STRINGS.FILE_TYPE,
        name: 'type',
        placeholder: STRINGS.FILE_TYPE_FROM_EX,
        options: [
        ]
      },
      UIControls.getSubmitCancelForFormWindow('add_file', false)
    ],

    rules: {
      name: function(value) {
        return /^[\w-]+(\.[\w-]+)?$/.test(value);
      }
    }
  }
};

UILayout.windows.showMedia = {
  view: 'ModalDialog',
  id: 'show_media_window',
  css: 'show_media_window',
  width: 900,
  position: 'center',
  animate:{ type: 'flip', subtype:' vertical' },
  autofit: true,
  autofocus: true,
  modal: true,
  head: {
    view: 'toolbar',
    margin: -4,
    cols: [
      { view: 'label',
        label: 'Demo'
      },
      { view: 'icon',
        icon: 'times',
        click: '$$(\'show_media_window\').hide();'
      }
    ]
  },
  on: {
    onShow: function() {
      if (!UI.mediaToShow) {
        $$('show_media_window').hide();
      }
      var data = {};
      switch (UI.mediaToShow.type) {
        case 'image':
          data.media = '<img src="' + UI.mediaToShow.value + '" />';
          break;
        case 'youtube':
          data.media = '<iframe width="100%" height="506" src="https://www.youtube.com/embed/' + UI.mediaToShow.value + '?autoplay=1&amp;rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen=""></iframe>';
          break;
      }

      $$('show_media_window_content').parse(data);

      if (data.height) {
        $$('show_media_window_content').define('height', data.height);
        $$('show_media_window_content').refresh();
      }
    }
  },
  body: { template: '#media#',
    css: 'show_media_window_content',
    id: 'show_media_window_content',
    borderless: true,
    height: 506
  }
};

UILayout.windows.renameFile = {
  view: 'ModalDialog',
  id: 'rename_file_window',
  width: 300,
  position: 'center',
  modal: true,
  head: STRINGS.RENAME_FILE,
  on: UIControls.getOnForFormWindow('rename_file', {
    onShow: function () {
      var currentFileId = this.getShowData().entityId;
      $$('rename_file_form').setValues({
        name: Identity.getFileNameFromId(currentFileId)
      });
      webix.UIManager.setFocus($$('NAME_LABEL_9'));
    }
  }),
  body: {
    view: 'form',
    id: 'rename_file_form',
    borderless: true,
    on: {
      onSubmit: function() {
        var window = $$('rename_file_window');
        var form = this;
        if (!form.validate({ disabled: true })) {
          UIControls.removeSpinnerFromWindow('rename_file_window');
          form.focus('name');
          return;
        }

        var formData = $$('rename_file_form').getValues();
        var currentFileId = window.getShowData().entityId;
        Mydataspace.request('entities.get', Identity.dataFromId(currentFileId)).then(function (data) {
          var entityData = Identity.dataFromId(currentFileId);
          delete entityData.fields;
          var req = MDSCommon.extend(entityData, {
            fields: [{
              name: formData.name,
              value: data.fields[0].value,
              type: 'j'
            }, {
              name: Identity.getFileNameFromId(currentFileId),
              value: null
            }]
          });

          return Mydataspace.request('entities.change', req);
        }).then(function (data) {
          $$('rename_file_window').hide();
          UIControls.removeSpinnerFromWindow('rename_file_window');
        }, function (err) {
          UIControls.removeSpinnerFromWindow('rename_file_window');
        });
      }
    },

    elements: [
      { view: 'text', required: true, id: 'NAME_LABEL_9', label: STRINGS.NAME, name: 'name' },
      UIControls.getSubmitCancelForFormWindow('rename_file', false)
    ],

    rules: {
      name: function(value) {
        return /^[\w_-]+(\.[\w_-]+)+$/.test(value);
      }
    }
  }
};

UILayout.editScriptTabs = {
  text: {
    aceMode: 'text',
    icon: 'align-justify',
    label: 'Text'
  },
  md: {
    aceMode: 'markdown',
    icon: 'bookmark',
    label: 'Markdown'
  },
  json: {
    aceMode: 'json',
    icon: 'ellipsis-h',
    label: 'JSON'
  },
  xml: {
    aceMode: 'xml',
    icon: 'code',
    label: 'XML'
  }
};

UILayout.windows.editScript = {
  view: 'ModalDialog',
  id: 'edit_script_window',
  resize: true,
  position: 'center',
  modal: true,
  head: {
    cols:[
      { width: 15 },
      { view: 'label',
        id: 'edit_script_window_title',
        label: 'Edit Field'
      },
      { view: 'button',
        type: 'icon',
        icon: 'times',
        css: 'webix_el_button--right',
        id: 'CLOSE_LABEL', label: STRINGS.CLOSE,
        width: 70,
        click: function() {
          UI.entityForm.hideScriptEditWindow();
        }
      }
    ]
  },
  width: 900,
  height: 600,
  animate: { type: 'flip', subtype: 'vertical' },
  on: {
    onShow: function() {
      if (this.getShowData().fieldName) {
        var editScriptFieldId = 'entity_form__' + this.getShowData().fieldName + '_value';
        var value = $$(editScriptFieldId).getValue();
        $$('edit_script_window__editor').setValue(value);
        $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
        var ext = editScriptFieldId && $$(editScriptFieldId) && editScriptFieldId.match(/\.([\w]+)_value$/);
        if (ext) {
          this.selectEditScriptTab(ext[1], true);
        }
      } else if (this.getShowData().text) {
        $$('edit_script_window__editor').setValue(this.getShowData().text);
        $$('edit_script_window__editor').getEditor().getSession().setUndoManager(new ace.UndoManager());
      }
    },

    // onBlur: function() {
    //   var editScriptFieldId = 'entity_form__' + this.getShowData().fieldName + '_value';
    //   var field = $$(editScriptFieldId);
    //   if (field) {
    //     field.setValue($$('edit_script_window__editor').getValue());
    //   }
    // },

    onHide: function() {
    }
  },

  body: {
    rows: [
      { view: 'toolbar',
        id: 'edit_script_window__toolbar',
        elements: [
          { view: 'richselect',
            width: 150,
            value: 'text',
            options: Object.keys(UILayout.editScriptTabs).map(function (id) {
              var tab = UILayout.editScriptTabs[id];
              return {
                icon: tab.icon,
                value: tab.label,
                id: tab.aceMode
              };
            }),
            on: {
              onChange: function (newv, oldv) {
                var editor = $$('edit_script_window__editor').editor;
                editor.getSession().setMode('ace/mode/' + newv);
              }
            }
          },
          { },
          { view: 'button',
            type: 'icon',
            icon: 'save',
            id: 'SAVE_ENTITY_LABEL_1',
            label: STRINGS.SAVE_ENTITY,
            autowidth: true,
            on: {
              onItemClick: function () {
                var window = $$('edit_script_window');
                var editor = $$('edit_script_window__editor').editor;
                var fieldId = 'entity_form__' + window.getShowData().fieldName + '_value';
                if (fieldId && $$(fieldId)) {
                  $$(fieldId).setValue(editor.getValue());
                }
                UI.entityForm.save();
              }
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'search',
            id: 'SCRIPT_EDITOR_FIND_LABEL',
            label: STRINGS.SCRIPT_EDITOR_FIND,
            autowidth: true,
            tooltip: 'Ctrl + F',
            on: {
              onItemClick: function () {
                var editor = $$('edit_script_window__editor').editor;
                editor.execCommand('find');
              }
            }
          },
          { view: 'button',
            type: 'icon',
            icon: 'sort-alpha-asc',
            id: 'SCRIPT_EDITOR_REPLACE_LABEL',
            label: STRINGS.SCRIPT_EDITOR_REPLACE,
            autowidth: true,
            tooltip: 'Ctrl + H',
            on: {
              onItemClick: function () {
                var editor = $$('edit_script_window__editor').editor;
                editor.execCommand('replace');
              }
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
            var window = $$('edit_script_window');
            editor.getSession().setTabSize(2);
            editor.getSession().setUseSoftTabs(true);
            editor.setReadOnly(true);
            editor.getSession().setUseWorker(false);
            editor.getSession().setMode('ace/mode/text');
            editor.commands.addCommand({
              name: 'save',
              bindKey: { win: 'Ctrl-S' },
              exec: function(editor) {
                var fieldId = 'entity_form__' + window.getShowData().fieldName + '_value';
                if (fieldId && $$(fieldId)) {
                  $$(fieldId).setValue(editor.getValue());
                }
                UI.entityForm.save();
              }
            });
            editor.on('change', function() {
              var fieldId = 'entity_form__' + window.getShowData().fieldName + '_value';
              if (fieldId && $$(fieldId)) {
                $$(fieldId).setValue(editor.getValue());
              }
            });
          }
        }
      }
    ]
  }
};

UILayout.windows.addWebsite = {
  view: 'ModalDialog',
  id: 'add_website_window',
  width: 350,
  position: 'center',
  modal: true,
  head: STRINGS.add_website,
  on: UIControls.getOnForFormWindow('add_website'),
  body: {
    view: 'form',
    id: 'add_website_form',
    borderless: true,
    on: {
      onSubmit: function() {
        if (!$$('add_website_form').validate()) {
          UIControls.removeSpinnerFromWindow('add_website_window');
          return;
        }

        var formData = $$('add_website_form').getValues();
        var newEntityId = Identity.childId(UI.entityList.getCurrentId(), formData.name);
        var data = Identity.dataFromId(newEntityId);
        data.path = 'website';
        data.fields = [];
        data.othersCan = formData.othersCan;
        Mydataspace.request('entities.create', data, function() {
          $$('add_website_window').hide();
          UIControls.removeSpinnerFromWindow('add_website_window');
        }, function(err) {
          UIControls.removeSpinnerFromWindow('add_website_window');
          if (err.name === 'SequelizeUniqueConstraintError') {
            $$('add_website_form').elements.name.define('invalidMessage', 'Name already exists');
            $$('add_website_form').markInvalid('name', true);
          } else {
            UI.error(err);
          }
        });
      }
    },
    elements: [
      UIControls.getEntityTypeSelectTemplate(),
      UIControls.getSubmitCancelForFormWindow('add_website')
    ]
  }
};

UILayout.windows.changeVersion = {
  view: 'ModalDialog',
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
        root: Identity.dataFromId(UI.entityList.getCurrentId()).root
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
              switch ($$('change_version_window').mode) {
                case 'switch':
                  UI.entityTree.changeCurrentRootVersion(UI.entityList.getCurrentId(), version);
                  break;
                case 'view':
                  UI.entityTree.viewRootVersion(UI.entityList.getCurrentId(), version);
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
    view: 'ModalDialog',
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

UILayout.windows.addGenerator = {
  view: 'ModalDialog',
  id: 'add_generator_window',
  width: 350,
  position: 'center',
  modal: true,
  head: STRINGS.new_generator,
  on: UIControls.getOnForFormWindow('add_generator', null, 'name'),
  body: {
    view: 'form',
    id: 'add_generator_form',
    borderless: true,
    on: {
      onSubmit: function() {
        var window = $$('add_generator_window');
        var form = this;

        if (!form.validate({ disabled: true })) {
          UIControls.removeSpinnerFromWindow('add_generator_window');
          return;
        }

        var formData = form.getValues();
        var data = Identity.dataFromId(window.getShowData().entityId || UI.entityList.getCurrentId());
        data.path += '/' + formData.name;
        data.fields = [
          { name: 'dataFolder', value: formData.dataFolder, type: 's' },
          { name: 'cacheFolder', value: formData.cacheFolder, type: 's' }
        ];

        Mydataspace.entities.create(data).then(function() {
          window.hide();
          UIControls.removeSpinnerFromWindow('add_generator_window');
        }, function(err) {
          UIControls.removeSpinnerFromWindow('add_generator_window');
          if (err.name === 'SequelizeUniqueConstraintError') {
            form.elements.name.define('invalidMessage', 'Name already exists');
            form.markInvalid('name', true);
          } else {
            UI.error(err);
          }
        });
      }
    },
    elements: [
      { view: 'text',
        required: true,
        id: 'NAME_LABEL_10',
        label: STRINGS.NAME,
        name: 'name',
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { view: 'text',
        id: 'ADD_GENERATOR_SRC_LABEL',
        name: 'dataFolder',
        label: STRINGS.ADD_GENERATOR_SRC,
        labelWidth: UIHelper.LABEL_WIDTH
      },
      { view: 'text',
        id: 'ADD_GENERATOR_DEST_LABEL',
        name: 'cacheFolder',
        label: STRINGS.ADD_GENERATOR_DEST,
        labelWidth: UIHelper.LABEL_WIDTH
      },
      UIControls.getSubmitCancelForFormWindow('add_generator')
    ],

    rules: {
      name: function(value) {
        return /^[\w-]+$/.test(value);
      },

      dataFolder: function(value) {
        return /^(([\w-]+)(\/[\w-]+)*)?$/.test(value);
      },

      cacheFolder: function(value) {
        return /^(([\w-]+)(\/[\w-]+)*)?$/.test(value);
      }
    }
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
                        // UI.entityForm.editScriptFieldId = 'entity_form__' + fieldName + '_value';
                        UI.entityForm.showScriptEditWindow('entity_form__' + fieldName + '_value');
                      }
                    }
                  }
                },
                $$('entity_form__' + fieldName),
                $$('entity_form__' + fieldName + '_value')
              );
              switch (newv) {
                //case 'j':
                //  $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').enable();
                //  var fieldIndexed = $$(fieldId + '_indexed').getValue();
                //  $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS[fieldIndexed || 'off']);
                //  $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();
                //  break;
                case '*':
                  $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').disable();
                  $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS['off']);
                  $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();

                  $$('entity_form__' + fieldName + '_value').define('type', 'password');
                  $$('entity_form__' + fieldName + '_value').refresh();
                  break;
                default:
                  $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').enable();
                  $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS[fieldIndexed || 'off']);
                  $$('entity_form__' + UI.entityForm.currentFieldName + '_indexed_button').refresh();

                  $$('entity_form__' + fieldName + '_value').define('type', 'text');
                  $$('entity_form__' + fieldName + '_value').refresh();
                  break;
              }
            } else if (newv === '*') {
              $$('entity_form__' + fieldName + '_value').define('type', 'password');
              $$('entity_form__' + fieldName + '_value').refresh();
            } else if (oldv === '*') {
              $$('entity_form__' + fieldName + '_value').define('type', 'text');
              $$('entity_form__' + fieldName + '_value').refresh();
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
          case 'add_website':
            $$('add_website_window').show();
            break;
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
	width: PROJECT_NAME === 'web20' ? 200 : 150,
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

UILayout.entityContextMenu = {
  view: 'contextmenu',
  css: 'entity-context-menu',
  template: '<i class="fa fa-#icon#" style="width: 23px;"></i> #value#',
  width: 180,
  data:[],
  on: {
    onShow: function () {
      this.data.clearAll();

      var id;
      switch (this.config.id) {
        case 'entity_list_menu':
          id = UI.entityList.getSelectedId();
          break;
        case 'entity_tree_menu':
          id = this._area && this._area.id ? this._area.id : UI.entityTree.getCurrentId();
          break;
        case 'entity_list_new_menu':
          id = document.getElementById('entity_list_breadcrumbs').getAttribute('data-entity-id');
          break;
        case 'entity_form_menu':
          id = UI.entityForm.getCurrentId();
          break;
        default:
          throw new Error();
      }

      var itemData = Identity.dataFromId(id);
      var menuItems = [];

      this.data.add({
        id: 'edit',
        value: STRINGS.context_menu.edit,
        icon: 'edit'
      });

      this.data.add({ $template: 'Separator' });

      if (Identity.isFileId(id)) {
        menuItems.push({
          id: 'rename_file',
          value: STRINGS.context_menu.rename_file
        });
        menuItems.push({
          id: 'copy_file',
          value: STRINGS.context_menu.copy_file
        });
        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_file',
          value: STRINGS.context_menu.delete_file
        });
      } else if (Identity.isRootId(id)) {
        menuItems.push({
          id: 'regenerate_cache',
          value: STRINGS.context_menu.regenerate_cache
        });
        menuItems.push({
          id: 'new_resource',
          value: STRINGS.context_menu.new_resource
        });
        // menuItems.push({
        //   id: 'new_generator',
        //   value: STRINGS.context_menu.new_generator
        // });
        menuItems.push({
          id: 'new_proto',
          value: STRINGS.context_menu.new_proto
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_root
        });
      } else if (itemData.path === 'tasks' || itemData.path === 'website/tasks') {
        menuItems.push({
          id: 'new_task',
          value: STRINGS.context_menu.new_task
        });
      } else if (itemData.path === 'protos') {
        menuItems.push({
          id: 'new_proto',
          value: STRINGS.context_menu.new_proto
        });
      } else if (itemData.path === 'resources') {
        menuItems.push({
          id: 'new_resource',
          value: STRINGS.context_menu.new_resource
        });
      } else if (itemData.path === 'website') {
        menuItems.push({
          id: 'new_generator',
          value: STRINGS.context_menu.new_generator
        });
        menuItems.push({
          id: 'new_task',
          value: STRINGS.context_menu.new_task
        });
      } else if (itemData.path === 'data') {
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path === 'cache') {
        menuItems.push({
          id: 'regenerate_cache',
          value: STRINGS.context_menu.regenerate_cache
        });
      } else if (itemData.path === 'website/includes') {
        menuItems.push({
          id: 'new_pug',
          value: STRINGS.context_menu.new_pug
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path === 'website/scss') {
        menuItems.push({
          id: 'new_scss',
          type: 'scss',
          value: STRINGS.context_menu.new_scss
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path === 'website/public_html' || itemData.path === 'website/wizards') {
        menuItems.push({
          id: 'new_file',
          value: STRINGS.context_menu.new_file
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path === 'website/generators') {
        menuItems.push({
          id: 'new_generator',
          value: STRINGS.context_menu.new_generator
        });
      } else if (itemData.path === 'processes') {
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
      } else if (itemData.path.indexOf('processes/') === 0) {
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/tasks/') === 0) {
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });
        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/generators/') === 0) {
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });

        menuItems.push({
          id: 'new_file',
          value: STRINGS.context_menu.new_file
        });

        menuItems.push({
          id: 'regenerate_cache',
          value: STRINGS.context_menu.regenerate_cache
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/includes/') === 0) {
        menuItems.push({
          id: 'new_pug',
          value: STRINGS.context_menu.new_pug
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/public_html/') === 0 || itemData.path.indexOf('website/wizards/') === 0) {
        menuItems.push({
          id: 'new_file',
          value: STRINGS.context_menu.new_file
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('resources/') === 0) {
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('website/scss/') === 0) {
        menuItems.push({
          id: 'new_scss',
          value: STRINGS.context_menu.new_scss
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      } else if (itemData.path.indexOf('data/') === 0 || itemData.path.indexOf('protos/') === 0) {
        menuItems.push({
          id: 'copy_entity',
          value: STRINGS.context_menu.copy_entity
        });
        menuItems.push({
          id: 'new_entity',
          value: STRINGS.context_menu.new_entity
        });

        menuItems.push({ $template: 'Separator' });
        menuItems.push({
          id: 'delete_entity',
          value: STRINGS.context_menu.delete_entity
        });
      }

      var i;

      for (i in menuItems) {
        var item = menuItems[i];
        switch (item.id) {
          case 'delete_entity':
          case 'delete_file':
            item.icon = 'times';
            break;
          case 'copy_entity':
          case 'copy_file':
            item.icon = 'copy';
            break;
          case 'regenerate_cache':
            item.icon = 'clock-o';
            break;
          case 'new_resource':
            item.icon = 'file-photo-o';
            break;
          case 'new_proto':
            item.icon = 'cube';
            break;
          case 'new_file':
            item.icon = 'file-text-o';
            break;
          case 'new_pug':
          case 'new_scss':
            item.icon = 'file-code-o';
            break;
          case 'new_entity':
            item.icon = 'folder-o';
            break;
          case 'new_generator':
            item.icon = 'asterisk';
            break;
          case 'new_task':
            item.icon = 'code';
            break;
          case 'rename_file':
            item.icon = 'pencil';
            break;
        }
        this.data.add(item);
      }
    },

    onItemClick: function (id) {
      var entityId;
      switch (this.config.id) {
        case 'entity_list_menu':
          entityId = UI.entityList.getSelectedId();
          break;
        case 'entity_tree_menu':
          entityId = UI.entityTree.getSelectedId();
          break;
        case 'entity_list_new_menu':
          entityId = document.getElementById('entity_list_breadcrumbs').getAttribute('data-entity-id');
          break;
        case 'entity_form_menu':
          entityId = UI.entityForm.getCurrentId();
          break;
        default:
          throw new Error();
      }

      switch (id) {
        case 'copy_file':
        case 'copy_entity':
          EntityForm.prototype.clone(entityId);
          break;
        case 'edit':
          if (Identity.isFileId(entityId)) {
            UI.entityTree.editFile(entityId);
          } else {
            $$('entity_list').select(entityId);
            UI.entityForm.startEditing();
          }
          break;
        case 'delete_root':
        case 'delete_entity':
          webix.confirm({
            title: STRINGS.DELETE_ENTITY,
            text: STRINGS.REALLY_DELETE,
            ok: STRINGS.YES,
            cancel: STRINGS.NO,
            callback: function(result) {
              if (result) {
                UI.entityForm.delete(entityId);
              }
            }
          });
          break;
        case 'new_entity':
          $$('add_entity_window').showWithData({ entityId: entityId });
          break;
        case 'new_resource':
          $$('add_resource_window').showWithData({ entityId: entityId });
          break;
        case 'new_task':
          $$('add_task_window').showWithData({ entityId: entityId });
          break;
        case 'new_proto':
          $$('add_proto_window').showWithData({ entityId: entityId });
          break;
        case 'new_pug':
          $$('add_file_window').showWithData({ entityId: entityId, fileType: 'pug' });
          break;
        case 'new_scss':
          $$('add_file_window').showWithData({ entityId: entityId, fileType: 'scss' });
          break;
        case 'new_file':
          $$('add_file_window').showWithData({ entityId: entityId });
          break;
        case 'regenerate_cache':
          webix.confirm({
            title: STRINGS.DELETE_FILE,
            text: STRINGS.REALLY_DELETE,
            ok: STRINGS.YES,
            cancel: STRINGS.NO,
            callback: function(result) {
              if (!result) {
                return;
              }

              var req = MDSCommon.extend(Identity.dataFromId(entityId, {ignoreField: true}), {
                fields: [{
                  name: Identity.getFileNameFromId(entityId),
                  value: null
                }]
              });

              Mydataspace.emit('entities.create', req);
            }
          });
          break;
        case 'delete_file':
          webix.confirm({
            title: STRINGS.DELETE_FILE,
            text: STRINGS.REALLY_DELETE,
            ok: STRINGS.YES,
            cancel: STRINGS.NO,
            callback: function(result) {
              if (!result) {
                return;
              }

              var req = MDSCommon.extend(Identity.dataFromId(entityId, {ignoreField: true}), {
                fields: [{
                  name: Identity.getFileNameFromId(entityId),
                  value: null
                }]
              });

              Mydataspace.emit('entities.change', req);
            }
          });
          break;
        case 'rename_file':
          $$('rename_file_window').showWithData({ entityId: entityId });
          break;
        case 'new_generator':
          $$('add_generator_window').showWithData({entityId: entityId});
          break;
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
                      '<a class="profile__access_key_link" href="javascript: void(0)" onclick="return UI.showAccessToken()">' + STRINGS.SHOW_ACCESS_KEY + '</a>' +
                    '</div>',
          data: {
            avatar: '/images/no_avatar.svg',
            name: ''
          }
        },
        { view: 'template',
          borderless: true,
          hidden: true,
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
      { view: 'switch',
        width: 100,
        css: 'menu__mode_switch',
        onLabel: 'CMS',
        offLabel: 'Dev',
        value: window.localStorage.getItem('uiMode') === 'cms' ? 1 : 0,
        on: {
          onChange: function(newv, oldv) {
            UI.setMode(newv ? 'cms' : 'dev');
          }
        }
      },
      { view: 'button',
        width: 85,
        css: 'menu__language_button ' + (PROJECT_NAME === 'web20' ? ' menu__language_button--get_started' : ''),
        id: 'PRICING_LABEL',
        label: STRINGS.PRICING,
        hidden: PROJECT_NAME !== 'web20',
        click: function() {
          var currentLang = getCurrentLanguage().toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/pricing', '_blank');
        }
      },
      { view: 'button',
        width: 140,
        css: 'menu__language_button',
        id: 'DOCS_LABEL',
        label: STRINGS.DOCS,
        click: function() {
          var currentLang = getCurrentLanguage().toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/docs', '_blank');
        }
      },
      { view: 'button',
        width: 100,
        css: 'menu__language_button',
        id: 'SKELETONS_LABEL',
        label: STRINGS.SKELETONS,
        hidden: PROJECT_NAME !== 'web20',
        click: function() {
          var currentLang = getCurrentLanguage().toLowerCase();
          currentLang = currentLang === 'en' ? '' : '/' + currentLang;
          window.open(currentLang + '/search', '_blank');
        }
      },

      { width: 20, css: 'menu__spacer' },
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

UILayout.entityTree = {
  id: 'my_data_panel__left_panel',
  gravity: 0.2,
  hidden: window.parent !== window || webix.without_header,
  rows: [
    {
      view: 'toolbar',
      elements: [
        {
          view: 'button',
          type: 'icon',
          icon: 'plus',
          id: 'ADD_ROOT_LABEL', label: STRINGS.ADD_ROOT,
          hidden: true,
          width: 120,
          click: function () {
            $$('add_root_window').show();
          }
        },
        {},
        {
          view: 'button',
          type: 'icon',
          icon: 'refresh',
          id: 'REFRESH_LABEL', label: STRINGS.REFRESH,
          width: 30,
          click: function () {
            UI.entityTree.refresh();
          }
        }
      ]
    },
    {
      view: 'tree',
      id: 'entity_tree',
      css: 'entity_tree',
      gravity: 0.4,
      select: true,
      template: function (obj, common) {
        var path = Identity.dataFromId(obj.id).path;

        var isTopLevelEntity = path.indexOf('/') < 0 && UIConstants.SYSTEM_PATHS.indexOf(path) < 0;
        if (obj.id.indexOf('#') >= 0) {

          return common.icon(obj, common) +
            '<div class="webix_tree_folder_open fa fa-file-code-o webix_tree_folder_open--file"></div>' +
            '<span class="webix_tree_item__name webix_tree_item__name--file">' + obj.value + '</span>';

        } else if (path === '') { // root
          if (!obj.associatedData.fields) {
            obj.associatedData.fields = [];
          }
          var ava = MDSCommon.findValueByName(obj.associatedData.fields, 'avatar');
          var name = MDSCommon.findValueByName(obj.associatedData.fields, 'name') || obj.value;
          var description = MDSCommon.findValueByName(obj.associatedData.fields, 'name') ? obj.associatedData.root : null;
          var avatarURL = MDSCommon.isBlank(ava) ? '/images/icons/root.svg' : Mydataspace.options.cdnURL + '/avatars/sm/' + ava + '.png';
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
        onBeforeContextMenu: function (id) {
          this.select(id);
        },

        onAfterLoad: function () {
          if (!UI.entityTree.getCurrentId()) {
            UI.entityTree.setCurrentIdToFirst();
          }
          $$('entity_tree').select(UI.entityTree.getCurrentId());
          $$('entity_tree').open(UI.entityTree.getCurrentId());
        },

        onBeforeOpen: function (id) {
          UI.entityTree.resolveChildren(id);
        },

        onSelectChange: function (ids) {
          var id = ids[0];
          if (UIHelper.isTreeShowMore(id)) {
            $$('entity_tree').select(UI.entityTree.getCurrentId());
          } else if (Identity.isFileId(id)) {
            UI.entityTree.editFile(id);
          } else {
            $$('script_editor').setValue('my_data_panel__central_panel');
            UI.setCurrentId(id);
            UI.entityList.updateBreadcrumbs(id);
          }
        },

        onBeforeSelect: function (id, selection) {
          // Request and add more items if "Show More" clicked
          if (UIHelper.isTreeShowMore(id)) {
            UI.entityTree.showMore(Identity.parentId(id));
          }
        }
      }
    }
  ]
};


UILayout.entityList =
{ id: 'my_data_panel__central_panel',
  rows: [
    { view: 'toolbar',
      cols: [
        { view: 'template',
          borderless: true,
          // id: 'entity_list_breadcrumbs',
          css: 'entity_list__breadcrumbs',
          template: '<div class="admin-breadcrumbs" id="entity_list_breadcrumbs"></div>'
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
          width: 300,
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
        },
        // { view: 'button',
        //   type: 'icon',
        //   icon: 'refresh',
        //   id: 'REFRESH_ENTITY_LABEL_1', label: STRINGS.REFRESH_ENTITY,
        //   width: 30,
        //   click: function() { UI.entityList.refresh(); }
        // },
      ]
    },
    { view: 'template',
      hidden: true,
      id: 'entity_list_blank_prompt',
      template: ''
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
        return (UIHelper.isListShowMore(obj.id) ? '' :
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
          if (UIHelper.isListShowMore(id)) {
            UI.entityList.showMore();
          }
        },
        onSelectChange: function (ids) {
          var id = ids[0];
          if (UIHelper.isListShowMore(id)) {
            $$('entity_list').select(UI.entityList.getSelectedId());
          } else {
            UI.entityForm.setCurrentId(id);
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
  gravity: 0.3,
  on: {
    onResize: function () {
      console.log('Resize.........');
    }
  },
  rows: [
  { view: 'toolbar',
    id: 'entity_form__toolbar',
    hidden: true,
    cols: [
      // { view: 'button',
      //   type: 'icon',
      //   icon: 'refresh',
      //   id: 'REFRESH_ENTITY_LABEL', label: STRINGS.REFRESH_ENTITY,
      //   width: 60,
      //   click: function() {
      //     UI.entityForm.refresh();
      //   }
      // },
      { view: 'button',
        type: 'icon',
        icon: 'plus',
        id: 'ADD_FIELD_LABEL', label: STRINGS.ADD_FIELD,
        hidden: true,
        width: 120,
        click: function() {
          $$('add_field_window').show();
        }
      },
      {},
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
        icon: 'times-circle',
        id: 'CANCEL_ENTITY_LABEL', label: STRINGS.CANCEL_ENTITY,
        width: 80,
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

  setCurrentId: function (id) {
    UI.entityTree.setCurrentId(id);
    UI.entityList.setCurrentId(id);
    UI.entityForm.setCurrentId(id);
  },

  /**
   * @type {EntityForm}
   */
  entityForm: new EntityForm(),

  entityList: new EntityList(),

  entityTree: new EntityTree(),

  pages: new Pages(),

  setMode: function (mode) {
    if (['dev', 'cms'].indexOf(mode) === -1) {
      throw new Error('Illegal mode: ' + mode);
    }
    if (UI.getMode() === mode) {
      return;
    }
    window.localStorage.setItem('uiMode', mode);
    UI.refresh();
  },

  getMode: function () {
    return window.localStorage.getItem('uiMode') || 'dev';
  },

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

    // for (var lang in STRINGS_ON_DIFFERENT_LANGUAGES) {
    //   var langButton = $$('menu__language_button_' + lang.toLowerCase());
    //   if (lang === currentLang) {
    //     webix.html.addCss(langButton.getNode(), 'menu__language_button--selected');
    //   } else {
    //     webix.html.removeCss(langButton.getNode(), 'menu__language_button--selected');
    //   }
    // }

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
    var dialogs = ['ADD_ROOT', 'ADD_ENTITY', 'ADD_FIELD', 'ADD_VERSION', 'ADD_WEBSITE'];
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
    if (pathWithoutLanguage.indexOf('/') !== 0) {
      pathWithoutLanguage = '/' + pathWithoutLanguage;
    }
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
      var item = document.getElementById(no_item_id);
      if (item) {
        item.innerHTML = noItemsHTML;
      }
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
        var txt = err.message || err.name;
        if (txt) {
          webix.message({ type: 'error', text: txt });
        }
        break;
    }
    console.error(err);
  },

  info: function(message) {
    webix.message({ type: 'info', text: message, expire: 10000 });
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

  onLogin: function (withHeader) {
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
  },

  onLogout: function (withHeader) {
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
  },

  initConnection: function(withHeader) {
    if (Mydataspace.isLoggedIn()) {
      UI.onLogin(withHeader);
    }
    Mydataspace.on('login', UI.onLogin.bind(null, withHeader));
    Mydataspace.on('logout', UI.onLogout.bind(null, withHeader));

    UI.entityForm.listen();
    UI.entityList.listen();
    UI.entityTree.listen();

    Mydataspace.on('users.getMyProfile.res', function(data) {
      if (MDSCommon.isBlank(data['avatar'])) {
        data['avatar'] = '/images/no_avatar.svg';
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
      if ($$('app_list').getItem(data.clientId) == null) {
        $$('app_list').add({
          id: data.clientId,
          value: data.name
        });
      }
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
      if ($$('app_list').getItem(data.clientId)) {
        $$('app_list').remove(data.clientId);
      }
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
    window.addEventListener('message', function(e) {
      if (e.data.message === 'getScripts') {

        Mydataspace.request('entities.getWithMeta', Identity.dataFromId(UI.entityForm.getCurrentId())).then(function (data) {
          data.fields.sort(function(a, b) {
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

          e.source.postMessage(MDSCommon.extend(Identity.dataFromId(UI.entityForm.getCurrentId()), { message: 'fields', fields: data.fields }), '*');
        }, function (err) {
          e.source.postMessage(MDSCommon.extend(Identity.dataFromId(UI.entityForm.getCurrentId()), { message: 'error', error: err.message }), '*');
        });
      }
    });


    //
    //
    //

    webix.protoUI({
      name: 'ModalDialog',

      $init: function () {
        this.attachEvent('onHide', function () {
          this.clearShowData();
        });
      },

      /**
       *
       * @param {object} data
       */
      showWithData: function (data) {
        if (data && typeof data !== 'object') {
          throw new Error('Data must be object');
        }
        this._showData_ = data || {};
        this.show();
      },

      getShowData: function () {
        if (!this._showData_) {
          this._showData_ = {};
        }
        return this._showData_;
      },

      clearShowData: function () {
        this._showData_ = {};
      }
    }, webix.ui.window);

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
    webix.ui(UILayout.windows.addFile);
    webix.ui(UILayout.windows.renameFile);
    webix.ui(UILayout.windows.addApp);
    webix.ui(UILayout.windows.changeVersion);
    webix.ui(UILayout.windows.addVersion);
    webix.ui(UILayout.windows.addWebsite);
    webix.ui(UILayout.windows.showMedia);
    webix.ui(UILayout.windows.addGenerator);

    webix.ui(MDSCommon.extend(UILayout.entityContextMenu, { id: 'entity_list_menu' }));
    webix.ui(MDSCommon.extend(UILayout.entityContextMenu, { id: 'entity_tree_menu' }));
    webix.ui(MDSCommon.extend(UILayout.entityContextMenu, { id: 'entity_form_menu' }));
    webix.ui(MDSCommon.extend(UILayout.entityContextMenu, { id: 'entity_list_new_menu' }));

    if (!withHeader) {
      UILayout.sideMenu.hidden = true;
      UILayout.sideMenu.height = 100;
    }
    webix.ui(UILayout.sideMenu);


    //
    // Dashboard
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

    dataPanels.push({
      view: 'multiline-tabview',
      css: 'script_editor',
      id: 'script_editor',
      gravity: 0.6,
      tabbar: {
        height: 30,
        hidden: true,
        on: {
          onOptionRemove: function () {
            var tabbar  = $$('script_editor').getTabbar();
            if ($(tabbar.$view).find('.webix_all_tabs > *').length === 2) {
              tabbar.hide();
            }
          }
        }
      },
      cells: [{
        header: '<i class="fa fa-folder" style="margin-right: 5px;"></i> ' + STRINGS.entities_and_files,
        css: 'script_editor__tab',
        body: UILayout.entityList
      }]
    });

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

    var entityListNode = $$('entity_list').getNode();
    entityListNode.addEventListener('contextmenu', function (e) {
      for (var i = 0; i < e.path.length; i++) {
        if (e.path[i].classList && e.path[i].classList.contains('webix_list_item')) {
          $$('entity_list').select(e.path[i].getAttribute('webix_l_id'));
          return;
        }
      }
      $$('entity_list').select($$('entity_list').getFirstId());
    });

    $$('entity_list_menu').attachTo(entityListNode);
    $$('entity_tree_menu').attachTo($$('entity_tree'));

    UI.updateSizes();

    webix.event(window, 'resize', function(e) {
      UI.updateSizes();
    });

    window.addEventListener('error', function (e) {
      UI.error(e.error.message);
      return false;
    });

    //function updateTreeSearchScope() {
    //  // if (Router.isRoot() || Router.isFilterByName()) {
    //  //   $$('entity_tree__root_scope').define('icon', 'database');
    //  //   $$('entity_tree__search').setValue(Router.getSearch(true));
    //  // } else if ((Router.isEmpty() || Router.isMe())) {
    //  //   $$('entity_tree__root_scope').define('icon', 'user');
    //  //   $$('entity_tree__search').setValue(Router.getSearch());
    //  // } else {
    //  //   $$('entity_tree__root_scope').define('icon', 'globe');
    //  //   $$('entity_tree__search').setValue(Router.getSearch());
    //  // }
    //  // $$('entity_tree__root_scope').refresh();
    //}
    //updateTreeSearchScope();

    $(window).on('hashchange', function() {
      UI.pages.refreshPage('data', true);
      // updateTreeSearchScope();
    });

    if (withHeader) {
      UI.updateLanguage();
    }

  },

  updateSizes: function() {
    $$('admin_panel').resize();
  },

  hideAccessToken: function () {
    document.getElementById('profile__access_key_wrap').innerHTML =
      '<a class="profile__access_key_link" href="javascript: void(0)" onclick="return UI.showAccessToken()">' + STRINGS.SHOW_ACCESS_KEY + '</a>';
    clearTimeout(UI.accessTockenTimer);
  },

  showAccessToken: function() {
    Mydataspace.request('users.getMyAccessToken', {}, function(data) {
      document.getElementById('profile__access_key_wrap').innerHTML =
        '<a href="javascript: void(0)" onclick="UI.hideAccessToken();" class="profile__hide_access_key">' + STRINGS.HIDE_ACCESS_KEY + '</a>' +
        '<div id="profile_access_key" class="profile__access_key">' + data.accessToken + '</div>';

      var range = document.createRange();
      range.selectNode(document.getElementById('profile_access_key'));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);

      UI.accessTockenTimer = setTimeout(function () {
        UI.hideAccessToken();
      }, 30000);
    }, function(err) {
    });
  },

  deleteEntity: function(entityId) {

  },

  showMedia: function (options) {
    UI.mediaToShow = options;
    $$('show_media_window').show();
  }
};

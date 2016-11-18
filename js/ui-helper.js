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

  ENTITY_TREE_SHOW_MORE_ID: 'show_more_23478_3832ee',
  ENTITY_TREE_DUMMY_ID: 'dummy_483__4734_47e4',
  ENTITY_LIST_SHOW_MORE_ID: 'show_more_47384_3338222',

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
    var identity = Identity.dataFromId(id);
    if (identity.path == null) {
      return false;
    }
    return identity.path.startsWith('protos/') &&
           UIHelper.getEntityDepthByPath(identity.path) === 2;
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

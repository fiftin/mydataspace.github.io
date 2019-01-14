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

var Router = {
  isEmpty: function() {
    return !Router.isRoot();
    // if (window.path !== '/') {
    //   return false;
    // }
    // return window.location.hash == null ||
    //   window.location.hash === '' ||
    //   window.location.hash === '#';
  },

  getCommonSearchParts: function() {
    if (Router.isEmpty()) {
      return null;
    }
    var parts = window.location.hash.substring(1).split(':');
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
    return false;
    // if (window.path !== '/') {
    //   return false;
    // }
    // var parts = Router.getCommonSearchParts();
    // if (parts == null || MDSCommon.isBlank(parts.search)) {
    //   return false;
    // }
    // var s = parts.search;
    // return s.indexOf('*') === 0 && s.lastIndexOf('*') === s.length - 1;
  },

  /**
   * Route links to single root.
   */
  isRoot: function() {
    if (window.path !== '/' && window.path.length > 2) {
      return true;
    }
    // var parts = Router.getCommonSearchParts();
    // return parts != null && MDSCommon.isPresent(parts.search) && parts.search.indexOf('*') < 0;
  },

  isFilterByName: function() {
    return false;
    // if (window.path !== '/') {
    //   return false;
    // }
    // var parts = Router.getCommonSearchParts();
    // if (parts == null || MDSCommon.isBlank(parts.search) || parts.search === '*') {
    //   return false;
    // }
    // return parts.search.indexOf('*') === parts.search.length - 1;
  },

  getSearch: function(raw) {
    if (window.path !== '/') {
      return window.location.pathname.split('/').filter(function(x) { return MDSCommon.isPresent(x); })[0];
    }
    return '';
    // if (raw) {
    //   return window.location.hash.substring(1);
    // }
    //
    // var parts = Router.getCommonSearchParts();
    // if (parts == null) {
    //   return '';
    // }
    // return parts.search.replace(/\*/g, '');
  },

  isMe: function() {
    if (window.path !== '/') {
      return false;
    }
    var parts = Router.getCommonSearchParts();
    return parts == null || parts != null && parts.user === 'me';
  }
};

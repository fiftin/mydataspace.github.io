var Router = {
  isEmpty: function() {
    return window.location.hash == null ||
           window.location.hash === '' ||
           window.location.hash === '#';
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
    var parts = Router.getCommonSearchParts();
    if (parts == null || MDSCommon.isBlank(parts.search) || parts.search === '*') {
      return false;
    }
    var s = parts.search;
    return s.indexOf('*') === 0 && s.lastIndexOf('*') === s.length - 1;
  },

  /**
   * Route links to single root.
   */
  isRoot: function() {
    var parts = Router.getCommonSearchParts();
    return parts != null && MDSCommon.isPresent(parts.search) && parts.search.indexOf('*') < 0;
  },

  getRoot: function() {
    var parts = Router.getCommonSearchParts();
    return parts.search;
  },

  isFilterByName: function() {
    var parts = Router.getCommonSearchParts();
    if (parts == null || MDSCommon.isBlank(parts.search)) {
      return false;
    }
    return parts.search.indexOf('*') === parts.search.length - 1;
  },

  getSearch: function() {
    var parts = Router.getCommonSearchParts();
    if (parts == null) {
      return '';
    }
    return parts.search.replace(/\*/g, '');
  },

  isMe: function() {
    var parts = Router.getCommonSearchParts();
    return parts != null && parts.user === 'me';
  }
};

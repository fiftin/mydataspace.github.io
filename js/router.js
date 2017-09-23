/**
 * Earlier this class provided info about complex URL used for search roots in admin dashboard.
 * Now this functionality has been removed.
 * @type {{isEmpty: Router.isEmpty, getCommonSearchParts: Router.getCommonSearchParts, isSearch: Router.isSearch, isRoot: Router.isRoot, isFilterByName: Router.isFilterByName, getSearch: Router.getSearch, isMe: Router.isMe}}
 */
var Router = {
  isEmpty: function() {
    return !Router.isRoot();
  },

  getVersion: function() {
    var search = window.location.search;
    if (search.length > 0) {
      search = search.substr(1);
    }

    var searchParts = search.split('&');
    var searchParams = {};
    for (var i = 0; i < searchParts.length; i++) {
      var part = searchParts[i];
      var keyValue = part.split('=');
      searchParams[keyValue[0]] = keyValue[1];
    }

    return searchParams.v;
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
  },

  /**
   * Route links to single root.
   */
  isRoot: function() {
    if (window.location.pathname === '/') {
      return false;
    }
    var parts = window.location.pathname.split('/').filter(function(x) { return MDSCommon.isPresent(x); });
    if (parts.length >= 2) {
      return true;
    }
    return parts[0] != null && parts[0].length > 2;
  },

  isFilterByName: function() {
    return false;
  },

  getSearch: function() {
    if (window.location.pathname === '/') {
      return '';
    }
    var parts = window.location.pathname.split('/').filter(function(x) { return MDSCommon.isPresent(x); });
    if (parts.length >= 2) {
      return parts[1];
    } else if (parts[0] != null && parts[0].length > 2) {
      return parts[0];
    } else {
      return '';
    }
  },

  isMe: function() {
    if (window.path !== '/') {
      return false;
    }
    var parts = Router.getCommonSearchParts();
    return parts == null || parts != null && parts.user === 'me';
  }
};

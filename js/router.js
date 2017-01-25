var Router = {
  isEmpty: function() {
    return window.location.hash == null ||
           window.location.hash === '' ||
           window.location.hash === '#';
  },
  /**
   * Route links to single root.
   */
  isRoot: function() {
    return !Router.isEmpty() && window.location.hash.indexOf('*') < 0;
  },
  getRoot: function() {
    return window.location.hash.substring(1);
  },
  isSearch: function() {
    return !Router.isEmpty() && !Router.isRoot();
  },
  getSearch: function() {
    var s = window.location.hash.substring(1);
    if (Router.isMe()) {
      s = s.substring(3);
    }
    return s.replace(/\*/g, '');
  },
  isMe: function() {
    return window.location.hash.indexOf('#me:') === 0;
  }
};

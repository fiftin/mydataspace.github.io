var Router = {
  isEmpty: function() {
    return window.location.hash == null ||
           window.location.hash === '' ||
           window.location.hash === '#';
  },
  isRoot: function() {
    return window.location.hash.indexOf('*') < 0;
  },
  getRoot: function() {
    return window.location.hash.substring(1);
  },
  isSearch: function() {
    return !Router.isRoot();
  },
  getSearch: function() {
    return window.location.hash.substring(1).replace(/\*/g, '');
  }
};

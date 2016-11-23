var Router = {
  isEmpty: function() {
    return window.location.hash == null ||
           window.location.hash === '' ||
           window.location.hash === '#';
  }
};

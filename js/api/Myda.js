function Myda(options) {
  if (typeof options === 'string') {
    this.root = options;
  } else if (typeof options === 'object') {
    this.root = options.root;
    this.clientId = options.clientId;
    this.permission = options.permission;
  }
  this.entities = new Entities(this);
}

Myda.prototype.connect = function(options) {

};

Myda.prototype.disconnect = function(options) {

};

Myda.prototype.authorize = function(options) {

};

Myda.guid = function() {

};

var Mydataspace = new MDSClient({
  clientId: 'de96bb70-29b2-454f-8813-ea6e4769414a',
  permission: 'admin'
});

MDSConsole.run = function(optionsOrAction, action) {
  if (typeof optionsOrAction === 'function') {
    action = optionsOrAction;
    optionsOrAction = {};
  }
  var options = MDSCommon.extend({
    simpleFormat: true,
    connectAndLogin: true
  }, optionsOrAction);

  if (options.simpleFormat) {
    Mydataspace.registerFormatter('entities.get.res', new EntitySimplifier());
    Mydataspace.registerFormatter('entities.change.res', new EntitySimplifier());
    Mydataspace.registerFormatter('entities.create.res', new EntitySimplifier());
    Mydataspace.registerFormatter('entities.getRoots.res', new EntitySimplifier());
    Mydataspace.registerFormatter('entities.getMyRoots.res', new EntitySimplifier());
  }

  var self = MDSConsole;

  if (options.connectAndLogin && !Mydataspace.isLoggedIn()) {
    self.log('Connecting...');
    Mydataspace.connect().then(function () {
      self.log('Connected! Logging in...');
      return new Promise(function (resolve, reject) {
        Mydataspace.on('login', function () {
          self.log('Logged In!');
          resolve();
        });
        Mydataspace.on('unauthorized', function () {
          reject(new Error('Unauthorized'));
        });
      });
    }).then(function () {
      return action(Mydataspace.getRoot(self.root), self.event || {});
    }).then(function (res) {
      self.success(res);
    }, function (err) {
      self.fail(err.message);
    });
  }
};
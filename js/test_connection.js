function connect(apiURL, websocketURL, done) {
  Mydataspace.registerFormatter('entities.get.res', new EntitySimplifier());
  Mydataspace.init({
    apiURL: apiURL,
    websocketURL: websocketURL,
    connected: function() {
      Mydataspace.on('login', function() {
        done();
      });
      Mydataspace.on('unauthorized', function() {
        MDSConsole.fail('Unauthorized');
      });
    }
  });
  Mydataspace.connect();
}

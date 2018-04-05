describe('MDSClient', function() {
  xit('#constructor', function() {
    var myda = new MDSClient({
      apiURL: '',
      cdnURL: '',
      websocketURL: '',
      clientId: '',
      permission: 'admin'
    });
    myda.connect();
  });
});

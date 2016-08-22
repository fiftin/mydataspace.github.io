describe('Myda', function() {
  it('#constructor', function() {
    var myda = new Myda({
      apiURL: '',
      websocketURL: '',
      clientId: '',
      permission: 'admin'
    });
    var myda.connect();
  });
});

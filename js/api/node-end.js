MDSClient.prototype.loginByToken = function(token) {
  var self = this;
  var url = self.options.apiURL + self.getAuthProvider('accessToken').url + '&accessToken=' + token;
  console.log(url);
  return new Promise(function(resolve, reject) {
    http.get(url, function(res) {
      var json = '';
      res.on('data', function(chunk) {
        json += chunk;
      });
      res.on('end', function() {
        var obj = JSON.parse(json);
        function loginListener() {
          self.off('login', loginListener);
          resolve();
        }
        self.on('login', loginListener);
        self.emit('authenticate', { token: obj.jwt });
        self.on('unauthorized', reject);
      });
    });
  });
};

module.exports.MDSCommon = MDSCommon;
module.exports.MDSClient = MDSClient;
module.exports.EntityFieldsSimplifier = EntityFieldsSimplifier;
module.exports.EntityChildrenSimplifier = EntityChildrenSimplifier;
module.exports.EntityFieldsUnsimplifier = EntityFieldsUnsimplifier;

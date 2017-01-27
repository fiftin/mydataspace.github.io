Myda.prototype.loginByToken = function(token) {
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
        resolve(JSON.parse(json));
      });
    });
  });
};

module.exports.Myda = Myda;

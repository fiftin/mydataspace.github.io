Myda.prototype.loginByToken = function(token) {
  var options = {
    method: 'put',
  };
  return new Promise(function(resolve, reject) {
    var req = http.request(options, function(res) {
      resolve();
    });
    req.write('token=' + token);
    req.end();
  });

};

module.exports.Myda = Myda;

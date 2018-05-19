describe('Entities', function() {
  describe('#request', function () {
    it('#requrest', function () {
      var result;

      var testRoot = new Entities({
        request: function (eventName, data) {
          result = data;
          return Promise.resolve({});
        }
      }, 'test');

      return testRoot.request('testEvent', [{
        path: '1'
      }, {
        path: '2'
      }]).then(function () {
        expect(result.length).to.eq(2);
        expect(result[0].root).to.eq('test');
        expect(result[1].root).to.eq('test');
      });
    });
  })
});

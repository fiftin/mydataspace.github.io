describe('main', function() {
  describe('#getHtmlFromTemplate', function() {
    it('Should return valid HTML', function() {
      var res = getHtmlFromTemplate('<div>{{name }}</div>\n' +
        '<div>{{ last_name }}</div>', { name: 'Denis', last_name: 'Gukov' });
      expect(res).eq('<div>Denis</div>\n<div>Gukov</div>');
    });
  });
});
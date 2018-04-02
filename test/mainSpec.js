describe('main', function() {
  describe('#search_parseSearchString', function() {
    it('Should return template', function() {
      var res = search_parseSearchString('#type:template');
      expect(res.type).to.eql('template');
    });
  });

  describe('#getHtmlFromTemplate', function() {
    it('Should return valid HTML', function() {
      var res = getHtmlFromTemplate('<div>{{name }}</div>\n' +
        '<div>{{ last_name }}</div>', { name: 'Denis', last_name: 'Gukov' });
      expect(res).eq('<div>Denis</div>\n<div>Gukov</div>');
    });
  });
  describe('#parseSingleScript', function() {
    it('Should return valid HTML', function() {
      MDSView.registerHelper('test', function(options) {
        return options;
      });
      var res = parseSingleScript('test "test" test', { test: 123 });
      expect(res).to.eql(['test', 123])
    });
  });
});
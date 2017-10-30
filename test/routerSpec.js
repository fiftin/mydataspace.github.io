describe('Router', function() {
  describe('#isMe', function() {
    it('Should return false for /', function() {
      Router.window = {
        location: {
          search: '',
          hash: '',
          pathname: '/'
        }
      };
      expect(Router.isMe()).to.be.false;
    });
  });

  describe('#getSearch', function() {
    it('Should return root', function() {
      Router.window = {
        location: {
          pathname: '/test'
        }
      };
      expect(Router.getSearch()).to.eq('test');
    });

    it('Should return root with language', function() {
      Router.window = {
        location: {
          pathname: '/ru/test/views'
        }
      };
      expect(Router.getSearch()).to.eql(['test', 'views']);
    });

    it('Should return root', function() {
      Router.window = {
        location: {
          pathname: '/test/views'
        }
      };
      expect(Router.getSearch()).to.eql(['test', 'views']);
    });
  });

  describe('#isRoot', function() {
    it('Should return false for non-root URL', function() {
      Router.window = {
        location: {
          pathname: '/'
        }
      };
      expect(Router.isRoot()).to.be.false;
    });
    it('Should return true for root URL', function() {
      Router.window = {
        location: {
          pathname: '/test'
        }
      };
      expect(Router.isRoot()).to.be.true;
    });
    it('Should return true for root URL with query', function() {
      Router.window = {
        location: {
          search: '?search=test',
          pathname: '/test'
        }
      };
      expect(Router.isRoot()).to.be.true;
    });
    it('Should return true for root tab URL', function() {
      Router.window = {
        location: {
          search: '',
          hash: '',
          pathname: '/test/views'
        }
      };
      expect(Router.isRoot()).to.be.true;
    });
  });
});
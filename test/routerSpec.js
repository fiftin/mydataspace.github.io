describe('Router', function() {
  describe('#getCommonSearchParts', function() {
    it('returns me and test', function() {
      window.location.hash = '#me:test';
      expect(Router.getCommonSearchParts()).to.eql({ user: 'me', search: 'test' });
    });
    it('returns only search', function() {
      window.location.hash = '#*hello%20world*';
      expect(Router.getCommonSearchParts()).to.eql({ search: '*hello%20world*' });
    });
    it('returns only root', function() {
      window.location.hash = '#fiftin';
      expect(Router.getCommonSearchParts()).to.eql({ search: 'fiftin' });
    });
  });

  describe('#getSearch', function() {
    it('returns empty for non-search routes', function() {
      window.location.hash = '';
      expect(Router.getSearch()).to.eq('');
    });
  });

  describe('#isFilterByName', function() {
    it('returns false for empty route', function() {
      window.location.hash = '';
      expect(Router.isFilterByName()).to.be.false;
    });
    it('returns false for empty route 2', function() {
      window.location.hash = '#';
      expect(Router.isFilterByName()).to.be.false;
    });

    it('returns false for global search by name', function() {
      window.location.hash = '#test*';
      expect(Router.isFilterByName()).to.be.true;
    });
    it('returns folse for user search by name', function() {
      window.location.hash = '#user:test*';
      expect(Router.isFilterByName()).to.be.true;
    });

    it('returns true for global search', function() {
      window.location.hash = '#*test*';
      expect(Router.isFilterByName()).to.be.false;
    });
    it('returns true for user search', function() {
      window.location.hash = '#user:*test*';
      expect(Router.isFilterByName()).to.be.false;
    });
    it('returns folse for global root', function() {
      window.location.hash = '#test';
      expect(Router.isFilterByName()).to.be.false;
    });
    it('returns folse for user root', function() {
      window.location.hash = '#user:test';
      expect(Router.isFilterByName()).to.be.false;
    });
  });



  describe('#isSearch', function() {
    it('returns false for empty route', function() {
      window.location.hash = '';
      expect(Router.isSearch()).to.be.false;
    });
    it('returns false for empty route 2', function() {
      window.location.hash = '#';
      expect(Router.isSearch()).to.be.false;
    });

    it('returns false for global search by name', function() {
      window.location.hash = '#test*';
      expect(Router.isSearch()).to.be.false;
    });
    it('returns folse for user search by name', function() {
      window.location.hash = '#user:test*';
      expect(Router.isSearch()).to.be.false;
    });

    it('returns true for global search', function() {
      window.location.hash = '#*test*';
      expect(Router.isSearch()).to.be.true;
    });
    it('returns true for user search', function() {
      window.location.hash = '#user:*test*';
      expect(Router.isSearch()).to.be.true;
    });
    it('returns folse for global root', function() {
      window.location.hash = '#test';
      expect(Router.isSearch()).to.be.false;
    });
    it('returns folse for user root', function() {
      window.location.hash = '#user:test';
      expect(Router.isSearch()).to.be.false;
    });
  });

  describe('#isRoot', function() {
    it('returns false for empty route', function() {
      window.location.hash = '';
      expect(Router.isRoot()).to.be.false;
    });
    it('returns false for empty route 2', function() {
      window.location.hash = '#';
      expect(Router.isRoot()).to.be.false;
    });
    it('returns false for global search', function() {
      window.location.hash = '#test*';
      expect(Router.isRoot()).to.be.false;
    });
    it('returns false for user search', function() {
      window.location.hash = '#user:test*';
      expect(Router.isRoot()).to.be.false;
    });

    it('returns true for global root', function() {
      window.location.hash = '#test';
      expect(Router.isRoot()).to.be.true;
    });
    it('returns true for user root', function() {
      window.location.hash = '#user:test';
      expect(Router.isRoot()).to.be.true;
    });
  });
});

describe('UIHelper', function() {
  describe('#expendField', function() {
    it('returns the same for normal field', function() {
      var field = {
        name: 'test',
        type: 's',
        value: 'hello'
      };
      expect(Fields.expandField(field)).to.eql(field);
    });

    it('returns null for null', function() {
      expect(Fields.expandField(null)).to.be.null;
    });

    it('returns nested object', function() {
      var field = {
        name: 'test',
        type: 's',
        value: 'hello',
        nested: {
          name: 'test.a',
          value: 10,
          type: 'i'
        }
      };
      expect(Fields.expandField(field)).to.eql(field.nested);
    });

    it('corrent handle null fields', function() {
      var field = {
        name: 'test',
        type: 's',
        value: null
      };
      expect(Fields.expandField(field)).to.eql(field);
    });
  });


  it('#getFieldsForSave', function() {
    var dirtyFields;
    var currentFieldNames = ['a'];
    var oldFields = {
      a: 'a',
      c: 'c',
      d: 'd'
    };
    var result = Fields.getFieldsForSave(dirtyFields, currentFieldNames, oldFields);
    expect(result.length).to.equal(2);
    expect(result[0].name).to.equal('c');
    expect(result[0].value).to.equal(null);
    expect(result[1].name).to.equal('d');
    expect(result[1].value).to.equal(null);
  });

});

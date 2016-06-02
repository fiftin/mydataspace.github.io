describe('UIHelper', function() {
  it('#getFieldsForSave', function() {
    var dirtyFields;
    var currentFieldNames = ['a'];
    var oldFields = {
      a: 'a',
      c: 'c',
      d: 'd'
    };
    var result = UIHelper.getFieldsForSave(dirtyFields, currentFieldNames, oldFields);
    expect(result.length).to.equal(2);
    expect(result[0].name).to.equal('c');
    expect(result[0].value).to.equal(null);
    expect(result[1].name).to.equal('d');
    expect(result[1].value).to.equal(null);
  });
});

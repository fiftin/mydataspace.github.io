describe('common', function() {
  it('#extend', function() {

    var data = common.extend({
      fields: {
        info: {
          age: 12,
          contacts: {
            phone: '12435',
            mobile: null
          }
        }
      }
    }, {
      fields: {
        info: {
          country: 'Russia',
          contacts: {
            address: 'Lenin st.'
          }
        }
      }
    });

    expect(data.fields.info.country).to.equal('Russia');
    expect(data.fields.info.contacts.phone).to.equal('12435');
    expect(data.fields.info.contacts.address).to.equal('Lenin st.');
    expect(data.fields.info.contacts.mobile).to.equal(null);
  });
});

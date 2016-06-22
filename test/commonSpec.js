describe('common', function() {
  it('#extend', function() {

    var data = common.extend({
      fields: {
        info: {
          ages: [13, 16],
          contacts: {
            phone: '12435',
            mobile: null
          }
        }
      }
    }, {
      fields: {
        info: {
          ages:[34, 54],
          country: 'Russia',
          contacts: {
            address: 'Lenin st.'
          }
        }
      }
    });

    expect(data.fields.info.ages.join(' ')).to.equal([13, 16, 34, 54].join(' '));
    expect(data.fields.info.country).to.equal('Russia');
    expect(data.fields.info.contacts.phone).to.equal('12435');
    expect(data.fields.info.contacts.address).to.equal('Lenin st.');
    expect(data.fields.info.contacts.mobile).to.equal(null);
  });
});

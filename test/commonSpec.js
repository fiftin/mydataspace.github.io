describe('MDSCommon', function() {
  describe('#diff', function() {
    it('', function() {
      const oldData = { root: 'test567',
        path: 'processes/02863847-0fe9-c517-1eb8-cec0100b4d87',
        othersCan: 'view_children',
        createdAt: '2017-05-30T06:07:47.000Z',
        updatedAt: '2017-05-30T06:07:47.000Z',
        fields: 
         { status: 'unaffected',
           type: 'importOverOpenRefine',
           targetPath: 'data',
           id: '?id=e2d1f18b-f2bb-44a6-b46b-12637dbece66',
           state: 'paused',
           targetState: 'progress' },
        numberOfChildren: 0,
        maxNumberOfChildren: 1000000,
        mine: true };

      const newData = { root: 'test567',
        path: 'processes/02863847-0fe9-c517-1eb8-cec0100b4d87',
        othersCan: 'view_children',
        fields: 
         { id: '?id=e2d1f18b-f2bb-44a6-b46b-12637dbece66',
           state: 'progress',
           status: 'unaffected',
           targetPath: 'data',
           targetState: 'progress',
           type: 'importOverOpenRefine' },
        numberOfChildren: 0,
        createdAt: '2017-05-30T06:07:47.000Z',
        updatedAt: '2017-05-30T06:07:47.000Z',
        isSystem: false,
        maxNumberOfChildren: 1000000,
        mine: true,
        requestId: 10001 };

      const diff = MDSCommon.diff(newData, oldData);
      console.log(diff);

      expect(diff.fields.state).to.eq('progress');

    });
    it('valid difference of simple object', function() {
      var res = MDSCommon.diff({
        address: 'Lenin st',
        city: 'MGN'
      }, {
        address: 'K.Mark st',
        city: 'MGN'
      });
      expect(res).to.eql({ address: 'Lenin st' });
    });
  });

  describe('#textToHtml', function() {
    it('returns same text for simple text', function() {
      expect(MDSCommon.textToHtml('Hello, World!')).to.eq('Hello,&nbsp;World!');
    });

    it('returns escaped html for one line text', function() {
      var str = '<div>Hello</div><script>document.write(\'world\')</script>';
      expect(MDSCommon.textToHtml(str)).to.eq(
        '&lt;div&gt;Hello&lt;/div&gt;&lt;script&gt;document.write(&#39;world&#39;)&lt;/script&gt;');
    });

    xit('returns paragraphs for simple multiline text', function() {
      var str = 'Hello, World!\nHello, Mother!\nHello, Father!\nHello, Brother!\nHello, Me!';
      expect(MDSCommon.textToHtml(str)).to.eq(
        '<p>Hello, World!</p>\n<p>Hello, Mother!</p>\n<p>Hello, Father!</p>\n<p>Hello, Brother!</p>\n<p>Hello, Me!</p>');
    });

    xit('returns paragraphs for simple multiline text with empty lines', function() {
      var str = 'Hello, World!\n\n\nHello, World!';
      expect(MDSCommon.textToHtml(str)).to.eq(
        '<p>Hello, World!</p>\n<p></p>\n<p></p>\n<p>Hello, World!</p>');
    });

    xit('returns paragraphs for simple multiline text with empty lines at the end', function() {
      var str = 'Hello, World!\n\n\n';
      expect(MDSCommon.textToHtml(str)).to.eq(
        '<p>Hello, World!</p>\n<p></p>\n<p></p>\n<p></p>');
    });
  });

  describe('#extend', function() {
    it('should returns valid result', function() {
      var data = MDSCommon.extend({
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
  })
});

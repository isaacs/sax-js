// XML 1.0 2.11: CR LF and a lone CR are read as LF.
// XML 1.0 3.3.3: literal white space in an attribute value becomes a space,
// while white space written as a character reference is kept.
require(__dirname).test({
  xml: '<w a="x\ty\r\nz\n&#9;">a\r\nb\rc<![CDATA[d\r\ne]]></w>',
  strict: true,
  expect: [
    ['opentagstart', { name: 'w', attributes: {} }],
    ['attribute', { name: 'a', value: 'x y z \t' }],
    [
      'opentag',
      { name: 'w', attributes: { a: 'x y z \t' }, isSelfClosing: false },
    ],
    ['text', 'a\nb\nc'],
    ['opencdata', undefined],
    ['cdata', 'd\ne'],
    ['closecdata', undefined],
    ['closetag', 'w'],
  ],
})

// CR LF split across two writes
require(__dirname)
  .test({
    strict: true,
    expect: [
      ['opentagstart', { name: 'w', attributes: {} }],
      ['opentag', { name: 'w', attributes: {}, isSelfClosing: false }],
      ['text', 'a\nb'],
      ['closetag', 'w'],
    ],
  })
  .write('<w>a\r')
  .write('\nb</w>')
  .close()

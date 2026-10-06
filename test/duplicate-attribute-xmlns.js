require(__dirname).test({
  xml: '<span id="hello" id="there"></span>',
  expect: [
    ['opentagstart', { name: 'span', attributes: {}, ns: {} }],
    [
      'attribute',
      { name: 'id', value: 'hello', prefix: '', local: 'id', uri: '' },
    ],
    [
      'opentag',
      {
        name: 'span',
        attributes: {
          id: {
            name: 'id',
            value: 'hello',
            prefix: '',
            local: 'id',
            uri: '',
          },
        },
        ns: {},
        prefix: '',
        local: 'span',
        uri: '',
        isSelfClosing: false,
      },
    ],
    ['closetag', 'span'],
  ],
  strict: true,
  opt: { xmlns: true },
})

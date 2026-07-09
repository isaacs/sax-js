require(__dirname).test({
  xml: '<a id="hello" id="there"/>',
  expect: [
    [
      'opentagstart',
      {
        name: 'a',
        attributes: {},
        ns: {},
      },
    ],
    [
      'attribute',
      {
        name: 'id',
        value: 'hello',
        uri: '',
        prefix: '',
        local: 'id',
      },
    ],
    [
      'opentag',
      {
        name: 'a',
        uri: '',
        prefix: '',
        local: 'a',
        attributes: {
          id: {
            name: 'id',
            value: 'hello',
            uri: '',
            prefix: '',
            local: 'id',
          },
        },
        ns: {},
        isSelfClosing: true,
      },
    ],
    ['closetag', 'a'],
  ],
  strict: true,
  opt: { xmlns: true },
})

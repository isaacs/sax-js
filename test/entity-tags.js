require(__dirname).test({
  xml: 'testing &custom; hi &unknown;',
  entities: {
    custom: '<foo bar="baz">hi</foo>'
  },
  expect: [
    ['text', 'testing '],
    ['opentagstart', {'name': 'FOO', attributes: {}}],
    ['attribute', {name: 'BAR', value: 'baz'}],
    ['opentag', {'name': 'FOO', attributes: {BAR: 'baz'}, isSelfClosing: false}],
    ['text', 'hi'],
    ['closetag', 'FOO'],
    ['text', ' hi &unknown;']
  ]
})

require(__dirname).test({
  opt: {unparsedEntities: true},
  xml: '<doc a="&#34;">' +
    '</doc>',
  expect: [
    ['opentagstart', {'name': 'DOC', attributes: {}}],
    ['attribute', { name: 'A', value: '"'} ],
    ['opentag', {'name': 'DOC', attributes: {A: '"'}, isSelfClosing: false}],
    ['closetag', 'DOC']
  ]
})

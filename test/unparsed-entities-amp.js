require(__dirname).test({
  opt: {unparsedEntities: true},
  xml: '<svg>' +
    '<text>' +
    '&amp;' +
    '</text>' +
    '</svg>',
  expect: [
    ['opentagstart', {'name': 'SVG', attributes: {}}],
    ['opentag', {'name': 'SVG', attributes: {}, isSelfClosing: false}],
    ['opentagstart', {'name': 'TEXT', attributes: {}}],
    ['opentag', {'name': 'TEXT', attributes: {}, isSelfClosing: false}],
    ['text', '&'],
    ['closetag', 'TEXT'],
    ['closetag', 'SVG']
  ]
})

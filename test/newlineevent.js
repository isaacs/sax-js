require(__dirname).test({
  xml: '<root>\n\r\n\r</root>',
  expect: [
    ['opentagstart', { name: 'root', attributes: {} }],
    ['opentag', { name: 'root', attributes: {}, isSelfClosing: false }],
    ['newline', undefined],  // \n
    ['newline', undefined],  // \r\n
    ['text', '\n\r\n\r'],
    ['closetag', 'root']
  ],
  strict: true,
  opt: { trackNewlines: true, onnewline: true }
})

require(__dirname).test({
  xml: '<root>\n\r\n\r</root>',
  expect: [
    ['opentagstart', { name: 'root', attributes: {} }],
    ['opentag', { name: 'root', attributes: {}, isSelfClosing: false }],
    ['text', '\n\r\n\r'],
    ['closetag', 'root']
  ],
  strict: true
})
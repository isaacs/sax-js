// https://github.com/isaacs/sax-js/issues/303
require(__dirname).test({
  xml: '<!ENTITY "x"> <a></a>',
  expect: [
    ['sgmldeclaration', 'ENTITY "x"'],
    ['text', ' '],
    ['opentagstart', { name: 'a', attributes: {} }],
    ['opentag', { name: 'a', attributes: {}, isSelfClosing: false }],
    ['closetag', 'a'],
  ],
  strict: true,
})

require(__dirname).test({
  xml: "<!ENTITY 'x'> <a></a>",
  expect: [
    ['sgmldeclaration', "ENTITY 'x'"],
    ['text', ' '],
    ['opentagstart', { name: 'a', attributes: {} }],
    ['opentag', { name: 'a', attributes: {}, isSelfClosing: false }],
    ['closetag', 'a'],
  ],
  strict: true,
})

require(__dirname).test({
  xml: '<!ENTITY "a>b"> <a></a>',
  expect: [
    ['sgmldeclaration', 'ENTITY "a>b"'],
    ['text', ' '],
    ['opentagstart', { name: 'a', attributes: {} }],
    ['opentag', { name: 'a', attributes: {}, isSelfClosing: false }],
    ['closetag', 'a'],
  ],
  strict: true,
})

require(__dirname).test({
  xml: '<!ENTITY "x"> <a></a>',
  expect: [
    ['sgmldeclaration', 'ENTITY "x"'],
    ['text', ' '],
    ['opentagstart', { name: 'A', attributes: {} }],
    ['opentag', { name: 'A', attributes: {}, isSelfClosing: false }],
    ['closetag', 'A'],
  ],
  strict: false,
})

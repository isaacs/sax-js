// strict: CDATA outside the root node must fail (#298)
require(__dirname).test({
  strict: true,
  xml: '<a/><![CDATA[x]]>',
  expect: [
    ['opentagstart', { name: 'a', attributes: {} }],
    ['opentag', { name: 'a', attributes: {}, isSelfClosing: true }],
    ['closetag', 'a'],
    [
      'error',
      'CDATA section outside of root node.\nLine: 0\nColumn: 13\nChar: [',
    ],
    ['opencdata', undefined],
    ['cdata', 'x'],
    ['closecdata', undefined],
  ],
})

// strict: CDATA before the root node must fail (#298)
require(__dirname).test({
  strict: true,
  xml: '<![CDATA[x]]><a/>',
  expect: [
    [
      'error',
      'CDATA section outside of root node.\nLine: 0\nColumn: 9\nChar: [',
    ],
    ['opencdata', undefined],
    ['cdata', 'x'],
    ['closecdata', undefined],
    ['opentagstart', { name: 'a', attributes: {} }],
    ['opentag', { name: 'a', attributes: {}, isSelfClosing: true }],
    ['closetag', 'a'],
  ],
})

// strict: CDATA inside the root stays silent (#298, no false positive)
require(__dirname).test({
  strict: true,
  xml: '<r><![CDATA[ok]]></r>',
  expect: [
    ['opentagstart', { name: 'r', attributes: {} }],
    ['opentag', { name: 'r', attributes: {}, isSelfClosing: false }],
    ['opencdata', undefined],
    ['cdata', 'ok'],
    ['closecdata', undefined],
    ['closetag', 'r'],
  ],
})

// non-strict: misplaced CDATA stays silent, as before (#298)
// (after a closed root, non-strict sax surfaces it as text: base behavior,
// unchanged by this fix)
require(__dirname).test({
  xml: '<a/><![CDATA[x]]>',
  expect: [
    ['opentagstart', { name: 'A', attributes: {} }],
    ['opentag', { name: 'A', attributes: {}, isSelfClosing: true }],
    ['closetag', 'A'],
    ['text', '<![CDATA[x]]>'],
  ],
})

// strict: chunked misplaced CDATA also fails (sgmlDecl spans writes) (#298)
require(__dirname)
  .test({
    strict: true,
    expect: [
      ['opentagstart', { name: 'a', attributes: {} }],
      ['opentag', { name: 'a', attributes: {}, isSelfClosing: true }],
      ['closetag', 'a'],
      [
        'error',
        'CDATA section outside of root node.\nLine: 0\nColumn: 13\nChar: [',
      ],
      ['opencdata', undefined],
      ['cdata', 'x'],
      ['closecdata', undefined],
    ],
  })
  .write('<a/><![CD')
  .write('ATA[x]]>')
  .close()

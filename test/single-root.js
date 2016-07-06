// issue-86.js already tests non-strict mode for elements opening after root,
// and for non-whitespace characters after the root.

require(__dirname).test({
  xml: '<root/><bar/>',
  expect: [
    [
      'opentagstart',
      {
        name: 'root',
        attributes: {},
      },
    ],
    [
      'opentag',
      {
        name: 'root',
        attributes: {},
        isSelfClosing: true,
      },
    ],
    ['closetag', 'root'],
    ['error', 'More than one document root\nLine: 0\nColumn: 9\nChar: b'],
  ],
  strict: true,
  opt: {},
})

require(__dirname).test({
  xml: '<root/><!-- ok -->',
  expect: [
    [
      'opentagstart',
      {
        name: 'root',
        attributes: {},
      },
    ],
    [
      'opentag',
      {
        name: 'root',
        attributes: {},
        isSelfClosing: true,
      },
    ],
    ['closetag', 'root'],
    ['comment', ' ok '],
  ],
  strict: true,
  opt: {},
})

require(__dirname).test({
  xml: '<root/><?ok foo?>',
  expect: [
    [
      'opentagstart',
      {
        name: 'root',
        attributes: {},
      },
    ],
    [
      'opentag',
      {
        name: 'root',
        attributes: {},
        isSelfClosing: true,
      },
    ],
    ['closetag', 'root'],
    [
      'processinginstruction',
      {
        name: 'ok',
        body: 'foo',
      },
    ],
  ],
  strict: true,
  opt: {},
})

require(__dirname).test({
  xml: '<root/>\n\n',
  expect: [
    [
      'opentagstart',
      {
        name: 'root',
        attributes: {},
      },
    ],
    [
      'opentag',
      {
        name: 'root',
        attributes: {},
        isSelfClosing: true,
      },
    ],
    ['closetag', 'root'],
    ['text', '\n\n'],
  ],
  strict: true,
  opt: {},
})

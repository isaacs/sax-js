require(__dirname).test({
  xml: '<!DOCTYPE svg [<!--comment with \' and ] symbols-->]><svg></svg>',
  expect: [
    [ 'comment', 'comment with \' and ] symbols' ],
    [ 'doctype', ' svg []' ],
    [ 'opentagstart', { name: 'SVG', attributes: {} } ],
    [ 'opentag', { name: 'SVG', attributes: {}, isSelfClosing: false } ],
    [ 'closetag', 'SVG' ],
  ]
})

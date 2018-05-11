require(__dirname).test({
  xml: '<?name body?><xml>body</xml>',
  expect: [
    [ 'processinginstruction', { name: 'name', body: 'body' } ],
    [ 'opentagstart', { name: 'xml', attributes: {} } ],
    [ 'opentag', { name: 'xml', attributes: {}, isSelfClosing: false } ],
    [ 'text', 'body' ],
    [ 'closetag', 'xml' ]
  ],
  strict: true
})

require(__dirname).test({
  xml: '<?name?><xml>body</xml>',
  expect: [
    [ 'processinginstruction', { name: 'name', body: '' } ],
    [ 'opentagstart', { name: 'xml', attributes: {} } ],
    [ 'opentag', { name: 'xml', attributes: {}, isSelfClosing: false } ],
    [ 'text', 'body' ],
    [ 'closetag', 'xml' ]
  ],
  strict: true
})

require(__dirname).test({
  xml: '<??><xml>body</xml>',
  expect: [
    [
      'error',
      'Processing instruction without a name\nLine: 0\nColumn: 4\nChar: >'
    ],
    [ 'opentagstart', { name: 'xml', attributes: {} } ],
    [ 'opentag', { name: 'xml', attributes: {}, isSelfClosing: false } ],
    [ 'text', 'body' ],
    [ 'closetag', 'xml' ]
  ],
  strict: true
})

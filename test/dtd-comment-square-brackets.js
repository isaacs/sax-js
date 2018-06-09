// A closing square bracket in a doctype comment leads to an error in sax-js,
// but it's allowed by XML spec, and other parsers / validators accept it.

// Replace ']' by any other character to make the test succeed.
const s = ']'

require(__dirname).test({
  xml: '<!DOCTYPE x [ <!-- ' + s + ' --><!ELEMENT x ANY> ]><x/>',
  expect: [
    [ 'doctype', ' x [ <!-- ' + s + ' --><!ELEMENT x ANY> ]' ],
    [ 'opentagstart', { name: 'x', attributes: {} } ],
    [ 'opentag', { name: 'x', attributes: {}, isSelfClosing: true } ],
    [ 'closetag', 'x' ]
  ],
  strict: true,
  opt: {}
})

var xml = '<r><![CDATA[]]><!----></r>'
require(__dirname).test({
  xml: xml,
  expect: [
    ['opentagstart', {'name': 'R', 'attributes': {}}],
    ['opentag', {'name': 'R', 'attributes': {}, 'isSelfClosing': false}],
    ['opencdata', undefined],
    ['closecdata', undefined],
    ['closetag', 'R']
  ]
})

require(__dirname).test({
  xml: xml,
  opt: { emitEmpty: true },
  expect: [
    ['opentagstart', {'name': 'R', 'attributes': {}}],
    ['opentag', {'name': 'R', 'attributes': {}, 'isSelfClosing': false}],
    ['opencdata', undefined],
    ['cdata', ''],
    ['closecdata', undefined],
    ['comment', ''],
    ['closetag', 'R']
  ]
})

// The following test illustrates an effect of emitEmpty together with
// hitting the buffer limit. Namely, a trailing cdata event with an
// empty string will be emitted after the buffer is emptied.
var sax = require('../lib/sax')
var bl = sax.MAX_BUFFER_LENGTH
sax.MAX_BUFFER_LENGTH = 10
require(__dirname).test({
  opt: { emitEmpty: true },
  expect: [
    ['opentagstart', {'name': 'R', 'attributes': {}}],
    ['opentag', {'name': 'R', 'attributes': {}, 'isSelfClosing': false}],
    ['opencdata', undefined],
    ['cdata', '12345678901'],
    ['cdata', ''],
    ['closecdata', undefined],
    ['closetag', 'R']
  ]
}).write('<r><![CDATA[12345678901')
  .write(']]></r>')

sax.MAX_BUFFER_LENGTH = bl

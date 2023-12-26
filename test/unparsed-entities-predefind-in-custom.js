var sax = require('../lib/sax');
sax.ENTITIES.entity_reference = "<text>entity reference</text>";
sax.ENTITIES.escaped_entity_reference = "&lt;text&gt;escaped entity reference&lt;/text&gt;";
require(__dirname).test({
  opt: {unparsedEntities: true},
  xml: '<svg>' +
    '<text>' +
    '&lt;text&gt;escaped literal&lt;/text&gt;' +
    '</text>' +
    '&entity_reference;' +
    '<text>' +
    '&escaped_entity_reference;' +
    '</text>' +
    '</svg>',
  expect: [
    ['opentagstart', {'name': 'SVG', attributes: {}}],
    ['opentag', {'name': 'SVG', attributes: {}, isSelfClosing: false}],
    ['opentagstart', {'name': 'TEXT', attributes: {}}],
    ['opentag', {'name': 'TEXT', attributes: {}, isSelfClosing: false}],
    ['text', '<text>escaped literal</text>'],
    ['closetag', 'TEXT'],
    ['opentagstart', {'name': 'TEXT', attributes: {}}],
    ['opentag', {'name': 'TEXT', attributes: {}, isSelfClosing: false}],
    ['text', 'entity reference'],
    ['closetag', 'TEXT'],
    ['opentagstart', {'name': 'TEXT', attributes: {}}],
    ['opentag', {'name': 'TEXT', attributes: {}, isSelfClosing: false}],
    ['text', '<text>escaped entity reference</text>'],
    ['closetag', 'TEXT'],
    ['closetag', 'SVG']
  ]
})

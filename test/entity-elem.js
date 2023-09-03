var sax = require('../');
sax.ENTITIES.attr = "1";
sax.ENTITIES.text = "2.&attr;";
sax.ENTITIES.elem = '<B ATTR="&attr;.3"/>';
require(__dirname).test({
  opt: {unparsedEntities: true},
  xml: `<A ATTR="&attr;.2">&text;&elem;</A>`,
  expect: [
    ["opentagstart", {name: "A", attributes: {}}],
    ["attribute", {name: 'ATTR', value: "1.2"}],
    ["opentag", {name: "A", attributes: {ATTR: "1.2"}, isSelfClosing: false}],
    ["text", "2.1"],
    ["opentagstart", {name: "B", attributes: {}}],
    ["attribute", {name: 'ATTR', value: "1.3"}],
    ["opentag", {name: "B", attributes: {ATTR: "1.3"}, isSelfClosing: true}],
    ["closetag", "B"],
    ["closetag", "A"]
  ]
});

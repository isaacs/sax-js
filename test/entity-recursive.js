var sax = require('../');
sax.ENTITIES.attr = "1";
sax.ENTITIES.text = "2.&attr;";
require(__dirname).test({
  opt: {unparsedEntities: true},
  xml: `<A>&text;</A>`,
  expect: [
    ["opentagstart", {name: "A", attributes: {}}],
    ["opentag", {name: "A", attributes: {}, isSelfClosing: false}],
    ["text", "2.1"],
    ["closetag", "A"]
  ]
});

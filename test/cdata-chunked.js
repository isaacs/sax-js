
require(__dirname).test({
  expect : [
    ["opentag", {"name": "R","attributes": {}}],
    ["cdata", " this is "],
    ["cdata", "character data  "],
    ["closetag", "R"]
  ]
}).write("<r><![CDATA[ this is ").write("character data  ").write("]]></r>").close();


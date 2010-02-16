require(__dirname).test({
  xml : "<r><![CDATA[ this is character data  ]]></r>",
  expect : [
    ["opentag", {"name": "R","attributes": {}}],
    ["cdata", " this is character data  "],
    ["closetag", "R"]
  ]
});

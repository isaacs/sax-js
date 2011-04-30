require(__dirname).test({
  xml : '<r><script type="text/javascript">document.write("<em>")</script></r>',
  expect : [
    ["opentag", {"name": "R","attributes": {}}],
    ["attribute", {name: "type",value: "text/javascript"}],
    ["opentag", {"name": "SCRIPT","attributes": {type: "text/javascript"}}],
    ["closetag", "SCRIPT"],
    ["closetag", "R"]
  ]
});

require(__dirname).test({
  xml : '<r><style type="text/css">document.write("<em>")</style></r>',
  expect : [
    ["opentag", {"name": "R","attributes": {}}],
    ["attribute", {name: "type",value: "text/css"}],
    ["opentag", {"name": "STYLE","attributes": {type: "text/css"}}],
    ["closetag", "STYLE"],
    ["closetag", "R"]
  ]
});

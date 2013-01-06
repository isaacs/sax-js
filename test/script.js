require(__dirname).test({
  xml : "<html><head><script>if (1 < 0) { console.log('elo there'); }</script></head></html>",
  expect : [
    ["opentag", {"name": "HTML","attributes": {}}],
    ["opentag", {"name": "HEAD","attributes": {}}],
    ["opentag", {"name": "SCRIPT","attributes": {}}],
    ["script", "if (1 < 0) { console.log('elo there'); }"],
    ["closetag", "SCRIPT"],
    ["closetag", "HEAD"],
    ["closetag", "HTML"]
  ]
});

require(__dirname).test({
  xml : "<html><head><script>'<div>foo</div></'</script></head></html>",
  expect : [
    ["opentag", {"name": "HTML","attributes": {}}],
    ["opentag", {"name": "HEAD","attributes": {}}],
    ["opentag", {"name": "SCRIPT","attributes": {}}],
    ["script", "'<div>foo</div></'"],
    ["closetag", "SCRIPT"],
    ["closetag", "HEAD"],
    ["closetag", "HTML"]
  ]
});

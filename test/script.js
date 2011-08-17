require(__dirname).test({
  xml : "<html><head><script>if (1 < 0) { console.log('elo there'); }</script></head></script>",
  expect : [
    ["opentag", {"name": "HTML","attributes": {}}],
    ["opentag", {"name": "HEAD","attributes": {}}],
    ["opentag", {"name": "SCRIPT","attributes": {}}],
    ["text", "if (1 < 0) { console.log('elo there'); }"],
    ["closetag", "SCRIPT"],
    ["closetag", "HEAD"],
    ["closetag", "SCRIPT"]
  ]
});


var sys = require("sys"),
  assert = require("assert"),
  fs = require("fs"),
  path = require("path"),
  sax = require("../lib/sax");

exports.sax = sax;

// handy way to do simple unit tests
// if the options contains an xml string, it'll be written and the parser closed.
// otherwise, it's assumed that the test will write and close.
exports.test = function test (options) {
  var xml = options.xml,
    parser = sax.parser(options.strict, options.opt),
    expect = options.expect,
    e = 0;
  sax.EVENTS.forEach(function (ev) {
    parser["on" + ev] = function (n) {
      if (e >= expect.length && (ev === "end" || ev === "ready")) return;
      assert.ok( e < expect.length,
        "expectation #"+e+" "+sys.inspect(expect[e])+"\n"+
        "Unexpected event: "+ev+" "+(n ? sys.inspect(n) : ""));
      assert.equal(ev, expect[e][0],
        "expectation #"+e+"\n"+
        "Didn't get expected event\n"+
        "expect: "+expect[e][0] + " " +sys.inspect(expect[e][1])+"\n"+
        "actual: "+ev+" "+sys.inspect(n)+"\n");
      if (ev === "error") assert.equal(n.message, expect[e][1]);
      else assert.deepEqual(n, expect[e][1],
        "expectation #"+e+"\n"+
        "Didn't get expected argument\n"+
        "expect: "+expect[e][0] + " " +sys.inspect(expect[e][1])+"\n"+
        "actual: "+ev+" "+sys.inspect(n)+"\n");
      e++;
      if (ev === "error") parser.resume();
    };
  });
  if (xml) parser.write(xml).close();
  return parser;
}

if (module.id === ".") {
  var running = true,
    failures = 0;
  function fail (file, next) { return function (er) {
    sys.error("Failed: "+file);
    sys.error(er.message);
    failures ++;
    next();
  }}
  
  fs.readdir(__dirname, function (error, files) {(function T (f) {
    var file = files[f];
    if (!file) {
      if (!failures) return sys.puts("ok");
      else return sys.error(failures + " failure" + (failures > 1 ? "s" : ""));
    }
    if (path.basename(file) === path.basename(__filename))
      return process.nextTick(function () { T(f + 1) });
    // run this test.
    function next () { T(f + 1) };
    if (/\.js$/.exec(file)) {
      require.async(__dirname + "/"+file.replace(/\.js$/, ''), function (er) {
        return (er) ? fail(file, next) : next()
      });
    }
  })(0)});
}
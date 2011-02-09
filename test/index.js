
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
      var inspected = n instanceof Error ? "\n"+ n.message : sys.inspect(n)
      assert.equal(ev, expect[e][0],
        "expectation #"+e+"\n"+
        "Didn't get expected event\n"+
        "expect: "+expect[e][0] + " " +sys.inspect(expect[e][1])+"\n"+
        "actual: "+ev+" "+inspected+"\n");
      if (ev === "error") assert.equal(n.message, expect[e][1]);
      else assert.deepEqual(n, expect[e][1],
        "expectation #"+e+"\n"+
        "Didn't get expected argument\n"+
        "expect: "+expect[e][0] + " " +sys.inspect(expect[e][1])+"\n"+
        "actual: "+ev+" "+inspected+"\n");
      e++;
      if (ev === "error") parser.resume();
    };
  });
  if (xml) parser.write(xml).close();
  return parser;
}

if (module === require.main) {
  var running = true,
    failures = 0;
  function fail (file, er) {
    sys.error("Failed: "+file);
    sys.error(er.stack || er.message);
    failures ++;
  }

  fs.readdir(__dirname, function (error, files) {
    files.forEach(function (file) {
      // run this test.
      if (/\.js$/.exec(file)) {
        try {
          require(path.resolve(__dirname, file))
        } catch (er) {
          fail(file, er)
        }
      }
    })
    if (!failures) return sys.puts("ok");
    else return sys.error(failures + " failure" + (failures > 1 ? "s" : ""));
  });
}

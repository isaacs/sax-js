
var posix = require("posix"),
  sys = require("sys"),
  path = require("path"),
  xml = posix.cat(path.join(path.dirname(__filename), "test.xml")),
  sax = require("../lib/sax"),
  strict = sax.parser(true),
  loose = sax.parser(),
  inspector = function (ev) { return function (data) {
    sys.error(ev+": "+sys.inspect(data));
  }};

xml.addCallback(function (xml) {
  // strict.write(xml);
  
  ["processingInstruction",
      "text", "comment","opentag",
      "closetag","attribute"].forEach(function (ev) {
    loose["on"+ev] = inspector(ev);
  });
  loose.onend = function () {
    sys.error("end");
  };
  
  loose.write(xml).close();
});

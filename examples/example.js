
var posix = require("posix"),
  sys = require("sys"),
  xml = posix.cat("test.xml"),
  sax = require("./sax"),
  strict = sax.parser(true),
  loose = sax.parser(),
  inspector = function (ev) { return function (data) {
    sys.error(ev+": "+sys.inspect(data));
  }};

xml.addCallback(function (xml) {
  // strict.write(xml);
  
  ["processingInstruction",
      "text", "comment","openTag",
      "closeTag","attribute"].forEach(function (ev) {
    loose.addListener(ev, inspector(ev));
  });
  loose.addListener("end", function () {
    sys.error("end");
  });
  
  loose.write(xml).close();
});

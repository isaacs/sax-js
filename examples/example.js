
var fs = require("fs"),
  util = require("util"),
  path = require("path"),
  sax = require("../lib/sax"),
  strict = sax.parser(true),
  loose = sax.parser(false, {trim:true}),
  inspector = function (ev) { return function (data) {
    // util.error("");
    // util.error(ev+": "+util.inspect(data));
    // for (var i in data) util.error(i+ " "+util.inspect(data[i]));
    // util.error(this.line+":"+this.column);
  }};

fs.readFile(path.join(__dirname, "test.xml"), function (err, xml) {
  if (err) throw err;
  // strict.write(xml);
  
  sax.EVENTS.forEach(function (ev) {
    loose["on"+ev] = inspector(ev);
  });
  loose.onend = function () {
    // util.error("end");
    // util.error(util.inspect(loose));
  };
  
  // do this one char at a time to verify that it works.
  // (function () {
  //   if (xml) {
  //     loose.write(xml.substr(0,1000));
  //     xml = xml.substr(1000);
  //     process.nextTick(arguments.callee);
  //   } else loose.close();
  // })();
  
  for (var i = 0; i < 1000; i ++) {
    loose.write(xml);
    loose.close();
  }

});

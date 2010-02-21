var path = require("path"),
  sax = require(path.join(__dirname, "../lib/sax")),
  common = require(__dirname);

// set this really low so that I don't have to put 64 MB of xml in here.
sax.MAX_BUFFER_LENGTH = 5;

var p = common.test({
  expect : [
    ["error", "Max buffer length exceeded: tagName\nLine: 0\nColumn: 15\nChar: "],
    ["error", "Max buffer length exceeded: tagName\nLine: 0\nColumn: 30\nChar: "],
    ["error", "Max buffer length exceeded: tagName\nLine: 0\nColumn: 45\nChar: "],
    ["opentag", {
     "name": "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ",
     "attributes": {}
    }],
    ["text", "yo"],
    ["closetag", "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ"]
  ]
});



// 
// sax.EVENTS.forEach(function (ev) {
//   p["on"+ev] = function (arg) {
//     sys.error("EVENT: "+ev+" "+sys.inspect(arg));
//   };
// });

// p.onerror = function (er) {
//   sys.debug(er.message);
//   this.resume();
// };


p .write("<abcdefghijklmn")
  .write("opqrstuvwxyzABC")
  .write("DEFGHIJKLMNOPQR")
  .write("STUVWXYZ>")
  .write("yo")
  .write("</abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ>")
  .close();
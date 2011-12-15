var fs            = require('fs')
  , sax           = require('../lib/sax-json.js')
  , parse_stream  = sax.createStream()
  ;

parse_stream.on('error', function(er) {
  console.log(er);
});

parse_stream.on("openobject", function (key) {
  console.log(key);
});
//
//parse_stream.on("end", function () {
//  console.log("im done");
//});
//
//parse_stream.on("start", function () {
//  console.log("im done");
//});
//
//parse_stream.on("ready", function () {
//  console.log("im done");
//});

fs.createReadStream("foo.json").pipe(parse_stream);
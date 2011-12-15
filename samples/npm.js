var fs            = require('fs')
  , request       = require('request')
  , sax           = require('../lib/sax-json.js')
  , parse_stream  = sax.createStream()
  , get_stream    =
    request('http://isaacs.couchone.com/registry/_all_docs?include_docs=true')
  ;

  get_stream.pipe(parse_stream);

stream.on('error', function(er) {
  console.log(err);
});

saxStream.on("opentag", function (node) {
  console.log(node);
});

saxStream.on("end", function () {
  console.log("im done");
});

// fs.writeFileSync('npm.json', JSON.stringify(dict.export(),null,2));

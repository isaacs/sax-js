// forked from github.com/creationix/jsonparser

var fs       = require('fs')
  , clarinet = require('../clarinet')
  , start    = { parser: null, stream: null }
  , samples  = ['npm.json', 'twitter.json']
  , stream   = clarinet.createStream()
  , parser   = clarinet.parser()
  ;

parser.onend = function () { 
  console.log('parser: %s', Date.now()-start.parser);
};

stream.on('end', function () {
  console.log('stream: %s', Date.now()-start.stream);
});

for(var i in samples) {a
  var current = samples[i];
  console.log('$', current);
  
  run_test(current, process.ARGV[2]);
}

function run_test(current,who) {
  start[who] = Date.now();
  var file_stream    = 
     fs.createReadStream(__dirname + "/../samples/"+current);
   file_stream.setEncoding('utf-8');
   file_stream.on('data', function (chunk){
     
   });
  while (true) {
    var start = Date.now();
    for (var i = 0; i < 1000; i++) {
      JSON.parse(json);
    }
    var first = Date.now() - start;
    console.log("JSON.parse took %s", first);
  
    start = Date.now();
    var p = new Parser();
    for (var i = 0; i < 1000; i++) {
      p.write(json);
    }
    var second = Date.now() - start;
    console.log("streaming parser took %s", second);
    console.log("streaming is %s times slower", second / first);
  }

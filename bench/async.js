// forked from github.com/creationix/jsonparse
// npm install jsonparse async

// node bench/async.js samples/npm.json
//                    jsonfile         
console.log('=N("node bench/async.js ' + process.argv[2] + '")');
console.log('=N("clp (clarinet parser), cls (clarinet event emitter)")');
console.log('=N("jpp (creationix/jsonparse)")');

var fs         = require('fs')
  , clarinet   = require('../clarinet')
  , Parser     = require('jsonparse')
  , jsonparser
  , p
  , s
  , start
  ;

function stream_bench(cb) {
  s          = clarinet.createStream()
  s.on('end', function () {
    console.log('cls, %s', Date.now()-start);
    cb();
  });
  start = Date.now();
  var fs_read = fs.createReadStream(process.argv[2]);
  fs_read.setEncoding('utf-8');
  fs_read.pipe(s);
}

function parser_bench(cb) {
  p          = clarinet.parser()
  p.onend = function () { 
    console.log('clp, %s', Date.now()-start);
    cb();
  };
  var fs_read = fs.createReadStream(process.argv[2]);
  fs_read.setEncoding('utf-8');
  fs_read.on('data', function(chunk) { p.write(chunk); });
  fs_read.on('end', function () { p.end(); });
  start = Date.now();
}

function jsonparse_bench(cb) {
  jsonparser = new Parser()
  var fs_read = fs.createReadStream(process.argv[2]);
  var buffer  = [];
  var bodyLen = 0;
  fs_read.on('data', function(chunk) { 
    buffer.push(chunk);
    bodyLen += chunk.length;
  });
  fs_read.on('end', function () { 
    var body = new Buffer(bodyLen);
    var i = 0;
    buffer.forEach(function (chunk) {
      chunk.copy(body, i, 0, chunk.length);
      i += chunk.length;
    });
    start = Date.now();
    jsonparser.write(body);
    console.log('jpp, %s', Date.now()-start);
    setTimeout(repeat,0);
  });
}

function repeat() {
  stream_bench(function () {
    return parser_bench(function () { return jsonparse_bench(function(){})})
  });
}

repeat();
//async.whilst(
//    function () { return true; },
//    function (callback) {
//      var fs = [ stream_bench, parser_bench, jsonparse_bench];
//      async.series(fs, function() { c(); });
//    }
//);

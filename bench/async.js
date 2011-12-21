// forked from github.com/creationix/jsonparse

// brew install yajl
// npm install jsonparse yajl

// node bench/async.js samples/npm.json
//                    jsonfile         
var fs         = require('fs')
  , clarinet   = require('../clarinet')
  , Parser     = require('jsonparse')
  , jsonparser
  , p
  , s
  , start
  , max        = process.argv[3] || 1
  , n          = process.argv[4] || 9
  ;

console.log('=N("node bench/a sync.js ' + process.argv[2] + ' ' +
     max + ' ' + n + '")');
console.log('=N("clp (clarinet parser), cls (clarinet event emitter)")');
//console.log('=N("jpp (creationix/jsonparse)")');

function stream_bench(cb) {
  s          = clarinet.createStream();
  s.on('end', function () {
    console.log('cls, %s', Date.now()-start);
    cb();
  });
  var fs_read = fs.createReadStream(process.argv[2]);
  fs_read.setEncoding('utf-8');
  fs_read.on('data', function(chunk) { 
    for (var i = 0; i < max; i++) s.write(chunk); 
  });
  fs_read.on('end', function () { s.end(); });
  start = Date.now();
}

function parser_bench(cb) {
  p          = clarinet.parser();
  p.onend = function () { 
    console.log('clp, %s', Date.now()-start);
    cb();
  };
  var fs_read = fs.createReadStream(process.argv[2]);
  fs_read.setEncoding('utf-8');
  fs_read.on('data', function(chunk) { 
    for (var i = 0; i < max; i++) p.write(chunk); 
  });
  fs_read.on('end', function () { 
    p.end(); 
    if(n===0) process.exit();
    n--;
    setTimeout(repeat,0);
  });
  start = Date.now();
}
// doesnt make sense to compare to sync
// pretending its async is not being async
//
// if anyone wants to implement it in async this is how (creationix
// as fixed the module and provided a example:
// https://gist.github.com/1506454
//
//function jsonparse_bench(cb) {
//  jsonparser = new Parser();
//  var fs_read = fs.createReadStream(process.argv[2]);
//  var buffer  = [];
//  var bodyLen = 0;
//  fs_read.on('data', function(chunk) { 
//    buffer.push(chunk);
//    bodyLen += chunk.length;
//  });
//  fs_read.on('end', function () { 
//    var body = new Buffer(bodyLen);
//    var i = 0;
//    buffer.forEach(function (chunk) {
//      chunk.copy(body, i, 0, chunk.length);
//      i += chunk.length;
//    });
//    start = Date.now();
//    for (var i = 0; i < max; i++)  jsonparser.write(body);
//    console.log('jpp, %s', Date.now()-start);
//    if(n===0) process.exit();
//    n--;
//    setTimeout(repeat,0);
//  });
//}

function repeat() {
  stream_bench(function () {
    return parser_bench(function(){ }); });
}

repeat();
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
  , averages   = {}
  ;

function update_averages(what, time) {
  if(averages[what]) {
    averages[what].n++;
    averages[what].time = averages[what].time + time;
  }
  else averages[what] = {n: 1, time: time};
}

console.log('=N("node bench/async.js ' + process.argv[2] + ' ' +
     max + ' ' + n + '")');
console.log('=N("clp (clarinet parser), cls (clarinet event emitter)")');
//console.log('=N("jpp (creationix/jsonparse)")');

function stream_bench(cb) {
  s          = clarinet.createStream();
  s.on('end', function () {
    var exectime = Date.now()-start;
    console.log('cls, %s', exectime);
    update_averages('cls', exectime);
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
    var exectime = Date.now()-start;
    console.log('clp, %s', exectime);
    update_averages('clp', exectime);    cb();
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

function repeat() {
  stream_bench(function () {
    return parser_bench(function(){ }); });
}

function output_avg() {
  console.log('=N("# Version")');
  console.log('=N("' + JSON.stringify(process.versions).replace(/"/g, "'") + '")');
  console.log('=N("# Summary")');
  for(var k in averages) {
    console.log('=N("* %s [%s]: %s ms")', k, averages[k].n, 
      averages[k].time/averages[k].n);
  }
}

process.on('SIGINT', function () {
  output_avg();
  process.exit(1);
});

process.on('exit', output_avg);

repeat();
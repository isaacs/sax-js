// forked from github.com/creationix/jsonparse

// brew install yajl
// npm install jsonparse yajl

// node bench/sync.js samples/npm.json 5
//                    jsonfile         number of cycles

var fs         = require('fs')
  , clarinet   = require('../clarinet')
  , Parser     = require('jsonparse')
  , jsonparser = new Parser()
  , file       = fs.readFileSync(process.argv[2])
  , string     = file.toString()
  , p          = clarinet.parser()
  , s          = clarinet.createStream()
  , max        = process.argv[3] || 1
  , n          = process.argv[4] || 9
  ;

console.log('=N("node bench/sync.js ' + process.argv[2] + ' ' +
   max + ' ' + n + '")');
console.log('=N("clp (clarinet parser), cls (clarinet event emitter)")');
console.log('=N("jpp (creationix/jsonparse), v8s (JSON.parse string)")');
console.log('=N("v8b (JSON.parse buffer)")');

while (true) {
  try {
    start = Date.now();
    for (var i = 0; i < max; i++) p.write(string);
    console.log("clp, %s", Date.now()-start);
  } catch (ex1) { }

  // slower
  try {
    start = Date.now();
    for (var i = 0; i < max; i++) s.write(string);
    console.log("cls, %s", Date.now()-start);
  } catch (ex1) { }

  try {
    start = Date.now();
    for (var i = 0; i < max; i++) jsonparser.write(file);
    console.log("jpp, %s", Date.now()-start);
  } catch (ex2) { }

  try {
    start = Date.now();
    for (var i = 0; i < max; i++) JSON.parse(string);
    console.log("v8s, %s", Date.now()-start);
  } catch (ex3) { }

  // slower
  try {
    start = Date.now();
    for (var i = 0; i < max; i++) JSON.parse(file);
    console.log("v8b, %s", Date.now()-start);
  } catch (ex4) { }

  if(n===0) return;
  n--;
}

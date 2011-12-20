// forked from github.com/creationix/jsonparse

// npm install jsonparse

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
  , max        = process.argv[3]
  ;

while (true) {
  try {
    start = Date.now();
    for (var i = 0; i < max; i++) p.write(string);
    console.log("clp: %s", Date.now()-start);
  } catch (ex1) { console.log( "clp: -1"); }

  try {
    start = Date.now();
    for (var i = 0; i < max; i++) s.write(string);
    console.log("cls: %s", Date.now()-start);
  } catch (ex1) { console.log( "cls: -1"); }

  try {
    start = Date.now();
    for (var i = 0; i < max; i++) jsonparser.write(file);
    console.log("jpp: %s", Date.now()-start);
  } catch (ex2) { console.log( "jpp: -1"); }

  try {
    start = Date.now();
    for (var i = 0; i < max; i++) JSON.parse(string);
    console.log("v8s: %s", Date.now()-start);
  } catch (ex3) { console.log( "v8s: -1"); }

  try {
    start = Date.now();
    for (var i = 0; i < max; i++) JSON.parse(file);
    console.log("v8b: %s", Date.now()-start);
  } catch (ex4) { console.log( "v8b: -1"); }

}

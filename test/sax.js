if (!clarinet) { // node 
  var spell  = require('../clarinet.js')
    , assert = require('assert')
    , fs     = require('fs')
    , big    = JSON.parse(fs.readFileSync(__dirname + '/resources/big.json'))
    , PERF1  = require('./resources/perf1')
    , PERF2  = require('./resources/perf2')
    ;
} else {
  var big = BIG;
}
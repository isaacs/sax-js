// set this really low so that I don't have to put 64 MB of xml in here.
var sax = require("../lib/sax")
var assert = require('assert')
var bl = sax.MAX_BUFFER_LENGTH
sax.MAX_BUFFER_LENGTH = 5;

var p = require(__dirname).test({
  expect : [
    ["error", "Max buffer length exceeded: tagName\nLine: 0\nColumn: 15\nChar: "]
  ]
});

assert.throws(function(){
  p.write("shouldn't be able to write once error is thrown")  
})

sax.MAX_BUFFER_LENGTH = bl

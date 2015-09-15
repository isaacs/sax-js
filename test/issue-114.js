// https://github.com/isaacs/sax-js/issues/114
var assert = require('assert')
var sax = require('../lib/sax')
var errorCalls = 0
var parser = sax.parser(true)

parser.onerror = function(){
  if(errorCalls)assert.fail('\'onerror\' should only be called once.')
  ++errorCalls
}

parser.onend  = function(){
  assert.fail('\'onend\' should not be called when \'onerror\' has been called.')
}

parser.write(
  '<stream.error should not be called multiple times.'
  + 'Stream.end should not be called when onerror is called'
).end()

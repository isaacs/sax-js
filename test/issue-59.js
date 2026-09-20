// https://github.com/isaacs/sax-js/issues/59
var tap = require('tap')
var sax = require('../lib/sax')

tap.test('SAXStream.close exists and ends the stream', function (t) {
  var stream = sax.createStream(true)
  var tags = []
  var ended = false

  stream.on('opentag', function (node) {
    tags.push(node.name)
  })
  stream.on('end', function () {
    ended = true
  })

  t.type(stream.close, 'function')
  stream.write('<root>hi</root>')
  t.doesNotThrow(function () {
    stream.close()
  })
  t.same(tags, ['root'])
  t.equal(ended, true)
  t.end()
})

tap.test('SAXStream.close on an empty stream does not throw', function (t) {
  var stream = sax.createStream()
  var ended = false
  stream.on('end', function () {
    ended = true
  })
  t.doesNotThrow(function () {
    stream.close()
  })
  t.equal(ended, true)
  t.end()
})

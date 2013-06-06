var assert = require('assert')
var saxStream = require('../lib/sax').createStream()

var b = new Buffer('误')

saxStream.on('text', function(text) {
    assert.equal(text, b.toString())
});

saxStream.write(new Buffer('<test><a>'))
saxStream.write(b.slice(0, 1))
saxStream.write(b.slice(1))
saxStream.write(new Buffer('</a><b>'))
saxStream.write(b.slice(0, 2))
saxStream.write(b.slice(2))
saxStream.write(new Buffer('</b><c>'))
saxStream.write(b)
saxStream.write(new Buffer('</c><d>'))
saxStream.write(b.slice(0, 1))
saxStream.end(Buffer.concat([b.slice(1), new Buffer('</d></test>')]))

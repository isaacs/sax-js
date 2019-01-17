var tap = require('tap')

// pausable stream that will understand and handle push returning false
var Readable = require('stream').Readable
var inputStream = new Readable()
var saxStream = require('../lib/sax').createStream()

var paused = true
saxStream.pause()

saxStream.on('data', function () {
  tap.equal(false, paused, 'Received data while paused')
})

inputStream.pipe(saxStream)

inputStream.push('<test><a>')
inputStream.push('</a><b>')
inputStream.push('</b><c>')
inputStream.push('</c>')
inputStream.push('<d>')
inputStream.push('</d></test>')
inputStream.push(null)

paused = false
saxStream.resume()

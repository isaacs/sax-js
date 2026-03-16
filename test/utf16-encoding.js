var t = require('tap')
var sax = require('../lib/sax')

t.test('parses utf-16 xml streams when the declaration says UTF-16', t => {
  var stream = sax.createStream(true)
  var result = {
    processinginstruction: null,
    opentagstart: null,
    opentag: null,
    text: '',
    closetag: null,
    error: null,
    errorCount: 0,
  }
  var xml =
    '<?xml version="1.0" encoding="UTF-16"?>\n<person>Hi Jérôme</person>'
  var utf16 = Buffer.concat([
    Buffer.from([0xff, 0xfe]),
    Buffer.from(xml, 'utf16le'),
  ])

  stream.on('processinginstruction', function (node) {
    result.processinginstruction = node
  })

  stream.on('opentagstart', function (node) {
    result.opentagstart = node
  })

  stream.on('opentag', function (node) {
    result.opentag = node
  })

  stream.on('text', function (text) {
    result.text += text
  })

  stream.on('closetag', function (name) {
    result.closetag = name
  })

  stream.on('error', function (err) {
    if (!result.error) {
      result.error = err.message
    }
    result.errorCount += 1
  })

  stream.on('end', function () {
    t.same(result, {
      processinginstruction: {
        name: 'xml',
        body: 'version="1.0" encoding="UTF-16"',
      },
      opentagstart: { name: 'person', attributes: {}, isSelfClosing: false },
      opentag: { name: 'person', attributes: {}, isSelfClosing: false },
      text: '\nHi Jérôme',
      closetag: 'person',
      error: null,
      errorCount: 0,
    })
    t.end()
  })

  stream.write(utf16.slice(0, 7))
  stream.write(utf16.slice(7, 34))
  stream.end(utf16.slice(34))
})

t.test('fails in strict mode when declared encoding conflicts with detected utf-16', t => {
  var stream = sax.createStream(true)
  var error = null
  var xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<person>Hi Jérôme</person>'
  var utf16 = Buffer.concat([
    Buffer.from([0xff, 0xfe]),
    Buffer.from(xml, 'utf16le'),
  ])

  stream.on('error', function (err) {
    if (!error) {
      error = err.message
    }
  })

  stream.on('end', function () {
    t.equal(
      error,
      'XML declaration encoding UTF-8 does not match detected stream encoding UTF-16LE\nLine: 0\nColumn: 38\nChar: >'
    )
    t.end()
  })

  stream.write(utf16.slice(0, 9))
  stream.end(utf16.slice(9))
})

t.test('does not fail in non-strict mode when declared encoding conflicts with detected utf-16', t => {
  var stream = sax.createStream(false)
  var result = {
    text: '',
    error: null,
  }
  var xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<person>Hi Jérôme</person>'
  var utf16 = Buffer.concat([
    Buffer.from([0xff, 0xfe]),
    Buffer.from(xml, 'utf16le'),
  ])

  stream.on('text', function (text) {
    result.text += text
  })

  stream.on('error', function (err) {
    if (!result.error) {
      result.error = err.message
    }
  })

  stream.on('end', function () {
    t.same(result, {
      text: '\nHi Jérôme',
      error: null,
    })
    t.end()
  })

  stream.write(utf16.slice(0, 9))
  stream.end(utf16.slice(9))
})

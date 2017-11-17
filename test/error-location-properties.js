var sax = require('../lib/sax')
var t = require('tap')

t.plan(4)

var parser = sax.parser(true)

parser.onerror = function (error) {
  t.equal(error.message, 'Unexpected close tag\nLine: 2\nColumn: 7\nChar: >')
  t.equal(error.line, 2)
  t.equal(error.column, 7)
  t.equal(error.char, '>')
  parser.resume()
}

parser.write('<root>\n<p>Hello, world\n</root>').close()


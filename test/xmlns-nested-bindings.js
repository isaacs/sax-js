// Closing a tag must not walk every namespace binding in scope.
// Each element below declares one prefix, so the scope chain grows
// with the depth. Walking it on every close tag made this document
// (about 44 KB) take tens of seconds to parse.
var sax = require('../lib/sax')
var t = require('tap')

var depth = 2000
var xml = ''
for (var i = 0; i < depth; i++) {
  xml += '<a xmlns:p' + i + '="urn:' + i + '">'
}
for (var j = 0; j < depth; j++) {
  xml += '</a>'
}

var parser = sax.parser(true, { xmlns: true })
var opened = []
var closed = []
parser.onopennamespace = function (ns) {
  opened.push(ns.prefix)
}
parser.onclosenamespace = function (ns) {
  closed.push(ns.prefix)
}
parser.onerror = function (er) {
  t.fail(er.message)
}

var start = Date.now()
parser.write(xml).close()
var elapsed = Date.now() - start

t.equal(opened.length, depth, 'one opennamespace per element')
t.equal(closed.length, depth, 'one closenamespace per element')
t.equal(opened[0], 'p0')
t.equal(closed[0], 'p' + (depth - 1), 'innermost binding closes first')
t.ok(elapsed < 2000, 'parsed in ' + elapsed + 'ms, expected under 2000ms')

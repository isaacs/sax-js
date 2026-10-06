var t = require('tap')
var sax = require('../lib/sax')

// duplicate attribute detection must not be quadratic in the number of
// attributes on an element
t.test('attribute-mega', t => {
  var count = 200000
  var xml = '<r'
  for (var i = 0; i < count; i++) {
    xml += ' a' + i + '="v"'
  }
  xml += '/>'

  var parser = sax.parser(true, { xmlns: true })
  var attributes = null
  parser.onopentag = tag => {
    attributes = tag.attributes
  }
  var start = Date.now()
  parser.write(xml).close()
  var elapsed = Date.now() - start

  t.equal(Object.keys(attributes).length, count)
  t.ok(
    elapsed < 5000,
    'Expected parsing to take < 5s, took ' + elapsed + 'ms'
  )
  t.end()
})

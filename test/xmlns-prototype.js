var t = require('tap')
var sax = require('../lib/sax')

// 2026-10-10: A valid namespace prefix must not invoke an inherited setter.
t.test('the __proto__ namespace binding follows nested scopes', t => {
  var parser = sax.parser(true, { xmlns: true })
  var tags = []
  var attributes = []
  var opened = []
  var closed = []
  parser.onopentag = tag => tags.push(tag.uri)
  parser.onattribute = attribute => attributes.push(attribute)
  parser.onopennamespace = binding => opened.push(binding)
  parser.onclosenamespace = binding => closed.push(binding)
  parser
    .write(
      '<__proto__:outer xmlns:__proto__="urn:outer">' +
        '<__proto__:inner xmlns:__proto__="urn:inner" __proto__:value="ok"/>' +
        '<__proto__:sibling/>' +
        '</__proto__:outer>'
    )
    .close()
  t.same(tags, ['urn:outer', 'urn:inner', 'urn:outer'])
  t.same(attributes[2], {
    name: '__proto__:value',
    value: 'ok',
    prefix: '__proto__',
    local: 'value',
    uri: 'urn:inner',
  })
  t.same(opened, [
    { prefix: '__proto__', uri: 'urn:outer' },
    { prefix: '__proto__', uri: 'urn:inner' },
  ])
  t.same(closed, opened.slice().reverse())
  t.end()
})

// 2026-10-10: Object.prototype properties do not declare namespace prefixes.
t.test('unbound prototype names fail in strict namespace mode', t => {
  for (var prefix of ['__proto__', 'constructor', 'toString', 'valueOf']) {
    t.throws(
      () =>
        sax
          .parser(true, { xmlns: true })
          .write('<' + prefix + ':r/>')
          .close(),
      /Unbound namespace prefix/,
      prefix + ' element'
    )
    t.throws(
      () =>
        sax
          .parser(true, { xmlns: true })
          .write('<r ' + prefix + ':a="v"/>')
          .close(),
      /Unbound namespace prefix/,
      prefix + ' attribute'
    )
  }
  t.end()
})

var t = require('tap')
var sax = require('../lib/sax')

var cases = [
  [
    '<r><a>content&x</a><b/></r>',
    [
      ['open', 'R', {}],
      ['open', 'A', {}],
      ['text', 'content&x'],
      ['close', 'A'],
      ['open', 'B', {}],
      ['close', 'B'],
      ['close', 'R'],
    ],
  ],
  [
    '<r>&<a/></r>',
    [
      ['open', 'R', {}],
      ['text', '&'],
      ['open', 'A', {}],
      ['close', 'A'],
      ['close', 'R'],
    ],
  ],
  [
    '<r>&x&amp;</r>',
    [
      ['open', 'R', {}],
      ['text', '&x&'],
      ['close', 'R'],
    ],
  ],
  [
    '<r a="&x" b="ok"/>',
    [
      ['open', 'R', { A: '&x', B: 'ok' }],
      ['close', 'R'],
    ],
  ],
  [
    "<r a='&x' b='ok'/>",
    [
      ['open', 'R', { A: '&x', B: 'ok' }],
      ['close', 'R'],
    ],
  ],
  [
    '<r a=&x b=ok></r>',
    [
      ['open', 'R', { A: '&x', B: 'ok' }],
      ['close', 'R'],
    ],
  ],
  [
    '<r>&x\n<a/></r>',
    [
      ['open', 'R', {}],
      ['text', '&x\n'],
      ['open', 'A', {}],
      ['close', 'A'],
      ['close', 'R'],
    ],
  ],
]

cases.forEach(function (entry) {
  var xml = entry[0]
  t.test(xml, function (t) {
    for (var split = 0; split <= xml.length; split++) {
      var parser = sax.parser(false)
      var events = []
      var position
      parser.onopentag = function (tag) {
        events.push(['open', tag.name, tag.attributes])
      }
      parser.onclosetag = function (name) {
        events.push(['close', name])
      }
      parser.ontext = function (text) {
        events.push(['text', text])
      }
      parser.onend = function () {
        position = [parser.position, parser.line, parser.column]
      }
      parser.write(xml.slice(0, split)).write(xml.slice(split)).close()
      t.same(events, entry[1], 'events at split ' + split)
      var lines = xml.split('\n')
      t.same(
        position,
        [xml.length, lines.length - 1, lines[lines.length - 1].length],
        'position at split ' + split
      )
    }
    t.end()
  })
})

t.test('single-character chunks without position tracking', function (t) {
  cases.forEach(function (entry) {
    var parser = sax.parser(false, { position: false })
    var events = []
    parser.onopentag = function (tag) {
      events.push(['open', tag.name, tag.attributes])
    }
    parser.onclosetag = function (name) {
      events.push(['close', name])
    }
    parser.ontext = function (text) {
      events.push(['text', text])
    }
    entry[0].split('').forEach(function (character) {
      parser.write(character)
    })
    parser.close()
    t.same(events, entry[1], entry[0])
  })
  t.end()
})

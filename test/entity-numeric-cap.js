/**
 * @fileoverview
 *   Numeric character references (e.g. &#10;) resolve to a single literal
 *   code point and cannot reference other entities, so they can never drive a
 *   billion-laughs style expansion. They must therefore not count toward the
 *   entity cap enforced when `unparsedEntities` is enabled.
 *
 *   Regression test for https://github.com/isaacs/sax-js/issues/284
 *   ("Entity cap is too conservative"), reported from SVGO where documents
 *   with many `&#10;` newline references tripped the cap.
 */

var t = require('tap')
var sax = require('../lib/sax')

for (var strictMode of [true, false]) {
  t.test(
    'numeric character references do not count toward the entity cap',
    t => {
      var parser = sax.parser(strictMode, {
        unparsedEntities: true,
        maxEntityCount: 2,
        maxEntityDepth: 1,
      })

      var text = ''
      parser.ontext = function (chunk) {
        text += chunk
      }

      t.doesNotThrow(() => {
        // Ten newline references, far more than maxEntityCount.
        parser
          .write(
            '<r>&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;&#10;</r>'
          )
          .close()
      }, 'numeric references above the cap must not throw')

      t.equal(text, '\n'.repeat(10), 'all references resolve to newlines')
      t.equal(parser.entityCount, 0, 'numeric references are not counted')
      t.end()
    }
  )

  t.test('hex numeric references are also excluded from the cap', t => {
    var parser = sax.parser(strictMode, {
      unparsedEntities: true,
      maxEntityCount: 2,
    })

    var text = ''
    parser.ontext = function (chunk) {
      text += chunk
    }

    t.doesNotThrow(() => {
      parser.write('<r>&#x41;&#x42;&#x43;&#x44;&#x45;</r>').close()
    })

    t.equal(text, 'ABCDE', 'hex references resolve correctly')
    t.equal(parser.entityCount, 0, 'hex references are not counted')
    t.end()
  })

  t.test('named entities still count toward the cap', t => {
    var parser = sax.parser(strictMode, {
      unparsedEntities: true,
      maxEntityCount: 3,
    })
    parser.ENTITIES = { ...parser.ENTITIES, foo: 'bar' }

    t.throws(
      () => {
        parser.write('<r>&foo;&foo;&foo;&foo;</r>')
      },
      { message: 'Parsed entity count exceeds max entity count' },
      'named entities are still capped'
    )
    t.end()
  })
}

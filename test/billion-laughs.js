/**
 * @fileoverview
 *   See: https://en.wikipedia.org/wiki/Billion_laughs_attack
 */

var t = require('tap')
var sax = require('../lib/sax')

var ENTITIES = {
  lol: 'lolz',
  lol1: '&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;',
  lol2: '&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;',
  lol3: '&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;',
  lol4: '&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;',
  lol5: '&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;',
  lol6: '&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;',
  lol7: '&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;',
  lol8: '&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;',
  lol9: '&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;',
}

var BODY =
  '<?xml version="1.0"?><!DOCTYPE lolz [<!ELEMENT lolz (#PCDATA)>]><lolz>&lol9;</lolz>'

for (var strictMode of [true, false]) {
  t.test(
    'should not throw on billion laughs with unparsed entities disabled',
    t => {
      var parser = sax.parser(strictMode)
      parser.ENTITIES = { ...parser.ENTITIES, ...ENTITIES }

      t.doesNotThrow(() => {
        parser.write(BODY).close()
      })
      t.end()
    }
  )

  t.test(
    'should count number of entities including nested entities',
    t => {
      var parser = sax.parser(strictMode, {
        unparsedEntities: true,
      })
      parser.ENTITIES = { ...parser.ENTITIES, ...ENTITIES }

      parser.write(
        '<?xml version="1.0"?><!DOCTYPE lolz [<!ELEMENT lolz (#PCDATA)>]><lolz>&lol2;</lolz>'
      )

      t.equal(parser.entityCount, 111)
      parser.close()
      t.end()
    }
  )

  t.test('should count depth of entities correctly', t => {
    var parser = sax.parser(strictMode, {
      unparsedEntities: true,
      maxEntityDepth: 3,
    })

    t.doesNotThrow(() => {
      parser.ENTITIES = { ...parser.ENTITIES, ...ENTITIES }
      parser
        .write(
          '<?xml version="1.0"?><!DOCTYPE lolz [<!ELEMENT lolz (#PCDATA)>]><lolz>&lol2;</lolz>'
        )
        .close()
    })

    t.throws(
      () => {
        parser.ENTITIES = { ...parser.ENTITIES, ...ENTITIES }
        parser.write(
          '<?xml version="1.0"?><!DOCTYPE lolz [<!ELEMENT lolz (#PCDATA)>]><lolz>&lol3;</lolz>'
        )
      },
      {
        message: 'Parsed entity depth exceeds max entity depth',
      }
    )

    t.end()
  })

  t.test(
    'should throw on billion laughs with only entity count check',
    t => {
      var parser = sax.parser(strictMode, {
        unparsedEntities: true,
        maxEntityDepth: Number.MAX_SAFE_INTEGER,
      })
      parser.ENTITIES = { ...parser.ENTITIES, ...ENTITIES }

      t.throws(
        () => {
          parser.write(BODY)
        },
        {
          message: 'Parsed entity count exceeds max entity count',
        }
      )
      t.end()
    }
  )

  t.test(
    'should throw on billion laughs with only entity depth check',
    t => {
      var parser = sax.parser(strictMode, {
        unparsedEntities: true,
        maxEntityCount: Number.MAX_SAFE_INTEGER,
      })
      parser.ENTITIES = { ...parser.ENTITIES, ...ENTITIES }

      t.throws(
        () => {
          parser.write(BODY)
        },
        {
          message: 'Parsed entity depth exceeds max entity depth',
        }
      )
      t.end()
    }
  )
}

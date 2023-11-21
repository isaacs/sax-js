var sax = require('../lib/sax')

var t = require('tap')

exports.sax = sax

// handy way to do simple unit tests
// if the options contains an xml string, it'll be written and the parser closed.
// otherwise, it's assumed that the test will write and close.
exports.test = function test (options) {
  var xml = options.xml
  var parser = sax.parser(options.strict, options.opt)
  var expect = options.expect
  var e = 0
  sax.EVENTS.forEach(function (ev) {
    parser['on' + ev] = function (...data) {
      if (process.env.DEBUG) {
        console.error({
          expect: expect[e],
          actual: [ev, ...data]
        })
      }
      if (e >= expect.length && (ev === 'end' || ev === 'ready')) {
        return
      }
      t.ok(e < expect.length, 'no unexpected events')
      
      if (!expect[e]) {
        t.fail('did not expect the event ' + ev, {
          event: ev,
          expect: expect,
          data: data
        })
        return
      }

      t.equal(ev, expect[e][0])
      if (ev === 'error') {
        t.equal(data[0].message, expect[e][1])
      } else {
        expect[e].slice(1).forEach((v,i) => {
          t.same(data[i], v)
        })
      }
      e++
      if (ev === 'error') {
        parser.resume()
      }
    }
  })
  if (xml) {
    parser.write(xml).close()
  }
  return parser
}

if (module === require.main) {
  t.pass('common test file')
}

var process = require('process')
var t = require('tap')
var sax = require('../lib/sax')

t.test('cdata-mega', t => {
  var bytesInMiB = 1024 * 1024
  var cdataSize = 1 * bytesInMiB
  var expectedUpperBound = cdataSize * 2
  var cdataContent = 'X'.repeat(cdataSize)
  var xml = '<r><![CDATA[' + cdataContent + ']]></r>'

  var memoryUsageBefore = process.memoryUsage().heapUsed

  var parser = sax.parser()
  var parsedCData = null
  parser.oncdata = c => {
    parsedCData = c
  }
  parser.write(xml).close()
  var memoryUsageDiff = process.memoryUsage().heapUsed - memoryUsageBefore

  t.equal(parsedCData, cdataContent)
  t.ok(
    memoryUsageDiff < expectedUpperBound,
    'Expected at most ' +
      expectedUpperBound / bytesInMiB +
      ' MiB to be allocated, was ' +
      memoryUsageDiff / bytesInMiB,
  )
  t.end()
})

var parser = require(__dirname).test({
  expect: [
    ['opentagstart', {'name': 'T', attributes: {}}],
    ['opentag', {'name': 'T', attributes: {}, isSelfClosing: false}],
    ['text', 'flush']
  ]
})

parser.write('<T>flush')
parser.flush(true)
parser.write('rest</T>')
parser.close()

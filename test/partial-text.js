var parser = require(__dirname).test({
    expect: [
      ['opentagstart', {'name': 'A', attributes: {}}],
      ['opentag', {'name': 'A', attributes: {}, isSelfClosing: false}],
      ['opentagstart', {'name': 'B', attributes: {}}],
      ['opentag', {'name': 'B', attributes: {}, isSelfClosing: false}],
      ['partialtext', 'foo '],
      ['partialtext', 'foo bar'],
      ['text', 'foo bar world'],
      ['closetag', 'B'],
      ['opentagstart', {'name': 'C', attributes: {}}],
      ['opentag', {'name': 'C', attributes: {}, isSelfClosing: false}],
      ['text', 'full node'],
      ['closetag', 'C'],
      ['closetag', 'A']
    ]
  })
  
  parser.write('<A><B>foo ')
  parser.write('bar')
  parser.write(' world</')
  parser.write('B>')
  parser.write('<C>full node</C></A>')
  parser.close()
  
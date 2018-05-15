require(__dirname).test({
  xml: '<r><?Is this legal XML??></r>',
  expect: [
    ['opentagstart', {'name': 'R', 'attributes': {}}],
    ['opentag', {'name': 'R', 'attributes': {}, 'isSelfClosing': false}],
    [ 'processinginstruction', { name: 'Is', body: 'this legal XML?' } ],
    ['closetag', 'R']
  ]
})

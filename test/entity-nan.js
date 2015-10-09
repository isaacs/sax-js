require(__dirname).test({
  xml: '<r>&#NaN;</r>',
  expect: [
    ['opentag', {'name': 'R', attributes: {}, isSelfClosing: false}],
    ['text', '&#NaN;'],
    ['closetag', 'R']
  ]
})

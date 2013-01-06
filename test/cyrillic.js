require(__dirname).test({
  xml: '<Р>тест</Р>',
  expect: [
    ['opentag', {'name':'Р', attributes:{}}],
    ['text', 'тест'],
    ['closetag', 'Р']
  ]
});

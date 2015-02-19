require(__dirname).test({
  xml: '\uFEFF<Р></Р>',
  expect: [
    ['opentag', {'name':'Р', attributes:{}, isSelfClosing: false}],
    ['closetag', 'Р']
  ]
});

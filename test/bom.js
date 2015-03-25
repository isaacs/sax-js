// BOM at the very begining of the stream should be ignored
require(__dirname).test({
  xml: '\uFEFF<Р></Р>',
  expect: [
    ['opentag', {'name':'Р', attributes:{}, isSelfClosing: false}],
    ['closetag', 'Р']
  ]
});

// In all other places it should be consumed
require(__dirname).test({
  xml: '\uFEFF<Р BOM="\uFEFF">\uFEFFStarts and ends with BOM\uFEFF</Р>',
  expect: [
    ['attribute', {'name':'BOM', 'value':'\uFEFF'}],
    ['opentag', {'name':'Р', attributes:{'BOM':'\uFEFF'}, isSelfClosing: false}],
    ['text', '\uFEFFStarts and ends with BOM\uFEFF'],
    ['closetag', 'Р']
  ]
});

require(__dirname).test({
  xml: '<r>&rfloor; ' +
       '&spades; &copy; &rarr; &amp; ' +
        '&lt; < <  <   < &gt; &real; &weierp; &euro;</r>',
  expect: [
    ['opentag', {'name':'R', attributes:{}}],
    ['text', '⌋ ♠ © → & < < <  <   < > ℜ ℘ €'],
    ['closetag', 'R']
  ]
});

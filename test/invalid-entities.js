var invalidEntities = ['1114112', '-1', 'NaN']

for (var i = invalidEntities.length - 1; i >= 0; --i) {
  require(__dirname).test({
    xml: '<r>&#' + invalidEntities[i] + ';</r>',
    strict: false,
    expect: [
      ['opentagstart', { name: 'R', attributes: {} }],
      ['opentag', { name: 'R', attributes: {}, isSelfClosing: false }],
      ['text', '&#' + invalidEntities[i] + ';'],
      ['closetag', 'R'],
    ],
  })
  require(__dirname).test({
    xml: '<r>&#' + invalidEntities[i] + ';</r>',
    strict: true,
    expect: [
      ['opentagstart', { name: 'r', attributes: {} }],
      ['opentag', { name: 'r', attributes: {}, isSelfClosing: false }],
      [
        'error',
        'Invalid character entity\nLine: 0\nColumn: ' +
          (6 + invalidEntities[i].length) +
          '\nChar: ;',
      ],
      ['text', '&#' + invalidEntities[i] + ';'],
      ['closetag', 'r'],
    ],
  })
}

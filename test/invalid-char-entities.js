// Character references that resolve to a code point that does not match the
// XML `Char` production are not well-formed and must fail in strict mode, the
// same way an out-of-range reference like `&#1114112;` does.
// https://www.w3.org/TR/REC-xml/#NT-Char
// https://www.w3.org/TR/REC-xml/#wf-Legalchar

// Each entry is [reference body after `&#`, column of the closing `;`].
var invalidChars = [
  ['x1', 8], // restricted control character (SOH)
  ['xB', 8], // restricted control character (vertical tab)
  ['x1F', 9], // restricted control character (unit separator)
  ['xD800', 11], // lone surrogate
  ['xDFFF', 11], // lone surrogate
  ['xFFFF', 11], // not a Char
]

for (var i = invalidChars.length - 1; i >= 0; --i) {
  var body = invalidChars[i][0]
  var column = invalidChars[i][1]

  // Strict mode must report the reference as an invalid character entity.
  require(__dirname).test({
    xml: '<r>&#' + body + ';</r>',
    strict: true,
    expect: [
      ['opentagstart', { name: 'r', attributes: {} }],
      ['opentag', { name: 'r', attributes: {}, isSelfClosing: false }],
      [
        'error',
        'Invalid character entity\nLine: 0\nColumn: ' +
          column +
          '\nChar: ;',
      ],
      ['text', '&#' + body + ';'],
      ['closetag', 'r'],
    ],
  })

  // Non-strict mode is lenient and passes the reference through as text.
  require(__dirname).test({
    xml: '<r>&#' + body + ';</r>',
    strict: false,
    expect: [
      ['opentagstart', { name: 'R', attributes: {} }],
      ['opentag', { name: 'R', attributes: {}, isSelfClosing: false }],
      ['text', '&#' + body + ';'],
      ['closetag', 'R'],
    ],
  })
}

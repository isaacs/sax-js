// with entity
require(__dirname).test({
  xml: '<!DOCTYPE svg [ <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/"> ]><svg></svg>',
  expect: [
    [
      'doctype',
      ' svg [ <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/"> ]',
    ],
    ['opentagstart', { name: 'SVG', attributes: {} }],
    ['opentag', { name: 'SVG', attributes: {}, isSelfClosing: false }],
    ['closetag', 'SVG'],
  ],
})

// with comment
require(__dirname).test({
  xml: "<!DOCTYPE svg [<!--comment with ' and ] symbols-->]><svg></svg>",
  expect: [
    ['comment', "comment with ' and ] symbols"],
    ['doctype', ' svg []'],
    ['opentagstart', { name: 'SVG', attributes: {} }],
    ['opentag', { name: 'SVG', attributes: {}, isSelfClosing: false }],
    ['closetag', 'SVG'],
  ],
})

// with entity and comment
require(__dirname).test({
  xml: '<!DOCTYPE svg [<!--comment with \' and ] symbols--> <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/"> ]><svg></svg>',
  expect: [
    ['comment', "comment with ' and ] symbols"],
    [
      'doctype',
      ' svg [ <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/"> ]',
    ],
    ['opentagstart', { name: 'SVG', attributes: {} }],
    ['opentag', { name: 'SVG', attributes: {}, isSelfClosing: false }],
    ['closetag', 'SVG'],
  ],
})

// with empty doctype
require(__dirname).test({
  xml: '<!DOCTYPE svg []><svg></svg>',
  expect: [
    ['doctype', ' svg []'],
    ['opentagstart', { name: 'SVG', attributes: {} }],
    ['opentag', { name: 'SVG', attributes: {}, isSelfClosing: false }],
    ['closetag', 'SVG'],
  ],
})

// with processing instruction
require(__dirname).test({
  xml: '<!DOCTYPE svg [<!ENTITY e "v"><?pi x?>]><svg><!--c-->text</svg>',
  expect: [
    ['processinginstruction', { name: 'pi', body: 'x' }],
    ['doctype', ' svg [<!ENTITY e "v">]'],
    ['opentagstart', { name: 'SVG', attributes: {} }],
    ['opentag', { name: 'SVG', attributes: {}, isSelfClosing: false }],
    ['comment', 'c'],
    ['text', 'text'],
    ['closetag', 'SVG'],
  ],
})

// with processing instruction, strict
require(__dirname).test({
  xml: '<!DOCTYPE svg [<?pi x?><!ENTITY e "v">]><svg><!--c-->text</svg>',
  strict: true,
  expect: [
    ['processinginstruction', { name: 'pi', body: 'x' }],
    ['doctype', ' svg [<!ENTITY e "v">]'],
    ['opentagstart', { name: 'svg', attributes: {} }],
    ['opentag', { name: 'svg', attributes: {}, isSelfClosing: false }],
    ['comment', 'c'],
    ['text', 'text'],
    ['closetag', 'svg'],
  ],
})

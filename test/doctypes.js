// with entity
require(__dirname).test({
  xml: '<!DOCTYPE svg [ <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/"> ]><svg></svg>',
  expect: [
    [ 'doctype', ' svg [ <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/"> ]' ],
    [ 'opentagstart', { name: 'SVG', attributes: {} } ],
    [ 'opentag', { name: 'SVG', attributes: {}, isSelfClosing: false } ],
    [ 'closetag', 'SVG' ],
  ]
})

// with comment
require(__dirname).test({
  xml: '<!DOCTYPE svg [<!--comment with \' and ] symbols-->]><svg></svg>',
  expect: [
    [ 'comment', 'comment with \' and ] symbols' ],
    [ 'doctype', ' svg []' ],
    [ 'opentagstart', { name: 'SVG', attributes: {} } ],
    [ 'opentag', { name: 'SVG', attributes: {}, isSelfClosing: false } ],
    [ 'closetag', 'SVG' ],
  ]
})

// with entity and comment
require(__dirname).test({
  xml: '<!DOCTYPE svg [<!--comment with \' and ] symbols--> <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/"> ]><svg></svg>',
  expect: [
    [ 'comment', 'comment with \' and ] symbols' ],
    [ 'doctype', ' svg [ <!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/"> ]' ],
    [ 'opentagstart', { name: 'SVG', attributes: {} } ],
    [ 'opentag', { name: 'SVG', attributes: {}, isSelfClosing: false } ],
    [ 'closetag', 'SVG' ],
  ]
})

// with empty doctype
require(__dirname).test({
  xml: '<!DOCTYPE svg []><svg></svg>',
  expect: [
    [ 'doctype', ' svg []' ],
    [ 'opentagstart', { name: 'SVG', attributes: {} } ],
    [ 'opentag', { name: 'SVG', attributes: {}, isSelfClosing: false } ],
    [ 'closetag', 'SVG' ],
  ]
})

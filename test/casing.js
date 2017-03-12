// test lower looseCasing
require(__dirname).test({
  xml: '<span class="test" hello="world"></span>',
  expect: [
    [ 'opentagstart', {
      name: 'span',
      attributes: {}
    } ],
    [ 'attribute', { name: 'class', value: 'test' } ],
    [ 'attribute', { name: 'hello', value: 'world' } ],
    [ 'opentag', {
      name: 'span',
      attributes: { class: 'test', hello: 'world' },
      isSelfClosing: false
    } ],
    [ 'closetag', 'span' ]
  ],
  strict: false,
  opt: {looseCasing: 'lower'}
})

// test upper looseCasing
require(__dirname).test({
  xml: '<span class="test" hello="world"></span>',
  expect: [
    [ 'opentagstart', {
      name: 'SPAN',
      attributes: {}
    } ],
    [ 'attribute', { name: 'CLASS', value: 'test' } ],
    [ 'attribute', { name: 'HELLO', value: 'world' } ],
    [ 'opentag', {
      name: 'SPAN',
      attributes: { CLASS: 'test', HELLO: 'world' },
      isSelfClosing: false
    } ],
    [ 'closetag', 'SPAN' ]
  ],
  strict: false,
  opt: {looseCasing: 'upper'}
})

// test no looseCasing
require(__dirname).test({
  xml: '<span className="test" hello="world"></span>',
  expect: [
    [ 'opentagstart', {
      name: 'span',
      attributes: {}
    } ],
    [ 'attribute', { name: 'className', value: 'test' } ],
    [ 'attribute', { name: 'hello', value: 'world' } ],
    [ 'opentag', {
      name: 'span',
      attributes: { className: 'test', hello: 'world' },
      isSelfClosing: false
    } ],
    [ 'closetag', 'span' ]
  ],
  strict: false,
  opt: {looseCasing: null}
})

// make sure deprecated lowercase overrides the looseCasing null option
require(__dirname).test({
  xml: '<span className="test" hello="world"></span>',
  expect: [
    [ 'opentagstart', {
      name: 'span',
      attributes: {}
    } ],
    [ 'attribute', { name: 'classname', value: 'test' } ],
    [ 'attribute', { name: 'hello', value: 'world' } ],
    [ 'opentag', {
      name: 'span',
      attributes: { classname: 'test', hello: 'world' },
      isSelfClosing: false
    } ],
    [ 'closetag', 'span' ]
  ],
  strict: false,
  opt: {lowercase: true, looseCasing: null}
})

// make sure deprecated lowercase overrides the looseCasing upper option
require(__dirname).test({
  xml: '<span className="test" hello="world"></span>',
  expect: [
    [ 'opentagstart', {
      name: 'span',
      attributes: {}
    } ],
    [ 'attribute', { name: 'classname', value: 'test' } ],
    [ 'attribute', { name: 'hello', value: 'world' } ],
    [ 'opentag', {
      name: 'span',
      attributes: { classname: 'test', hello: 'world' },
      isSelfClosing: false
    } ],
    [ 'closetag', 'span' ]
  ],
  strict: false,
  opt: {lowercase: true, looseCasing: 'upper'}
})


// make sure deprecated lowercasetags overrides the looseCasing upper option
require(__dirname).test({
  xml: '<span className="test" hello="world"></span>',
  expect: [
    [ 'opentagstart', {
      name: 'span',
      attributes: {}
    } ],
    [ 'attribute', { name: 'classname', value: 'test' } ],
    [ 'attribute', { name: 'hello', value: 'world' } ],
    [ 'opentag', {
      name: 'span',
      attributes: { classname: 'test', hello: 'world' },
      isSelfClosing: false
    } ],
    [ 'closetag', 'span' ]
  ],
  strict: false,
  opt: {lowercasetags: true, looseCasing: 'upper'}
})
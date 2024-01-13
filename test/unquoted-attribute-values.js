// strict: true
require(__dirname).test({
  xml: '<svg width=20px height=20px />',
  expect: [
    ['opentagstart', { name: 'svg', attributes: {} }],
    ['error', 'Unquoted attribute value\nLine: 0\nColumn: 12\nChar: 2'],
    ['attribute', { name: 'width', value: '20px' }],
    ['error', 'Unquoted attribute value\nLine: 0\nColumn: 24\nChar: 2'],
    ['attribute', { name: 'height', value: '20px' }],
    ['opentag', { name: 'svg', attributes: {
      width: '20px',
      height: '20px'
    }, isSelfClosing: true }],
    ['closetag', 'svg'],
  ],
  strict: true
})

// strict: false
require(__dirname).test({
  xml: '<svg width=20px height=20px />',
  expect: [
    ['opentagstart', { name: 'SVG', attributes: {} }],
    ['attribute', { name: 'WIDTH', value: '20px' }],
    ['attribute', { name: 'HEIGHT', value: '20px' }],
    ['opentag', { name: 'SVG', attributes: {
      WIDTH: '20px',
      HEIGHT: '20px'
    }, isSelfClosing: true }],
    ['closetag', 'SVG'],
  ],
  strict: false
})

// strict: true, opt: { unquotedAttributeValues: true }
require(__dirname).test({
  xml: '<svg width=20px height=20px />',
  expect: [
    ['opentagstart', { name: 'svg', attributes: {} }],
    ['attribute', { name: 'width', value: '20px' }],
    ['attribute', { name: 'height', value: '20px' }],
    ['opentag', { name: 'svg', attributes: {
      width: '20px',
      height: '20px'
    }, isSelfClosing: true }],
    ['closetag', 'svg'],
  ],
  strict: true,
  opt: {
    unquotedAttributeValues: true
  }
})

// strict: false, opt: { unquotedAttributeValues: true }
require(__dirname).test({
  xml: '<svg width=20px height=20px />',
  expect: [
    ['opentagstart', { name: 'SVG', attributes: {} }],
    ['attribute', { name: 'WIDTH', value: '20px' }],
    ['attribute', { name: 'HEIGHT', value: '20px' }],
    ['opentag', { name: 'SVG', attributes: {
      WIDTH: '20px',
      HEIGHT: '20px'
    }, isSelfClosing: true }],
    ['closetag', 'SVG'],
  ],
  strict: false,
  opt: {
    unquotedAttributeValues: true
  }
})

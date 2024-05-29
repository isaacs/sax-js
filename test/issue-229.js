// https://github.com/isaacs/sax-js/issues/229
require(__dirname).test({
  xml: '<script>a = "</scr" + "ipt>";</script>',
  expect: [
    ['opentagstart', {name: 'script', attributes: {}}],
    ['opentag', {name: 'script', attributes: {}, isSelfClosing: false}],
    ['script', 'a = "</scr" + "ipt>";'],
    ['closetag', 'script']
  ],
  strict: false,
  opt: {lowercasetags: true, noscript: false}
})

// Undefined entity references whose names collide with Object.prototype
// members (e.g. &toString;, &constructor;, &__proto__;) must be treated as
// invalid entities, not silently resolved to inherited JS internals.
var protoEntities = ['toString', 'constructor', 'valueOf', 'hasOwnProperty', '__proto__']

for (var i = protoEntities.length - 1; i >= 0; --i) {
  require(__dirname).test({
    xml: '<r>&' + protoEntities[i] + ';</r>',
    strict: false,
    expect: [
      ['opentagstart', { name: 'R', attributes: {} }],
      ['opentag', { name: 'R', attributes: {}, isSelfClosing: false }],
      ['text', '&' + protoEntities[i] + ';'],
      ['closetag', 'R'],
    ],
  })
}

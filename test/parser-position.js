var sax = require("../lib/sax"),
    assert = require("assert")

function testPosition(chunks, expectedEvents) {
  var parser = sax.parser();
  expectedEvents.forEach(function(expectation) {
    parser['on' + expectation[0]] = function() {
      assert.equal(parser.position, expectation[1]);
    }
  });
  chunks.forEach(function(chunk) {
    parser.write(chunk);
  });
};

testPosition(['<div>abcdefgh</div>'],
             [ ['opentag', 5]
             , ['text', 19]
             , ['closetag', 19]
             ]);

testPosition(['<div>abcde','fgh</div>'],
             [ ['opentag', 5]
             , ['text', 19]
             , ['closetag', 19]
             ]);


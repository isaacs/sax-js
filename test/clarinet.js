if (!clarinet) { // node 
  var clarinet  = require('../clarinet.js')
    , assert    = require('assert')
    ;
}

var docs   =
  { foobar: 
    { text   : '{"foo": "bar"}'
    , events : [ ["openobject"  , "foo"]
               , ["value"       , "bar"]
               , ["closeobject" , undefined]
               , ['end'         , undefined]
               , ['ready'       , undefined]
               ]
    }
  };

describe('clarinet', function(){
  describe('#generic', function() {
    for (var key in docs) {
      if (docs.hasOwnProperty(key)) {
        // undefined means no split
        // /\t|\n|\r| / means on whitespace
        // '' means on every char
        _.each([undefined, /\t|\n|\r| /, ''], function(sep) {
          it('[' + key + '] should be able to parse -> ' + sep, function () {
            var doc        = docs[key].text
              , events     = docs[key].events
              , l          = new FastList()
              , doc_chunks = doc.split(sep)
              , parser     = clarinet.parser()
              , i          = 0
              , current
              ;
            _.each(events, function(event_pair) { l.push(event_pair); });
            _.each(clarinet.EVENTS, function(event) {
              parser["on"+event] = function (value) {
                current = l.shift();
                ++i;
                assert(current[0] === event, 
                  '[ln' + i + '] expected: ' + current[0] + ' got: ' + event);
                assert(current[1] === value, 
                  '[ln' + i + '] expected: ' + current[1] + ' got: ' + value);
              };
            });
            _.each(doc_chunks, function(chunk) { parser.write(chunk); });
            parser.end();
          });
        });
      }
    }
  });
});

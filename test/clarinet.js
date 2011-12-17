if (!clarinet) { // node 
  var clarinet  = require('../clarinet.js')
    , assert    = require('assert')
    ;
}

var seps   = [undefined, /\t|\n|\r| /, '']
  , sep
  , docs   =
    { foobar   :
      { text   : '{"foo": "bar"}'
      , events :
        [ ["openobject"  , "foo"]
        , ["value"       , "bar"]
        , ["closeobject" , undefined]
        , ['end'         , undefined]
        , ['ready'       , undefined]
        ]
      }
    , array    :
      { text   : '["one", "two"]'
      , events : 
        [ ['openarray'  , undefined]
        , ['value'      , 'one']
        , ['value'      , 'two']
        , ['closearray' , undefined]
        , ['end'        , undefined]
        , ['ready'      , undefined]
        ]
      }
    , nested   :
      { text   : '{"a":{"b":"c"}}'
      , events :
        [ ["openobject"  , "a"]
        , ["openobject"  , "b"]
        , ["value"       , "c"]
        , ["closeobject" , undefined]
        , ["closeobject" , undefined]
        , ['end'         , undefined]
        , ['ready'       , undefined]
        ]
      }
    , nested_array  :
      { text        : '{"a":["b", "c"]}'
      , events      :
          [ ["openobject"  , "a"]
          , ['openarray'   , undefined]
          , ['value'       , 'b']
          , ['value'       , 'c']
          , ['closearray'  , undefined]
          , ["closeobject" , undefined]
          , ['end'         , undefined]
          , ['ready'       , undefined]
          ]
      }
    , array_of_objs :
      { text        : '[{"a":"b"}, {"c":"d"}]'
      , events      :
        [ ['openarray'   , undefined]
        , ["openobject"  , "a"]
        , ['value'       , 'b']
        , ["closeobject" , undefined]
        , ["openobject"  , "c"]
        , ['value'       , 'd']
        , ["closeobject" , undefined]
        , ['closearray'  , undefined]
        , ['end'         , undefined]
        , ['ready'       , undefined]
        ]
      }
    };

function generic(key,sep) {
  return function () {
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
  };
}

describe('clarinet', function(){
  describe('#generic', function() {
    for (var key in docs) {
      if (docs.hasOwnProperty(key)) {
        // undefined means no split
        // /\t|\n|\r| / means on whitespace
        // '' means on every char
        for(var i in seps) {
          sep = seps[i];
          it('[' + key + '] should be able to parse -> ' + sep,
            generic(key,sep));
        }
      }
    }
  });
});

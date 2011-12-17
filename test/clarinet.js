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
    , two_keys  :
      { text    : '{"a": "b", "c": "d"}'
      , events  :
        [ ["openobject"  , "a"]
        , ["value"       , "b"]
        , ["key"         , "c"]
        , ["value"       , "d"]
        , ["closeobject" , undefined]
        , ['end'         , undefined]
        , ['ready'       , undefined]
        ]
      }
    , json_org  :
      { text    : 
          ('{\r\n' +
          '          "glossary": {\n' +
          '              "title": "example glossary",\n\r' +
          '      \t\t"GlossDiv": {\r\n' +
          '                  "title": "S",\r\n' +
          '      \t\t\t"GlossList": {\r\n' +
          '                      "GlossEntry": {\r\n' +
          '                          "ID": "SGML",\r\n' +
          '      \t\t\t\t\t"SortAs": "SGML",\r\n' +
          '      \t\t\t\t\t"GlossTerm": "Standard Generalized ' + 
          'Markup Language",\r\n' +
          '      \t\t\t\t\t"Acronym": "SGML",\r\n' +
          '      \t\t\t\t\t"Abbrev": "ISO 8879:1986",\r\n' +
          '      \t\t\t\t\t"GlossDef": {\r\n' +
          '                              "para": "A meta-markup language,' +
          ' used to create markup languages such as DocBook.",\r\n' +
          '      \t\t\t\t\t\t"GlossSeeAlso": ["GML", "XML"]\r\n' +
          '                          },\r\n' +
          '      \t\t\t\t\t"GlossSee": "markup"\r\n' +
          '                      }\r\n' +
          '                  }\r\n' +
          '              }\r\n' +
          '          }\r\n' +
          '      }\r\n')
      , events  :
        [ ["openobject"  , "glossary"]
        , ["openobject"  , "title"]
        , ['value'       , 'example glossary']
        , ["key"         , "GlossDiv"]
        , ["openobject"  , "title"]
        , ['value'       , 'S']
        , ["key"         , "GlossList"]
        , ["openobject"  , "GlossEntry"]
        , ["openobject"  , "ID"]
        , ['value'       , 'SGML']
        , ["key"         , "SortAs"]
        , ['value'       , 'SGML']
        , ["key"         , "GlossTerm"]
        , ['value'       , 'Standard Generalized Markup Language']
        , ["key"         , "Acronym"]
        , ['value'       , 'SGML']
        , ["key"         , "Abbrev"]
        , ['value'       , 'ISO 8879:1986']
        , ["key"         , "GlossDef"]
        , ["openobject"  , "para"]
        , ['value'       , 'A meta-markup language, used to create markup languages such as DocBook.']
        , ["key"         , "GlossSeeAlso"]
        , ['openarray'   , undefined]
        , ['value'       , 'GML']
        , ['value'       , 'XML']
        , ['closearray'  , undefined]
        , ["closeobject" , undefined]
        , ["key"         , "GlossSee"]
        , ["value"       , "markup"]
        , ["closeobject" , undefined]
        , ["closeobject" , undefined]
        , ["closeobject" , undefined]
        , ["closeobject" , undefined]
        , ["closeobject" , undefined]
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

var t = require(__dirname)

  , xmls = // should be the same both ways.
    [ "<parent a:attr='value' xmlns:a='http://ATTRIBUTE' />"
    , "<parent xmlns:a='http://ATTRIBUTE' a:attr='value' />" ]

  , expected =
    [ [ "opennamespace"
      , { prefix: "a"
        , uri: "http://ATTRIBUTE"
        }
      ]
    , [ "attribute"
      , { name: "xmlns:a"
        , value: "http://ATTRIBUTE"
        , prefix: "xmlns"
        , local: "a"
        , uri: ""
        }
      ]
    , [ "attribute"
      , { name: "a:attr"
        , local: "attr"
        , prefix: "a"
        , uri: "http://ATTRIBUTE"
        , value: "value"
        }
      ]
    , [ "opentag"
      , { name: "parent"
        , uri: ""
        , prefix: ""
        , local: "parent"
        , attributes:
          { "a:attr":
            { name: "a:attr"
            , local: "attr"
            , prefix: "a"
            , uri: "http://ATTRIBUTE"
            , value: "value"
            }
          , "xmlns:a":
            { name: "xmlns:a"
            , local: "a"
            , prefix: "xmlns"
            , uri: ""
            , value: "http://ATTRIBUTE"
            }
          }
        , bindings: ["a"]
        }
      ]
    , ["closetag", "parent"]
    , ["closenamespace", { prefix: "a", uri: "http://ATTRIBUTE" }]
    ]

xmls.forEach(function (x) {
  t.test({ xml: x
         , expect: expected
         , strict: true
         , opt: { xmlns: true }
         })
})

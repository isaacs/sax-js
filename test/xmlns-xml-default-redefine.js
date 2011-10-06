require(__dirname).test(
  { xml : "<xml:root xmlns:xml='ERROR'/>"
  , expect :
    [ ["error"
      , "Cannot bind the xml prefix to ERROR\n"
      + "Line: 0\nColumn: 27\nChar: '"
      ]
    , [ "attribute"
      , { name: "xmlns:xml"
        , local: "xml"
        , prefix: "xmlns"
        , uri: ""
        , value: "ERROR"
        }
      ]
    , [ "opentag"
      , { name: "xml:root"
        , uri: "http://www.w3.org/XML/1998/namespace"
        , prefix: "xml"
        , local: "root"
        , attributes:
          { "xmlns:xml":
            { name: "xmlns:xml"
            , local: "xml"
            , prefix: "xmlns"
            , uri: ""
            , value: "ERROR"
            }
          }
        , bindings: []
        }
      ]
    , ["closetag", "xml:root"]
    ]
  , strict : true
  , opt : { xmlns: true }
  }
)


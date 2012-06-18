require(__dirname).test
  ( { xml :
      "<span id=\"hello\" id=\"there\"></span>"
    , expect :
      [ [ "attribute", { name: "ID", value: "hello" } ]
      , [ "opentag", { name: "SPAN",
                       attributes: { ID: "hello" } } ]
      , [ "closetag", "SPAN" ]
      ]
    , strict : false
    , opt : {}
    }
  )

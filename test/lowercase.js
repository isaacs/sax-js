// lowercase option : lowercase tag/attribute names
require(__dirname).test
  ( { xml :
      "<span class=\"test\" hello=\"world\"></span>"
    , expect :
      [ [ "attribute", { name: "class", value: "test" } ]
      , [ "attribute", { name: "hello", value: "world" } ]
      , [ "opentag", { name: "span",
                       attributes: { class: "test", hello: "world" } } ]
      , [ "closetag", "span" ]
      ]
    , strict : false
    , opt : {lowercase:true}
    }
  )


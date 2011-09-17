
require(__dirname).test
  ( { xml :
      "<root>"+
        "<plain attr='normal'/>"+
        "<ns1 xmlns='uri:default'>"+
          "<plain attr='normal'/>"+
        "</ns1>"+
        "<ns2 xmlns:a='uri:nsa'>"+
          "<plain attr='normal'/>"+
          "<a:ns a:attr='namespaced'/>"+
        "</ns2>"+
      "</root>"

    , expect :
      [ [ "opentag", { name: "root", prefix: "", local: "root", uri: "",
            attributes: {}, bindings: [] } ]

      , [ "attribute", { name: "attr", value: "normal", prefix: "", local: "attr", uri: "" } ]
      , [ "opentag", { name: "plain", prefix: "", local: "plain", uri: "",
            attributes: { "attr": { name: "attr", value: "normal", uri: "", prefix: "", local: "attr", uri: "" } },
            bindings: [] } ]
      , [ "closetag", "plain" ]

      , [ "opennamespace", { prefix: "", uri: "uri:default" } ]

      , [ "attribute", { name: "xmlns", value: "uri:default", prefix: "", local: "xmlns", uri: "" } ]
      , [ "opentag", { name: "ns1", prefix: "", local: "ns1", uri: "uri:default",
            attributes: { "xmlns": { name: "xmlns", value: "uri:default", prefix: "", local: "xmlns", uri: "" } },
            bindings: [ "" ] } ]

      , [ "attribute", { name: "attr", value: "normal", prefix: "", local: "attr", uri: "" } ]
      , [ "opentag", { name: "plain", prefix: "", local: "plain", uri: "uri:default",
            attributes: { "attr": { name: "attr", value: "normal", prefix: "", local: "attr", uri: "" } },
            bindings: [] } ]
      , [ "closetag", "plain" ]

      , [ "closetag", "ns1" ]

      , [ "closenamespace", { prefix: "", uri: "uri:default" } ]

      , [ "opennamespace", { prefix: "a", uri: "uri:nsa" } ]

      // FIXME should probably have uri= xmlns namespace (http://www.w3.org/2000/xmlns/)
      , [ "attribute", { name: "xmlns:a", value: "uri:nsa", prefix: "xmlns", local: "a", uri: "" } ]

      // FIXME should probably have uri= xmlns namespace (http://www.w3.org/2000/xmlns/)
      , [ "opentag", { name: "ns2", prefix: "", local: "ns2", uri: "",
            attributes: { "xmlns:a": { name: "xmlns:a", value: "uri:nsa", prefix: "xmlns", local: "a", uri: "" } },
            bindings: [ "a" ] } ]

      , [ "attribute", { name: "attr", value: "normal", prefix: "", local: "attr", uri: "" } ]
      , [ "opentag", { name: "plain", prefix: "", local: "plain", uri: "",
            attributes: { "attr": { name: "attr", value: "normal", prefix: "", local: "attr", uri: "" } },
            bindings: [] } ]
      , [ "closetag", "plain" ]

      , [ "attribute", { name: "a:attr", value: "namespaced", prefix: "a", local: "attr", uri: "uri:nsa" } ]
      , [ "opentag", { name: "a:ns", prefix: "a", local: "ns", uri: "uri:nsa",
            attributes: { "a:attr": { name: "a:attr", value: "namespaced", prefix: "a", local: "attr", uri: "uri:nsa" } },
            bindings: [] } ]
      , [ "closetag", "a:ns" ]

      , [ "closetag", "ns2" ]

      , [ "closenamespace", { prefix: "a", uri: "uri:nsa" } ]

      , [ "closetag", "root" ]
      ]
    , strict : true
    , opt : { xmlns: true }
    }
  )


// testing links with one parameter
require(__dirname).test({ 
  xml : "<a href='http:www.google.com?arg1=test'>Lien</a>"
  , expect :
  [ [ "attribute", { name: "href", value: "http:www.google.com?arg1=test" } ]
  ,[ "opentag", { name: "A", attributes: {
    href : 'http:www.google.com?arg1=test'
  }
  } ]
, [ "text", "Lien" ]
  , [ "closetag", "A" ]
  ]
  , strict : false
  , opt : {}
});

// testing links with two parameters
require(__dirname).test({ 
  xml : "<a href='http:www.google.com?arg1=test&arg2=value'>Mon Lien</a>"
  , expect :
  [ [ "attribute", { name: "href", value: "http:www.google.com?arg1=test&arg2=value" } ]
  ,[ "opentag", { name: "A", attributes: {
    href : 'http:www.google.com?arg1=test&arg2=value'
  }
  } ]
, [ "text", "Mon Lien" ]
  , [ "closetag", "A" ]
  ]
  , strict : false
  , opt : {}
});


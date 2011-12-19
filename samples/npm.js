// all npm authors sorted by number of repos
var fs             = require('fs')
  , clarinet       = require('../clarinet')
  , parse_stream   = clarinet.createStream()
  , author         = false
  , authors        = {}
  ;


parse_stream.on('openobject', function(name) {
  if(name==='author') author=true;
});

parse_stream.on('key', function(name) {
  if(name==='author') author=true;
});

parse_stream.on('end', function () {
  var sorted = []
    , i
    ;
  for (var a in authors)
    sorted.push([a, authors[a]]);
  sorted.sort(function(a, b) { return a[1] - b[1]; });
  i = sorted.length-1;
  while(i!==-1) {
    console.log(sorted.length-i, sorted[i]);
    i--;
  }
});

parse_stream.on('value', function(value) {
  if(author) { 
    var current_count = authors[value];
    if (current_count) authors[value] +=1;
    else authors[value] = 1;
    author=false; 
  }
});

fs.createReadStream(__dirname + '/npm.json').pipe(parse_stream);
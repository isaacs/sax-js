// get a bunch of twitter streams
var stuff_to_search_for = 
  [ 'nodejs', 'nodejitsu', 'hadoop', 'couchdb', 'nosql', 'birds', 'dinosaurs'
  , 'fun', 'dscape', 'clown', 'joyent', 'nyc', 'usa', 'portugal'];

// npm install request fast-list clarinet
var request        = require('request');
var fs             = require('fs');
var clarinet       = require('../clarinet');
var p              = 1;
var buffer         = [];
var tweets         = ['['];
var parse_stream   = clarinet.createStream();
var stacklevel     = 0;
var objlevel       = 0;
var found_results  = false;
var notfirst       = false;
var stop_searching = false;
var previous       = '';
var i            = 0;
var on_array     = false;
var array_vals   = [];

function uri (pop) {
  var term;
  if(pop) i++;
  if(stuff_to_search_for[i]) {
    term = stuff_to_search_for[i];
    return 'http://search.twitter.com/search.json?q=' + term +
           '&rpp=100&page=';
  }
  else
    return null;
}

parse_stream.on('openarray', function() {
  previous = '[';
  if(found_results) {
    if(stacklevel !== 0) { buffer.push('['); on_array = true; }
    stacklevel++;
  }
});

parse_stream.on('closearray', function() {
  if(found_results) {
    stacklevel--;
    if(stacklevel === 0) {
      tweets.push(buffer.join(''));
      buffer = [];
      found_results = false;
      if(previous === '[')  // [] means no more results
        stop_searching = true;
    } else {
      buffer.push(array_vals.join(','));
      array_vals = [];
      on_array = false;
      buffer.push(']'); 
    }
  }
  previous = ']';
});

parse_stream.on('openobject', function(name) {
  previous = '{';
  if(found_results) {
    if(objlevel === 0 && notfirst) { buffer.push(','); }
    if(name!=='result_type') { buffer.push('\n'); }
    buffer.push('{"' + name + '": ');
    notfirst = true;
    objlevel++;
  }
});

parse_stream.on('key', function(name) {
  previous = ':';
  if(found_results) {
    buffer.push(', "' + name + '": ');
  }
  if(name==='results' && !found_results) { 
    found_results = true; 
  }
});

parse_stream.on('closeobject', function() {
  previous = '}';
  if(found_results) {
    objlevel--;
    buffer.push('}');
  }
});

parse_stream.on('end', function() {
  previous = '!';
  if(tweets.length === 0) stop_searching = true;
  console.log(tweets.join(''));
});

parse_stream.on('ready', function () {
  var r_uri;
  if(stop_searching) {
    r_uri = uri(true);
    if(r_uri === null) {
      console.log(']');
      return;
    } else { 
      p = 1; 
      stop_searching = false;
    }
  }
  r_uri = r_uri || uri();
  tweets = [];
  
  if(r_uri!==null) {
    request.get(r_uri+p)
      .pipe(parse_stream);
    p++;
  }
});

parse_stream.on('value', function(value) {
  if(found_results) {
    var bla;
    if(typeof value === 'string' || value === null)
      bla = JSON.stringify(value);
    else bla = value;
    if (on_array) array_vals.push(bla); 
    else { buffer.push(bla); }
  }
});

var s_uri = uri();
if(s_uri!==null)
  request.get(uri()+p)
    .pipe(parse_stream);
p++;
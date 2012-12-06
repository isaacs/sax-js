var fs              = require('fs')
  , Stream          = require('stream').Stream
  , clarinet        = require('../clarinet')
  , parse_stream    = clarinet.createStream()
  , previous        = ''
  , buffer          = {}
  , stack           = []
  , new_thing       = false
  ;

function debug_log() {
  if(process.env.DEBUG) {
    console.log.apply(null, arguments);
  }
}

parse_stream.on('openobject', function(name) {
  if(new_thing) {
    console.log(JSON.stringify(buffer, null, 2));
    buffer = {};
    new_thing = false;
  }
  previous = name;
  stack.push(name);
  debug_log('=== {', name, buffer);
});

parse_stream.on('closeobject', function() {
  stack.pop();
  debug_log('=== }', null, buffer);
});

parse_stream.on('key', function(name) {
  previous = name;
  stack.pop();
  stack.push(name);
  debug_log('=== ,', name, buffer);
});

parse_stream.on('value', function(value) {
  if(previous === 'event') {
    value = JSON.parse(value);
  }
  var expected = stack.length-1;
  stack.reduce(function (ac, x, i) {
    if(i === expected) {
      ac[x] = value;
    }
    ac[x] = ac[x] || {};
    return ac[x];
  }, buffer);
  debug_log('=== v', value, buffer);
});

parse_stream.on('error', function (e) {
  new_thing = true;
});

function fixLogglyStream() {
  var log_stream  = new Stream();
  log_stream.readable = true;
  log_stream.writable = true;

  log_stream.write = function (buf) {
    var as_string = buf.toString('utf-8').replace(/\\\\/g, '\\');
    this.emit('data', as_string);
  };

  log_stream.end = function (buf) {
    if (arguments.length) {
      log_stream.write(buf);
    }
    log_stream.writable = false;
  };

  log_stream.destroy = function () {
    log_stream.writable = false;
  };

  return log_stream;
}

fs.createReadStream(__dirname + '/loggly.txt')
  .pipe(fixLogglyStream())
  .pipe(parse_stream)
  ;
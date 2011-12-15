// wrapper for non-node envs
;(function (saj) {

saj.parser = function (opt) { return new SAJParser(opt);};
saj.SAJParser = SAJParser;
saj.SAJStream = SAJStream;
saj.createStream = createStream;

saj.MAX_BUFFER_LENGTH = 64 * 1024;

var buffers = [ "text" ];

saj.EVENTS = // for discoverability.
  [ "value"
  , "openobject"
  , "closeobject"
  , "openarray"
  , "closearray"
  , "error"
  , "end"
  , "ready"
  ];

function SAJParser (opt) {
  if (!(this instanceof SAJParser)) return new SAJParser (opt);

  var parser = this;
  clearBuffers(parser);
  parser.q = parser.c = "";
  parser.objKey = "";
  parser.bufferCheckPosition = saj.MAX_BUFFER_LENGTH;
  parser.opt = opt || {};
  parser.tags = [];
  parser.closed = parser.closedRoot = parser.sawRoot = false;
  parser.tag = parser.error = null;
  parser.state = S.BEGIN;
  // mostly just for error reporting
  parser.position = parser.line = parser.column = 0;
  emit(parser, "onready");
}

if (!Object.create) Object.create = function (o) {
  function f () { this["__proto__"] = o; }
  f.prototype = o;
  return new f;
};

if (!Object.getPrototypeOf) Object.getPrototypeOf = function (o) {
  return o["__proto__"];
};

if (!Object.keys) Object.keys = function (o) {
  var a = [];
  for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
  return a;
};

function checkBufferLength (parser) {
  var maxAllowed = Math.max(saj.MAX_BUFFER_LENGTH, 10)
    , maxActual = 0
    ;
  for (var i = 0, l = buffers.length; i < l; i ++) {
    var len = parser[buffers[i]].length;
    if (len > maxAllowed) {
      // Text/cdata nodes can get big, and since they're buffered,
      // we can get here under normal conditions.
      // Avoid issues by emitting the text node now,
      // so at least it won't get any bigger.
      switch (buffers[i]) {
        case "text":
          closeText(parser);
        break;

        default:
          error(parser, "Max buffer length exceeded: "+buffers[i]);
      }
    }
    maxActual = Math.max(maxActual, len);
  }
  // schedule the next check for the earliest possible buffer overrun.
  parser.bufferCheckPosition = (saj.MAX_BUFFER_LENGTH - maxActual)
                             + parser.position;
}

function clearBuffers (parser) {
  for (var i = 0, l = buffers.length; i < l; i ++) {
    parser[buffers[i]] = "";
  }
}

SAJParser.prototype =
  { end: function () { end(this); }
  , write: write
  , resume: function () { this.error = null; return this; }
  , close: function () { return this.write(null); }
  };

try {
  var Stream = require("stream").Stream;
} catch (ex) {
  var Stream = function () {};
}


var streamWraps = saj.EVENTS.filter(function (ev) {
  return ev !== "error" && ev !== "end";
});

function createStream (opt) {
  return new SAJStream(opt);
}

function SAJStream (opt) {
  if (!(this instanceof SAJStream)) return new SAJStream(opt);

  Stream.apply(me);

  this._parser = new SAJParser(opt);
  this.writable = true;
  this.readable = true;

  var me = this;

  this._parser.onend = function () {
    me.emit("end");
  };

  this._parser.onerror = function (er) {
    me.emit("error", er);

    // if didn't throw, then means error was handled.
    // go ahead and clear error, so we can write again.
    me._parser.error = null;
  };

  streamWraps.forEach(function (ev) {
    Object.defineProperty(me, "on" + ev, {
      get: function () { return me._parser["on" + ev]; },
      set: function (h) {
        if (!h) {
          me.removeAllListeners(ev);
          me._parser["on"+ev] = h;
          return h;
        }
        me.on(ev, h);
      },
      enumerable: true,
      configurable: false
    });
  });
}

SAJStream.prototype = Object.create(Stream.prototype,
  { constructor: { value: SAJStream } });

SAJStream.prototype.write = function (data) {
  this._parser.write(data.toString());
  this.emit("data", data);
  return true;
};

SAJStream.prototype.end = function (chunk) {
  if (chunk && chunk.length) this._parser.write(chunk.toString());
  this._parser.end();
  return true;
};

SAJStream.prototype.on = function (ev, handler) {
  var me = this;
  if (!me._parser["on"+ev] && streamWraps.indexOf(ev) !== -1) {
    me._parser["on"+ev] = function () {
      var args = arguments.length === 1 ? [arguments[0]]
               : Array.apply(null, arguments);
      args.splice(0, 0, ev);
      me.emit.apply(me, args);
    };
  }

  return Stream.prototype.on.call(me, ev, handler);
};

// character classes and tokens
var whitespace = "\r\n\t "
  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  , number = "0124356789"
  , letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  ;

function is (charclass, c) { return charclass.indexOf(c) !== -1; }
function not (charclass, c) { return !is(charclass, c); }

var S = 0;
saj.STATE =
{ BEGIN                     : S++
, VALUE                     : S++ // general stuff
, OPEN_OBJECT               : S++ // {
, CLOSE_OBJECT              : S++ // }
, OPEN_ARRAY                : S++ // [
, CLOSE_ARRAY               : S++ // ]
, TEXT_ESCAPE               : S++ // \ stuff
};

for (var s_ in saj.STATE) saj.STATE[saj.STATE[s_]] = s_;

// shorthand
S = saj.STATE;

function emit (parser, event, data) {
  parser[event] && parser[event](data);
}

function emitNode (parser, nodeType, data) {
  if (parser.valueNode) closeValue(parser);
  emit(parser, nodeType, data);
}

function closeValue (parser) {
  parser.ValueNode = textopts(parser.opt, parser.valueNode);
  if (parser.valueNode) emit(parser, "ontext", parser.valueNode);
  parser.valueNode = "";
}

function textopts (opt, text) {
  if (opt.trim) text = text.trim();
  if (opt.normalize) text = text.replace(/\s+/g, " ");
  return text;
}

function error (parser, er) {
  closeValue(parser);
  er += "\nLine: "+parser.line+
        "\nColumn: "+parser.column+
        "\nChar: "+parser.c;
  er = new Error(er);
  parser.error = er;
  emit(parser, "onerror", er);
  return parser;
}

function end (parser) {
  if (parser.state !== S.VALUE) error(parser, "Unexpected end");
  closeValue(parser);
  parser.c = "";
  parser.closed = true;
  emit(parser, "onend");
  SAJParser.call(parser, parser.opt);
  return parser;
}

function write (chunk) {
  var parser = this;
  if (this.error) throw this.error;
  if (parser.closed) return error(parser,
    "Cannot write after close. Assign an onready handler.");
  if (chunk === null) return end(parser);
  var i = 0, c = "", p = "";
  while (parser.c = c = chunk.charAt(i++)) {
    console.log(i,c)
    parser.position ++;
    if (c === "\n") {
      parser.line ++;
      parser.column = 0;
    } else parser.column ++;
    switch (parser.state) {

      case S.BEGIN:
        if (c === "{") parser.state = S.OPEN_OBJECT;
        else if (c === "[") parser.state = S.OPEN_ARRAY;
        else if (not(whitespace,c))
          error(parser, "Non-whitespace before first tag.");
      continue;

      case S.OPEN_OBJECT:
        if (is(whitespace, c)) {
          // wait for it...
        } else if(c === '"') {
          var starti = i-1;
          while(c) {
            p = c;
            c = chunk.charAt(i++);
            console.log(i,c)
            if (p !== '\\' && c === '"') {
              // end of key
              break;
            } 
            if (c) {
              parser.position ++;
              if (c === "\n") {
                parser.line ++;
                parser.column = 0;
              } else parser.column ++;
            }
          }
          if(c === '"') {
            while(c && c !== ':') c = chunk.charAt(i++);
            if(c === ':') {
              parser.objKey += chunk.substring(starti+1, i-2);
              parser.tag = parser.objKey;
              emit(parser, 'onopenobject', parser.tag);
              parser.state = S.VALUE;
            } else
              error(parser, "Key was not followed by colon");
          } else 
            error(parser, "Non closed object key");
        } else
          error(parser, "Malformed object key should start with \"");
      continue;

      case S.VALUE:
      continue;

      default:
        throw new Error(parser, "Unknown state: " + parser.state);
    }
  }
  if (parser.position >= parser.bufferCheckPosition)
    checkBufferLength(parser);
  return parser;
}

})(typeof exports === "undefined" ? saj = {} : exports);

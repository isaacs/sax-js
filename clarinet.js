;(function (clarinet) {
  clarinet.parser            = function (opt) { return new CParser(opt);};
  clarinet.CParser           = CParser;
  clarinet.CStream           = CStream;
  clarinet.createStream      = createStream;
  clarinet.MAX_BUFFER_LENGTH = 64 * 1024;
  clarinet.DEBUG             = (process.env.CLARINET==='debug');
  clarinet.INFO              = (process.env.CLARINET==='debug' ||
                                process.env.CLARINET==='info');
  clarinet.EVENTS            =
    [ "value"
    , "string"
    , "openobject"
    , "closeobject"
    , "openarray"
    , "closearray"
    , "error"
    , "end"
    , "ready"
    ];

  var buffers     = [ "string" ]
    , whitespace  = "\r\n\t "
    , streamWraps = clarinet.EVENTS.filter(function (ev) {
          return ev !== "error" && ev !== "end";
        })
    , S           = 0
    , Stream
    ;

  clarinet.STATE =
    { BEGIN                     : S++
    , VALUE                     : S++ // general stuff
    , OPEN_OBJECT               : S++ // {
    , CLOSE_OPEN_OBJECT         : S++ // :
    , CLOSE_OBJECT              : S++ // }
    , OPEN_ARRAY                : S++ // [
    , CLOSE_ARRAY               : S++ // ]
    , TEXT_ESCAPE               : S++ // \ stuff
    , STRING                    : S++
    };

  for (var s_ in clarinet.STATE) clarinet.STATE[clarinet.STATE[s_]] = s_;

  // switcharoo
  S = clarinet.STATE;

  if (!Object.create) {
    Object.create = function (o) {
      function f () { this["__proto__"] = o; }
      f.prototype = o;
      return new f;
    };
  }

  if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function (o) {
      return o["__proto__"];
    };
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = [];
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
      return a;
    };
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(clarinet.MAX_BUFFER_LENGTH, 10)
      , maxActual = 0
      ;
    for (var i = 0, l = buffers.length; i < l; i ++) {
      var len = parser[buffers[i]].length;
      if (len > maxAllowed) {
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
    parser.bufferCheckPosition = (clarinet.MAX_BUFFER_LENGTH - maxActual)
                               + parser.position;
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i ++) {
      parser[buffers[i]] = "";
    }
  }

  function is (charclass, c)  { return charclass.indexOf(c) !== -1; }
  function not (charclass, c) { return !is(charclass, c); }

  function CParser (opt) {
    if (!(this instanceof CParser)) return new CParser (opt);

    var parser = this;
    clearBuffers(parser);
    parser.q = parser.c = "";
    parser.bufferCheckPosition = clarinet.MAX_BUFFER_LENGTH;
    parser.opt = opt || {};
    parser.tags = [];
    parser.closed = parser.closedRoot = parser.sawRoot = false;
    parser.tag = parser.error = null;
    parser.state = S.BEGIN;
    // mostly just for error reporting
    parser.position = parser.column = 0;
    parser.line = 1;
    emit(parser, "onready");
  }

  CParser.prototype =
    { end    : function () { end(this); }
    , write  : write
    , resume : function () { this.error = null; return this; }
    , close  : function () { return this.write(null); }
    };

  try        { Stream = require("stream").Stream; }
  catch (ex) { Stream = function () {}; }

  function createStream (opt) { return new CStream(opt); }

  function CStream (opt) {
    if (!(this instanceof CStream)) return new CStream(opt);

    Stream.apply(me);

    this._parser = new CParser(opt);
    this.writable = true;
    this.readable = true;

    var me = this;

    this._parser.onend = function () { me.emit("end"); };
    this._parser.onerror = function (er) {
      me.emit("error", er);
      me._parser.error = null;
    };

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, "on" + ev,
        { get          : function () { return me._parser["on" + ev]; }
        , set          : function (h) {
            if (!h) {
              me.removeAllListeners(ev);
              me._parser["on"+ev] = h;
              return h;
            }
            me.on(ev, h);
          }
        , enumerable   : true
        , configurable : false
        });
    });
  }

  CStream.prototype = Object.create(Stream.prototype,
    { constructor: { value: CStream } });

  CStream.prototype.write = function (data) {
    this._parser.write(data.toString());
    this.emit("data", data);
    return true;
  };

  CStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) this._parser.write(chunk.toString());
    this._parser.end();
    return true;
  };

  CStream.prototype.on = function (ev, handler) {
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

  function emit (parser, event, data) {
    if(clarinet.INFO) console.log('-- emit', event, data);
    if (parser[event]) parser[event](data);
  }

  function emitNode (parser, nodeType, data) {
    if (parser.valueNode) closeValue(parser);
    emit(parser, nodeType, data);
  }

  function closeValue(parser, event) {
    parser.textNode = textopts(parser.opt, parser.textNode);
    if (parser.textNode) emit(parser, (event ? event : "onvalue"), parser.textNode);
    parser.textNode = "";
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

  function end(parser) {
    //if (parser.state !== S.VALUE) error(parser, "Unexpected end");
    closeValue(parser);
    parser.c = "";
    parser.closed = true;
    emit(parser, "onend");
    CParser.call(parser, parser.opt);
    return parser;
  }

  function write (chunk) {
    var parser = this;
    if (this.error) throw this.error;
    if (parser.closed) return error(parser,
      "Cannot write after close. Assign an onready handler.");
    if (chunk === null) return end(parser);
    var i = 0, c = chunk[0], p = "";
    while (c) {
      parser.c = c = chunk.charAt(i++);
      if (clarinet.DEBUG) console.log(i,c,clarinet.STATE[parser.state]);
      parser.position ++;
      if (c === "\n") {
        parser.line ++;
        parser.column = 0;
      } else parser.column ++;
      switch (parser.state) {

        case S.BEGIN:
          if (c === "{") parser.state = S.OPEN_OBJECT;
          else if (c === "[") {
            emit(parser, 'onopenarray');
            parser.state = S.VALUE;
          }
          else if (not(whitespace,c)) error(parser, "Non-whitespace before {[.");
        continue;

        case S.CLOSE_OBJECT:
          emit(parser, 'oncloseobject');
        continue;

        case S.OPEN_OBJECT:
          if (is(whitespace, c)) continue;
          if(c === '"') {
            parser.state = S.STRING;
          } else
            error(parser, "Malformed object key should start with \"");
        continue;

        case S.CLOSE_OPEN_OBJECT:
          if (is(whitespace, c)) continue;
          closeValue (parser, 'onopenobject');
          if(c === '"') {
            parser.state = S.STRING;
          } else if (c === '{') {
            parser.state = S.OPEN_OBJECT;
          } else if (c === '[') {
              parser.state = S.OPEN_OBJECT;
          } else {
            parser.state  = S.VALUE;
          }
        continue;

        case S.VALUE:
          if (is(whitespace, c)) continue;
          if(c === '"') { // string
            parser.state = S.STRING;
          } else {
            error(parser, "Bad value");
          }
        continue;

        case S.CLOSE_ARRAY:
        continue;

        case S.STRING:
          var starti = i-1;
          while(c) {
            if (c === "\n") {
              parser.line ++;
              parser.column = 0;
            } else parser.column ++;
            if (clarinet.DEBUG) console.log(i,c,clarinet.STATE[parser.state]);
            p = c;
            parser.c = c = chunk.charAt(i++);
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
          if (clarinet.DEBUG) console.log(i,c,clarinet.STATE[parser.state]);
          if(c === '"') {
            parser.textNode = chunk.substring(starti, i-1);
            parser.c = c = chunk.charAt(i++); // ignore this guy
            while(c && !(c === ":" || c === ',' || c === ']' || c === '}')) {
              if (clarinet.DEBUG) console.log(i,c,clarinet.STATE[parser.state]);
              if (c === "\n") {
                parser.line ++;
                parser.column = 0;
              } else parser.column ++;
              c = chunk.charAt(i++);
            }
            if (clarinet.DEBUG) console.log(i,c,clarinet.STATE[parser.state]);
            if (c === ':') parser.state = S.CLOSE_OPEN_OBJECT;
            else {
              closeValue(parser);
                   if (c === ',') parser.state = S.VALUE;
              else if (c === ']') {
                emit(parser,"onclosearray");
                parser.state = S.CLOSE_ARRAY;
              }
              else if (c === '}') {
                emit(parser,"oncloseobject");
                parser.state = S.CLOSE_OBJECT;
              }
              else                error(parser, "String not followed by :,]}");
              if (clarinet.DEBUG) console.log(i,c,clarinet.STATE[parser.state]);
            }
          } else 
            error(parser, "Non closed string");
        continue;

        default:
          throw new Error(parser, "Unknown state: " + parser.state);
      }
    }
    if (parser.position >= parser.bufferCheckPosition)
      checkBufferLength(parser);
    return parser;
  }

})(typeof exports === "undefined" ? clarinet = {} : exports);

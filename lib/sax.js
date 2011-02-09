
var sax = exports;
sax.parser = function (strict, opt) { return new SAXParser(strict, opt) };
sax.SAXParser = SAXParser;

// When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
// When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
// since that's the earliest that a buffer overrun could occur.  This way, checks are
// as rare as required, but as often as necessary to ensure never crossing this bound.
// Furthermore, buffers are only tested at most once per write(), so passing a very
// large string into write() might have undesirable effects, but this is manageable by
// the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
// edge case, result in creating at most one complete copy of the string passed in.
// Set to Infinity to have unlimited buffers.
sax.MAX_BUFFER_LENGTH = 64 * 1024;

var buffers = [
  "comment", "sgmlDecl", "textNode", "tagName", "doctype",
  "procInstName", "procInstBody", "entity", "attribName",
  "attribValue", "cdata"
];

function SAXParser (strict, opt) {
  clearBuffers(this);
  this.q = this.c = "";
  this.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
  this.opt = opt || {};
  this.tagCase = this.opt.lowercasetags ? "toLowerCase" : "toUpperCase";
  this.tags = [];
  this.closed = this.closedRoot = this.sawRoot = false;
  this.tag = this.error = null;
  this.strict = !!strict;
  this.state = S.BEGIN;
  this.ENTITIES = Object.create(sax.ENTITIES);

  // mostly just for error reporting
  this.position = this.line = this.column = 0;
  emit(this, "onready");
}
function checkBufferLength (parser) {
  var maxAllowed = sax.MAX_BUFFER_LENGTH,
    maxActual = 0;
  for (var i = 0, l = buffers.length; i < l; i ++) {
    var len = parser[buffers[i]].length;
    if (len > maxAllowed) {
      if (buffers[i] === "textNode") {
        // Text nodes can get big, and since they're buffered, we can get here
        // under normal conditions.  Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        closeText(parser);
      } else {
        error(parser, "Max buffer length exceeded: "+buffers[i]);
      }
    }
    maxActual = Math.max(maxActual, len);
  }
  // schedule the next check for the earliest possible buffer overrun.
  parser.bufferCheckPosition = (sax.MAX_BUFFER_LENGTH - maxActual) + parser.position;
}
function clearBuffers (parser) {
  for (var i = 0, l = buffers.length; i < l; i ++) {
    parser[buffers[i]] = "";
  }
}
SAXParser.prototype = {
  write : write,
  resume : function () { this.error = null; return this },
  close : function () { return this.write(null) },
}

// character classes and tokens
var whitespace = "\r\n\t ",
  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  number = "0124356789",
  letter = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  // (Letter | '_' | ':')
  nameStart = letter+"_:",
  nameBody = nameStart+number+"-.",
  quote = "'\"",
  entity = number+letter+"#",
  CDATA = "[CDATA[",
  DOCTYPE = "DOCTYPE";
function is (charclass, c) { return charclass.indexOf(c) !== -1 }
function not (charclass, c) { return !is(charclass, c) }

var S = 0;
sax.STATE =
{ BEGIN                     : S++
, TEXT                      : S++ // general stuff
, TEXT_ENTITY               : S++ // &amp and such.
, OPEN_WAKA                 : S++ // <
, SGML_DECL                 : S++ // <!BLARG
, SGML_DECL_QUOTED          : S++ // <!BLARG foo "bar
, DOCTYPE                   : S++ // <!DOCTYPE
, DOCTYPE_QUOTED            : S++ // <!DOCTYPE "//blah
, DOCTYPE_DTD               : S++ // <!DOCTYPE "//blah" [ ...
, DOCTYPE_DTD_QUOTED        : S++ // <!DOCTYPE "//blah" [ "foo
, COMMENT_STARTING          : S++ // <!-
, COMMENT                   : S++ // <!--
, COMMENT_ENDING            : S++ // <!-- blah -
, COMMENT_ENDED             : S++ // <!-- blah --
, CDATA                     : S++ // <![CDATA[ something
, CDATA_ENDING              : S++ // ]
, CDATA_ENDING_2            : S++ // ]]
, PROC_INST                 : S++ // <?hi
, PROC_INST_BODY            : S++ // <?hi there
, PROC_INST_QUOTED          : S++ // <?hi there
, PROC_INST_ENDING          : S++ // <?hi there ?
, OPEN_TAG                  : S++ // <strong
, OPEN_TAG_SLASH            : S++ // <strong /
, ATTRIB                    : S++ // <a
, ATTRIB_NAME               : S++ // <a foo
, ATTRIB_NAME_SAW_WHITE     : S++ // <a foo _
, ATTRIB_VALUE              : S++ // <a foo="bar
, ATTRIB_VALUE_QUOTED       : S++ // <a foo="bar
, ATTRIB_VALUE_UNQUOTED     : S++ // <a foo="bar
, ATTRIB_VALUE_ENTITY_Q     : S++ // <foo bar="&quot;"
, ATTRIB_VALUE_ENTITY_U     : S++ // <foo bar=&quot;
, CLOSE_TAG                 : S++ // </a
, CLOSE_TAG_SAW_WHITE       : S++ // </a   >
}

sax.ENTITIES =
{ "apos" : "'"
, "quot" : '"'
, "amp"  : "&"
, "gt"   : ">"
, "lt"   : "<"
}

for (var S in sax.STATE) sax.STATE[sax.STATE[S]] = S;

// shorthand
S = sax.STATE;
sax.EVENTS = [ // for discoverability.
  "text", "processinginstruction", "sgmldeclaration",
  "doctype", "comment", "attribute", "opentag", "closetag",
  "opencdata", "cdata", "closecdata", "error", "end", "ready" ];

function emit (parser, event, data) {
  parser[event] && parser[event](data);
}
function emitNode (parser, nodeType, data) {
  if (parser.textNode) closeText(parser);
  emit(parser, nodeType, data);
}
function closeText (parser) {
  parser.textNode = textopts(parser.opt, parser.textNode);
  if (parser.textNode) emit(parser, "ontext", parser.textNode);
  parser.textNode = "";
}
function textopts (opt, text) {
  if (opt.trim) text = text.trim();
  if (opt.normalize) text = text.replace(/\s+/g, " ");
  return text;
}
function error (parser, er) {
  closeText(parser);
  er += "\nLine: "+parser.line+
        "\nColumn: "+parser.column+
        "\nChar: "+parser.c;
  er = new Error(er);
  parser.error = er;
  emit(parser, "onerror", er);
  return parser;
}
function end (parser) {
  if (parser.state !== S.TEXT) error(parser, "Unexpected end");
  closeText(parser);
  parser.c = "";
  parser.closed = true;
  emit(parser, "onend");
  SAXParser.call(parser, parser.strict, parser.opt);
  return parser;
}
function strictFail (parser, message) {
  if (parser.strict) error(parser, message);
}
function newTag (parser) {
  if (!parser.strict) parser.tagName = parser.tagName[parser.tagCase]();
  parser.tag = { name : parser.tagName, attributes : {} };
}
function openTag (parser, selfClosing) {
  parser.sawRoot = true;
  parser.tags.push(parser.tag);
  emitNode(parser, "onopentag", parser.tag);
  if (!selfClosing) {
    parser.tag = null;
    parser.tagName = "";
    parser.state = S.TEXT;
  }
  parser.attribName = parser.attribValue = "";
}
function closeTag (parser) {
  if (!parser.tagName) {
    strictFail(parser, "Weird empty close tag.");
    parser.textNode += "</>";
    parser.state = S.TEXT;
    return;
  }
  // first make sure that the closing tag actually exists.
  // <a><b></c></b></a> will close everything, otherwise.
  var t = parser.tags.length;
  if (!parser.strict) parser.tagName = parser.tagName[parser.tagCase]();
  var closeTo = parser.tagName;
  while (t --) {
    var close = parser.tags[t];
    if (close.name !== closeTo) {
      // fail the first time in strict mode
      strictFail(parser, "Unexpected close tag");
    } else break;
  }
  // didn't find it.  we already failed for strict, so just abort.
  if (t < 0) return;
  var s = parser.tags.length;
  while (s --> t) {
    parser.tag = parser.tags.pop();
    parser.tagName = parser.tag.name;
    emitNode(parser, "onclosetag", parser.tagName);
  }
  if (t === 0) parser.closedRoot = true;
  parser.tagName = parser.attribValue = parser.attribName = "";
  parser.tag = null;
  parser.state = S.TEXT;
}
function parseEntity (parser) {
  var entity = parser.entity.toLowerCase(), num, numStr = "";
  if (parser.ENTITIES[entity]) return parser.ENTITIES[entity];
  if (entity.charAt(0) === "#") {
    if (entity.charAt(1) === "x") {
      entity = entity.slice(2);
      num = parseInt(entity, 16), numStr = num.toString(16);
    } else {
      entity = entity.slice(1);
      num = parseInt(entity, 10), numStr = num.toString(10);
    }
  }
  if (numStr.toLowerCase() !== entity) {
    strictFail(parser, "Invalid character entity");
    return "&"+parser.entity + ";";
  }
  return String.fromCharCode(num);
}

function write (chunk) {
  var parser = this;
  if (this.error) throw this.error;
  if (parser.closed) return error(parser,
    "Cannot write after close. Assign an onready handler.");
  if (chunk === null) return end(parser);
  var i = 0, c = ""
  while (parser.c = c = chunk.charAt(i++)) {
    parser.position ++;
    if (c === "\n") {
      parser.line ++;
      parser.column = 0;
    } else parser.column ++;
    switch (parser.state) {
      case S.BEGIN:
        if (c === "<") parser.state = S.OPEN_WAKA;
        else if (not(whitespace,c)) {
          // have to process this as a text node.
          // weird, but happens.
          strictFail(parser, "Non-whitespace before first tag.");
          parser.textNode = c;
          state = S.TEXT;
        }
      continue;
      case S.TEXT:
        if (c === "<") parser.state = S.OPEN_WAKA;
        else {
          if (not(whitespace, c) && (!parser.sawRoot || parser.closedRoot))
            strictFail("Text data outside of root node.");
          if (c === "&") parser.state = S.TEXT_ENTITY;
          else parser.textNode += c;
        }
      continue;
      case S.OPEN_WAKA:
        // either a /, ?, !, or text is coming next.
        if (c === "!") {
          parser.state = S.SGML_DECL;
          parser.sgmlDecl = "";
        } else if (is(whitespace, c)) {
          // wait for it...
        } else if (is(nameStart,c)) {
          parser.state = S.OPEN_TAG;
          parser.tagName = c;
        } else if (c === "/") {
          parser.state = S.CLOSE_TAG;
          parser.tagName = "";
        } else if (c === "?") {
          parser.state = S.PROC_INST;
          parser.procInstName = parser.procInstBody = "";
        } else {
          strictFail(parser, "Unencoded <");
          parser.textNode += "<" + c;
          parser.state = S.TEXT;
        }
      continue;
      case S.SGML_DECL:
        if ((parser.sgmlDecl+c).toUpperCase() === CDATA) {
          emitNode(parser, "onopencdata");
          parser.state = S.CDATA;
          parser.sgmlDecl = "";
          parser.cdata = "";
        } else if (parser.sgmlDecl+c === "--") {
          parser.state = S.COMMENT;
          parser.comment = "";
          parser.sgmlDecl = "";
        } else if ((parser.sgmlDecl+c).toUpperCase() === DOCTYPE) {
          parser.state = S.DOCTYPE;
          if (parser.doctype || parser.sawRoot) strictFail(parser,
            "Inappropriately located doctype declaration");
          parser.doctype = "";
          parser.sgmlDecl = "";
        } else if (c === ">") {
          emitNode(parser, "onsgmldeclaration", parser.sgmlDecl);
          parser.sgmlDecl = "";
          parser.state = S.TEXT;
        } else if (is(quote, c)) {
          parser.state = S.SGML_DECL_QUOTED;
          parser.sgmlDecl += c;
        } else parser.sgmlDecl += c;
      continue;
      case S.SGML_DECL_QUOTED:
        if (c === parser.q) {
          parser.state = S.SGML_DECL;
          parser.q = "";
        }
        parser.sgmlDecl += c;
      continue;
      case S.DOCTYPE:
        if (c === ">") {
          parser.state = S.TEXT;
          emitNode(parser, "ondoctype", parser.doctype);
          parser.doctype = true; // just remember that we saw it.
        } else {
          parser.doctype += c;
          if (c === "[") parser.state = S.DOCTYPE_DTD;
          else if (is(quote, c)) {
            parser.state = S.DOCTYPE_QUOTED;
            parser.q = c;
          }
        }
      continue;
      case S.DOCTYPE_QUOTED:
        parser.doctype += c;
        if (c === parser.q) {
          parser.q = "";
          parser.state = S.DOCTYPE;
        }
      continue;
      case S.DOCTYPE_DTD:
        parser.doctype += c;
        if (c === "]") parser.state = S.DOCTYPE;
        else if (is(quote,c)) {
          parser.state = S.DOCTYPE_DTD_QUOTED;
          parser.q = c;
        }
      continue;
      case S.DOCTYPE_DTD_QUOTED:
        parser.doctype += c;
        if (c === parser.q) {
          parser.state = S.DOCTYPE_DTD;
          parser.q = "";
        }
      continue;
      case S.COMMENT:
        if (c === "-") parser.state = S.COMMENT_ENDING;
        else parser.comment += c;
      continue;
      case S.COMMENT_ENDING:
        if (c === "-") {
          parser.state = S.COMMENT_ENDED;
          parser.comment = textopts(parser.opt, parser.comment);
          if (parser.comment) emitNode(parser, "oncomment", parser.comment);
          parser.comment = "";
        } else {
          strictFail(parser, "Invalid comment");
          parser.comment += "-" + c;
        }
      continue;
      case S.COMMENT_ENDED:
        if (c !== ">") strictFail(parser, "Malformed comment");
        else parser.state = S.TEXT;
      continue;
      case S.CDATA:
        if (c === "]") parser.state = S.CDATA_ENDING;
        else parser.cdata += c;
      continue;
      case S.CDATA_ENDING:
        if (c === "]") parser.state = S.CDATA_ENDING_2;
        else {
          parser.cdata += "]" + c;
          parser.state = S.CDATA;
        }
      continue;
      case S.CDATA_ENDING_2:
        if (c === ">") {
          if (parser.cdata) emitNode(parser, "oncdata", parser.cdata);
          emitNode(parser, "onclosecdata");
          parser.cdata = "";
          parser.state = S.TEXT;
        } else {
          parser.cdata += "]]" + c;
          parser.state = S.CDATA;
        }
      continue;
      case S.PROC_INST:
        if (c === "?") parser.state = S.PROC_INST_ENDING;
        else if (is(whitespace, c)) parser.state = S.PROC_INST_BODY;
        else parser.procInstName += c;
      continue;
      case S.PROC_INST_BODY:
        if (!parser.procInstBody && is(whitespace, c)) continue;
        else if (c === "?") parser.state = S.PROC_INST_ENDING;
        else if (is(quote, c)) {
          parser.state = S.PROC_INST_QUOTED;
          parser.q = c;
          parser.procInstBody += c;
        } else parser.procInstBody += c;
      continue;
      case S.PROC_INST_ENDING:
        if (c === ">") {
          emitNode(parser, "onprocessinginstruction", {
            name : parser.procInstName,
            body : parser.procInstBody
          });
          parser.procInstName = parser.procInstBody = "";
          parser.state = S.TEXT;
        } else {
          parser.procInstBody += "?" + c;
          parser.state = S.PROC_INST_BODY;
        }
      continue;
      case S.PROC_INST_QUOTED:
        parser.procInstBody += c;
        if (c === parser.q) {
          parser.state = S.PROC_INST_BODY;
          parser.q = "";
        }
      continue;
      case S.OPEN_TAG:
        if (is(nameBody, c)) parser.tagName += c;
        else {
          newTag(parser);
          if (c === ">") openTag(parser);
          else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
          else {
            if (not(whitespace, c)) strictFail(
              parser, "Invalid character in tag name");
            parser.state = S.ATTRIB;
          }
        }
      continue;
      case S.OPEN_TAG_SLASH:
        if (c === ">") {
          openTag(parser, true);
          closeTag(parser);
        } else {
          strictFail(parser, "Forward-slash in opening tag not followed by >");
          parser.state = S.ATTRIB;
        }
      continue;
      case S.ATTRIB:
        // haven't read the attribute name yet.
        if (is(whitespace, c)) continue;
        else if (c === ">") openTag(parser);
        else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
        else if (is(nameStart, c)) {
          parser.attribName = c;
          parser.attribValue = "";
          parser.state = S.ATTRIB_NAME;
        } else strictFail(parser, "Invalid attribute name");
      continue;
      case S.ATTRIB_NAME:
        if (c === "=") parser.state = S.ATTRIB_VALUE;
        else if (is(whitespace, c)) parser.state = S.ATTRIB_NAME_SAW_WHITE;
        else if (is(nameBody, c)) parser.attribName += c;
        else strictFail(parser, "Invalid attribute name");
      continue;
      case S.ATTRIB_NAME_SAW_WHITE:
        if (c === "=") parser.state = S.ATTRIB_VALUE;
        else if (is(whitespace, c)) continue;
        else {
          strictFail(parser, "Attribute without value");
          parser.tag.attributes[parser.attribName] = "";
          parser.attribValue = "";
          emitNode(parser, "onattribute", { name : parser.attribName, value : "" });
          parser.attribName = "";
          if (c === ">") openTag(parser);
          else if (is(nameStart, c)) {
            parser.attribName = c;
            parser.state = S.ATTRIB_NAME;
          } else {
            strictFail(parser, "Invalid attribute name");
            parser.state = S.ATTRIB;
          }
        }
      continue;
      case S.ATTRIB_VALUE:
        if (is(whitespace, c)) continue;
        else if (is(quote, c)) {
          parser.q = c;
          parser.state = S.ATTRIB_VALUE_QUOTED;
        } else {
          strictFail(parser, "Unquoted attribute value");
          parser.state = S.ATTRIB_VALUE_UNQUOTED;
          parser.attribValue = c;
        }
      continue;
      case S.ATTRIB_VALUE_QUOTED:
        if (c !== parser.q) {
          if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_Q;
          else parser.attribValue += c;
          continue;
        }
        parser.tag.attributes[parser.attribName] = parser.attribValue;
        emitNode(parser, "onattribute", {
          name:parser.attribName, value:parser.attribValue});
        parser.attribName = parser.attribValue = "";
        parser.q = "";
        parser.state = S.ATTRIB;
      continue;
      case S.ATTRIB_VALUE_UNQUOTED:
        if (not(whitespace+">",c)) {
          if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_U;
          else parser.attribValue += c;
          continue;
        }
        emitNode(parser, "onattribute", {
          name:parser.attribName, value:parser.attribValue});
        parser.attribName = parser.attribValue = "";
        if (c === ">") openTag(parser);
        else parser.state = S.ATTRIB;
      continue;
      case S.CLOSE_TAG:
        if (!parser.tagName) {
          if (is(whitespace, c)) continue;
          else if (not(nameStart, c)) strictFail(parser,
            "Invalid tagname in closing tag.");
          else parser.tagName = c;
        }
        else if (c === ">") closeTag(parser);
        else if (is(nameBody, c)) parser.tagName += c;
        else {
          if (not(whitespace, c)) strictFail(parser,
            "Invalid tagname in closing tag");
          parser.state = S.CLOSE_TAG_SAW_WHITE;
        }
      continue;
      case S.CLOSE_TAG_SAW_WHITE:
        if (is(whitespace, c)) continue;
        if (c === ">") closeTag(parser);
        else strictFail("Invalid characters in closing tag");
      continue;
      case S.TEXT_ENTITY:
      case S.ATTRIB_VALUE_ENTITY_Q:
      case S.ATTRIB_VALUE_ENTITY_U:
        switch(parser.state) {
          case S.TEXT_ENTITY:
            var returnState = S.TEXT, buffer = "textNode";
          break;
          case S.ATTRIB_VALUE_ENTITY_Q:
            var returnState = S.ATTRIB_VALUE_QUOTED, buffer = "attribValue";
          break;
          case S.ATTRIB_VALUE_ENTITY_U:
            var returnState = S.ATTRIB_VALUE_UNQUOTED, buffer = "attribValue";
          break;
        }
        if (c === ";") {
          parser[buffer] += parseEntity(parser);
          parser.entity = "";
          parser.state = returnState;
        }
        else if (is(entity, c)) parser.entity += c;
        else {
          strictFail("Invalid character entity");
          parser[buffer] += "&" + parser.entity;
          parser.entity = "";
          parser.state = returnState;
        }
      continue;
      default:
        throw new Error(parser, "Unknown state: " + parser.state);
      break;
    }
  } // while
  // cdata blocks can get very big under normal conditions. emit and move on.
  if (parser.state === S.CDATA && parser.cdata) {
    emitNode(parser, "oncdata", parser.cdata);
    parser.cdata = "";
  }
  if (parser.position >= parser.bufferCheckPosition) checkBufferLength(parser);
  return parser;
}


var sax = exports;
sax.parser = function (strict, opt) { return new SAXParser(strict, opt) };
sax.SAXParser = SAXParser;

function SAXParser (strict, opt) {
  this.buffer = this.c = this.comment = this.sgmlDecl =
    this.textNode = this.tagName = this.doctype =
    this.procInstName = this.procInstBody = this.entity =
    this.attribName = this.attribValue = this.q = "";
  this.opt = opt || {trim:false};
  this.tags = [];
  this.closedRoot = this.sawRoot = false;
  this.tag = this.error = null;
  this.strict = !!strict;
  this.state = S.BEGIN;
  // just for error reporting
  this.position = this.line = this.column = 0;
  emit(this, "onready");
}
SAXParser.prototype = {
  write : function (chunk) {
    if (this.error) throw new Error(
      "Cannot write while in error. Handle error and call resume().");
    if (this.closed) return error(this,
      "Cannot write after close. Assign an onready handler.");
    this.buffer += chunk;
    this.process();
    return this;
  },
  // go on after an error occurs.
  resume : function () {
    this.error = null;
    this.process();
    return this;
  },
  close : function () {
    this.closed = true;
    this.process();
    return this;
  },
  process : function () {
    if (!this.buffer && this.closed) return end(this);
    while (this.buffer) {
      chomp(this);
      trampoline(this);
    }
    return this;
  }
};

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
};

var ENTITIES = sax.ENTITIES =
{ "apos" : "'"
, "quot" : '"'
, "amp"  : "&"
, "gt"   : ">"
, "lt"   : "<"
};

// T is for Trampoline...
var T = sax.trampoline = {};
// ... and for Translation Table.
for (var S in sax.STATE) sax.STATE[sax.STATE[S]] = S;

// shorthand
S = sax.STATE;
sax.EVENTS = [ // for discoverability.
  "text", "processinginstruction", "sgmldeclaration",
  "doctype", "comment", "attribute", "opentag", "closetag",
  "cdata", "error", "end", "ready" ];

function emit (parser, event, data) {
  parser[event] && parser[event](data);
}
function emitNode (parser, nodeType, data) {
  if (parser.textNode) closeText(parser);
  emit(parser, nodeType, data);
}
function closeText (parser) {
  if (parser.opt.trim) parser.textNode = parser.textNode.trim();
  if (parser.textNode) emit(parser, "ontext", parser.textNode);
  parser.textNode = "";
}

function error (parser, er) {
  closeText(parser);
  er += "\nLine: "+parser.line+
        "\nColumn: "+parser.column+
        "\nChar: "+parser.c+
        "\nBuffer: "+parser.buffer.substr(0, 25);
  er = new Error(er);
  parser.error = er;
  emit(parser, "onerror", er);
}

function end (parser) {
  if (parser.state !== S.TEXT) error(parser, "Unexpected end");
  closeText(parser);
  parser.c = "";
  emit(parser, "onend");
  SAXParser.call(parser, parser.strict);
}
function strictFail (parser, message) {
  if (parser.strict) error(parser, message);
}
function chomp (parser) {
  parser.c = parser.buffer.charAt(0);
  parser.buffer = parser.buffer.slice(1);
  parser.position ++;
  if (parser.c === "\n") {
    parser.line ++;
    parser.column = 0;
  } else parser.column ++;
}

///// Jump 

function trampoline (parser) { T[S[parser.state]](parser, parser.c) }
// http://www.youtube.com/watch?v=jcrzCdNFpT8
T.BEGIN = function (parser, c) {
  if (c === "<") parser.state = S.OPEN_WAKA;
  else if (not(whitespace,c)) {
    // have to process this as a text node.
    // weird, but happens.
    strictFail(parser, "Non-whitespace before first tag.");
    parser.textNode = c;
    state = S.TEXT;
  }
};
T.TEXT = function (parser, c) {
  if (c === "<") parser.state = S.OPEN_WAKA;
  else if (not(whitespace, c) && (!parser.sawRoot || parser.closedRoot)) {
    // non-whitespace or comments or procinsts after the root.
    strictFail("Text data outside of root node.");
  }
  else if (c === "&") parser.state = S.TEXT_ENTITY;
  else parser.textNode += c;
}

T.OPEN_WAKA = function (parser, c) {
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
}
// Comments, Doctypes, Cdata, mostly
T.SGML_DECL = function (parser, c) {
  if ((parser.sgmlDecl+c).toUpperCase() === CDATA) {
    parser.state = S.CDATA;
    parser.sgmlDecl = "";
  } else if (parser.sgmlDecl+c === "--") {
    parser.state = S.COMMENT;
    parser.comment = "";
    parser.sgmlDecl = "";
  } else if (c === ">") {
    if (parser.sgmlDecl.toUpperCase().substr(0, DOCTYPE.length) === DOCTYPE) {
      emitNode(parser, "ondoctype", parser.sgmlDecl.substr(0, DOCTYPE.length));
    } else emitNode(parser, "onsgmldeclaration", parser.sgmlDecl);
    parser.sgmlDecl = "";
    parser.state = S.TEXT;
  } else if (is(quote, c)) {
    parser.state = S.SGML_DECL_QUOTED;
    parser.sgmlDecl += c;
  } else parser.sgmlDecl += c;
}
T.SGML_DECL_QUOTED = function (parser, c) {
  if (c === parser.q) {
    parser.state = S.SGML_DECL;
    parser.q = "";
  }
  parser.sgmlDecl += c;
}
T.COMMENT = function (parser, c) {
  if (c === "-") parser.state = S.COMMENT_ENDING;
  else parser.comment += c;
}
T.COMMENT_ENDING = function (parser, c) {
  if (c === "-") {
    parser.state = S.COMMENT_ENDED;
    emitNode(parser, "oncomment", parser.comment);
    parser.comment = "";
  } else {
    strictFail(parser, "Invalid comment");
    parser.comment += "-" + c;
  }
}
T.COMMENT_ENDED = function (parser, c) {
  if (c !== ">") strictFail(parser, "Malformed comment");
  else parser.state = S.TEXT;
}
T.CDATA = function (parser, c) {
  if (c === "]") parser.state = S.CDATA_ENDING;
  else parser.cdata += c;
}
T.CDATA_ENDING = function (parser, c) {
  if (c === "]") parser.state = S.CDATA_ENDING_2;
  else {
    parser.cdata += "]" + c;
    parser.state = S.CDATA;
  }
}
T.CDATA_ENDING_2 = function (parser, c) {
  if (c === ">") {
    emitNode(parser, "oncdata", parser.cdata);
    parser.cdata = "";
  } else {
    parser.cdata += "]]" + c;
    parser.state = S.CDATA;
  }
}
T.PROC_INST = function (parser, c) {
  if (c === "?") parser.state = S.PROC_INST_ENDING;
  else if (is(whitespace, c)) parser.state = S.PROC_INST_BODY;
  else parser.procInstName += c;
}
T.PROC_INST_BODY = function (parser, c) {
  if (!parser.procInstBody && is(whitespace, c)) return;
  else if (c === "?") parser.state = S.PROC_INST_ENDING;
  else if (is(quote, c)) {
    parser.state = S.PROC_INST_QUOTED;
    parser.q = c;
    parser.procInstBody += c;
  } else parser.procInstBody += c;
}
T.PROC_INST_ENDING = function (parser, c) {
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
}
T.PROC_INST_QUOTED = function (parser, c) {
  parser.procInstBody += c;
  if (c === parser.q) {
    parser.state = S.PROC_INST_BODY;
    parser.q = "";
  }
}
function newTag (parser) {
  parser.tag = { name : parser.tagName, attributes : {} };
}
function openTag (parser) {
  parser.sawRoot = true;
  parser.tags.push(parser.tag);
  emitNode(parser, "onopentag", parser.tag);
  parser.tag = null;
  parser.tagName = parser.attribName = parser.attribValue = "";
  parser.state = S.TEXT;
}
T.OPEN_TAG = function (parser, c) {
  if (is(nameBody, c)) parser.tagName += c;
  else {
    newTag(parser);
    if (c === ">") openTag(parser);
    else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
    else {
      if (not(whitespace, c)) strictFail(parser, "Invalid character in tag name");
      parser.state = S.ATTRIB;
    }
  }
}
T.OPEN_TAG_SLASH = function (parser, c) {
  if (c === ">") {
    openTag(parser);
    closeTag(parser);
  } else {
    strictFail(parser, "Forward-slash in opening tag not followed by >");
    parser.state = S.ATTRIB;
  }
}
T.ATTRIB = function (parser, c) {
  // haven't read the attribute name yet.
  if (is(whitespace, c)) return;
  else if (c === ">") openTag(parser);
  else if (is(nameStart, c)) {
    parser.attribName = c;
    parser.attribValue = "";
    parser.state = S.ATTRIB_NAME;
  } else strictFail(parser, "Invalid attribute name");
}
T.ATTRIB_NAME = function (parser, c) {
  if (c === "=") parser.state = S.ATTRIB_VALUE;
  else if (is(whitespace, c)) parser.state = S.ATTRIB_NAME_SAW_WHITE;
  else if (is(nameBody, c)) parser.attribName += c;
  else strictFail(parser, "Invalid attribute name");
}
T.ATTRIB_NAME_SAW_WHITE = function (parser, c) {
  if (c === "=") parser.state = S.ATTRIB_VALUE;
  else if (is(whitespace, c)) return;
  else {
    strictFail(parser, "Attribute without value");
    parser.tag.attributes[parser.attribName] = "";
    parser.attribValue = "";
    emitNode(parser, "onattribute", { name : parser.attribName, value : "" });
    parser.attribName = "";
    if (c === ">") T.OPEN_TAG(parser, c);
    else if (is(nameStart, c)) {
      parser.attribName = c;
      parser.state = S.ATTRIB_NAME;
    } else {
      strictFail(parser, "Invalid attribute name");
      parser.state = S.ATTRIB;
    }
  }
}
T.ATTRIB_VALUE = function (parser, c) {
  if (is(quote, c)) {
    parser.q = c;
    parser.state = S.ATTRIB_VALUE_QUOTED;
  } else {
    strictFail(parser, "Unquoted attribute value");
    parser.state = S.ATTRIB_VALUE_UNQUOTED;
    parser.attribValue = c;
  }
}
T.ATTRIB_VALUE_QUOTED = function (parser, c) {
  if (c !== parser.q) {
    if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_Q;
    else parser.attribValue += c;
    return;
  }
  parser.tag.attributes[parser.attribName] = parser.attribValue;
  emitNode(parser, "onattribute", {
    name:parser.attribName, value:parser.attribValue});
  parser.attribName = parser.attribValue = "";
  parser.q = "";
  parser.state = S.ATTRIB;
}
T.ATTRIB_VALUE_UNQUOTED = function (parser, c) {
  if (not(whitespace+">",c)) {
    if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_U;
    else parser.attribValue += c;
    return;
  }

  emitNode(parser, "onattribute", {
    name:parser.attribName, value:parser.attribValue});
  parser.attribName = parser.attribValue = "";
  parser.state = S.ATTRIB;
  T.ATTRIB(parser, c);
}

function closeTag (parser) {
  if (!parser.tagName) {
    strictFail(parser, "Weird empty close tag.");
    parser.textNode += "</>";
    parser.state = S.TEXT;
    return;
  }
  do {
    var closeTo = parser.tagName, close = parser.tags.pop();
    if (closeTo !== close.name) {
      strictFail(parser, "Unexpected close tag.");
    }
    parser.tag = close;
    parser.tagName = close.name;
    emitNode(parser, "onclosetag", parser.tagName);
  } while (closeTo !== close.name);
  if (parser.tags.length === 0) parser.closedRoot = true;
  parser.tagName = parser.attribValue = parser.attribName = "";
  parser.tag = null;
  parser.state = S.TEXT;
}
T.CLOSE_TAG = function (parser, c) {
  if (!parser.tagName) {
    if (is(whitespace, c)) return;
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
}
T.CLOSE_TAG_SAW_WHITE = function (parser, c) {
  if (is(whitespace, c)) return;
  if (c === ">") closeTag(parser);
  else strictFail("Invalid characters in closing tag");
}

// Character entities.
function parseEntity (parser) {
  var entity = parser.entity.toLowerCase(), num, numStr = "";
  if (ENTITIES[entity]) return ENTITIES[entity];
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
function entityHandler (returnState, buffer) {
  return function (parser, c) {
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
  };
}
T.TEXT_ENTITY = entityHandler(S.TEXT, "textNode");
T.ATTRIB_VALUE_ENTITY_Q = entityHandler(S.ATTRIB_VALUE_QUOTED, "attribValue");
T.ATTRIB_VALUE_ENTITY_U = entityHandler(S.ATTRIB_VALUE_UNQUOTED, "attribValue");
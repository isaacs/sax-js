(function (exports) {

var sax = exports;
sax.parser = function (strict) { return new SAXParser(strict) };

var sys = require("sys");

// character classes.
var whitespace = "\r\n\t ",
  lowerAlpha = "abcdefghijklmnopqrstuvwxyz",
  upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  alpha = lowerAlpha + upperAlpha,
  alphanum = alpha + "0123456789",
  alphanumDash = alphanum + "-",
  alphanumDashUnder = alphanumDash + "_",
  nameStart = alpha,
  nameBody = alphanumDashUnder+":",
  squote = "'",
  dquote = '"',
  quote = squote+dquote,
  DOCTYPE = "DOCTYPE",
  selfClosing = [
    "AREA","BASE","BASEFONT","BR","HR","INPUT","IMG","LINK","META","EMBED","SCRIPT",
    "FRAME","COL","PARAM","TITLE" // know of any more?
  ];

function is (charclass, c) { return charclass.indexOf(c) !== -1 }
function not (charclass, c) { return !is(charclass, c) }

function error (self, message) {
  who.error = new Error(message);
  emit(self, "onerror", self.error);
};
function emit (self, ev, data) { self && self[ev] && self[ev](data) };

// states
var s = 0
  , S_BEGIN = s++
  , S_TEXT_NODE = s++
  , S_OPEN_WAKA = s++

  , S_COMMENT = s++
  , S_DOCTYPE = s++
  , S_COMMENT_EXCL_DASH = s++
  , S_COMMENT_BODY = s++
  , S_COMMENT_END = s++
  , S_COMMENT_END_FERREALS = s++
  , S_COMMENT_ENDED = s++

  , S_START_TAG = s++
  , S_START_TAG_SLASH = s++
  , S_START_TAG_SELF_CLOSE = s++
  
  , S_ATTRIB = s++
  , S_ATTRIB_VALUE = s++
  
  , S_END_TAG = s++
  , S_END_TAG_FERREALS = s++
  , S_END_TAG_WHITESPACE = s++
  
  , S_PROC_INST = s++
  , S_PROC_INST_ENDING = s++
  , S_PROC_INST_BODY = s++
  ;

function SAXParser (strict) {
  var buffer = "",
    going = false,
    sawRoot = false,
    self = this,
    tags = [], // stack of open tags
    tagName = "",
    textNode = "",
    attribName = "",
    attribValue = "",
    comment = "",
    tag = null,
    q = "",
    c = "",
    procInst = null,
    procInstName = "",
    procInstBody = "",
    state = S_BEGIN;
  
  this.position = 0;

  // public methods.
  var closed = false;
  function eof () {
    if (state !== S_TEXT_NODE) return error(self, "Unexpected end");
    closeText();
    if ( tags.length ) strictFail("End with unclosed tags: "+tags);
    while (tag = tags.pop()) emitNode("closetag", tag.name);
    emit(self, "onend");
    start(); // ready to parse another stream.
  };
  this.write = write;
  function write (s) {
    if (s === null) closed = true;
    else if (self.error) {
      throw new Error(
        "Cannot write while in an error state. Please resolve error first.");
    }
    else if (closed) return error(self, "Cannot write after close.");
    else buffer += s;
    if (!going) playTheSax();
    going = true;
    return this;
  };
  this.close = function () { write(null); return this };
  function start () {
    closed = going = sawRoot = false;
    procInstName = procInstBody = this.c = c = 
      this.buffer = buffer = tagName = attribName = 
      attribValue = q = comment = "",
    procInst = tag = null;
    state = S_BEGIN;
    self.position = position = 0;
  };
  function closeText () {
    if (textNode) emit(self, "ontext", textNode);
    textNode = "";
  };
  function strictFail (m) {
    if (!strict) return;
    closeText(); // finish up any outstanding text node
    return error(self, m+"\nCharacter: "+c+"\nBuffer: "+buffer.substr(0,25));
  };
  function emitNode (type, data) {
    closeText();
    emit(self, "on"+type, data);
  };
  function tagSelfClose () {
    tag = tags.pop();
    emitNode("opentag", tag);
    emitNode("closetag", tag);
    tag = null;
    state = S_TEXT_NODE;
  };
  function makeTag () {
    if (tag || !tagName) return;
    if (!sawRoot) sawRoot = true;
    else if (!tags.length) strictFail(
      "Open tag outside of documentElement.");
    if (!strict) tagName = tagName.toUpperCase();
    tag = {name:tagName, attributes:{}};
    tags.push(tag);
    tagName = "";
    return tag;
  };
  function endTag () {
    var i = tags.length - 1;
    tag = tags[i];
    if (!strict) tagName = tagName.toUpperCase();
    
    if (!tag || tag.name !== tagName) strictFail(
      "Malformed tags. " + sys.inspect(tag));
    while (i > -1) {
      tag = tags[i--];
      if (tag.name === tagName) break;
      else tag = null;
    }
    
    // close up to it, or ignore it.
    // this way, <b><i>foo</b></i> will parse as <b><i>foo</i></b>
    // but in strict mode, it'll throw.
    if (tag) {
      for (var t = tags.pop(); t && t.name !== tagName; t = tags.pop()) {
        emitNode("closetag", t.name);
      }
      emitNode("closetag", t.name);
    }
    tagName = "";
    tag = null;
    state = S_TEXT_NODE;
  };
  function startTagDone () {
    makeTag();
    if (!strict && selfClosing.indexOf(tag.name) !== -1) return tagSelfClose();
    emitNode("opentag", tag);
    tag = null;
    state = S_TEXT_NODE;
  };
  function playTheSax () {
    while (buffer.length && !self.error) {
      c = buffer.substr(0,1);
      buffer = buffer.substr(1);
      this.position ++;
      this.buffer = buffer;
      this.c = c;
      // the state machine
      switch (state) {
        case S_BEGIN:
          if (c === "<") state = S_OPEN_WAKA;
          else if (is(whitespace,c)) {
            // have to process this as a text node.
            // weird, but happens.
            strictFail("Non-whitespace before first tag.");
            textNode = c;
            state = S_TEXT_NODE;
          }
        continue;
        
        case S_TEXT_NODE:
          if (c === "<") {
            state = S_OPEN_WAKA;
            continue;
          } else if (!tags.length) {
            // xml doesn't allow anything but comments, whitespace, and
            // processing instructions outside of the root tag.
            if (not(whitespace, c)) strictFail(
              "Content outside of root tag.");
          }
          textNode += c;
          // don't emit yet, since we don't *know* it's over yet.
        continue;
        
        case S_OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === "!") {
            comment = "";
            state = S_COMMENT;
          } else if (is(whitespace, c)) {
            // wait for it...
          } if (is(nameStart,c)) {
            state = S_START_TAG;
            tagName = c;
          } else if (c === "/") {
            state = S_END_TAG;
          } else if (c === "?") {
            state = S_PROC_INST;
          } else if (c === "!") {
            state = S_COMMENT;
          } else {
            strictFail(
              "Unencoded < not at start of tag or processing instruction");
            textNode += "<" + c;
            state = S_TEXT_NODE;
          }
        continue;
        
        // comments
        case S_COMMENT:
          if (c !== "-") {
            strictFail("Invalid comment");
            textNode = "<!"+c;
            state = S_TEXT_NODE;
          }
          state = S_COMMENT_EXCL_DASH;
        continue;
        case S_COMMENT_EXCL_DASH:
          if (c !== "-") {
            strictFail("Invalid comment");
            textNode = "<!-"+c;
            state = S_TEXT_NODE;
          }
          comment = "";
          state = S_COMMENT_BODY;
        continue;
        case S_COMMENT_BODY:
          if (c === "-") {
            state = S_COMMENT_END;
          } else {
            comment += c;
          }
        continue;
        case S_COMMENT_END:
          // need to get another dash, or throw.
          if (c === "-") {
            state = S_COMMENT_END_FERREALS;
          } else {
            strictFail("Invalid comment: contains -");
            comment += c;
          }
        continue;
        case S_COMMENT_END_FERREALS:
          emitNode("comment", comment);
          comment = "";
          state = S_COMMENT_ENDED;
        continue;
        case S_COMMENT_ENDED:
          // keep walking until we get a >
          if (c === ">") state = S_TEXT_NODE;
        continue;
        
        // opening tags.
        case S_START_TAG:
          // read the tagName till the first whitespace or > or invalid char.
          if (c === ">") startTagDone();
          else if (c === "/") state = S_START_TAG_SLASH;
          else if (is(whitespace, c)) {
            // start reading attributes.
            state = S_ATTRIB;
          } else if (is(nameBody, c)) {
            // part of the tag name.
            tagName += c;
          } else {
            // something wonky?
            strictFail("Malformed open tag: "+tagName);
            state = S_ATTRIB;
          }
        continue;
        case S_START_TAG_SLASH:
          // XML is strangesauce.
          // in strict mode, this means that the tag is closed, and anything
          // between here and the > is to be discarded.  In non-strict mode,
          // it's just like whitespace.
          if (!strict) state = S_ATTRIB;
          else if (c === ">") state = S_START_TAG_SELF_CLOSE;
        continue;
        case S_START_TAG_SELF_CLOSE:
          tagSelfClose()
        continue;
        
        // attributes
        case S_ATTRIB:
          makeTag();
          if (attribName) {
            if (is(nameBody, c)) {
              attribName += c;
            } else if (c === "=") {
              state = S_ATTRIB_VALUE;
            } else {
              // something like <input disabled type=text>
              // or <script defer>
              // not allowed in strict, but could be either a >, or something wonky.
              strictFail("Attribute missing value: "+attribName);
              if (c === ">") startTagDone();
              emitNode("attribute", {name:attribName, value:""});
              attribName = tag.attributes[attribName] = attribValue = "";
            }
          } else {
            // new attribute;
            if (is(whitespace, c)) {
              // keep looking.
            } if (is(nameStart, c)) attribName = c;
            else if (c === ">") startTagDone();
            else strictFail("Invalid start of attribute");
          }
        continue;
        case S_ATTRIB_VALUE:
          if (attribValue) {
            if ((q && c === q) || is(whitespace,c) || c === ">") {
              // wrap it up.
              tag.attributes[attribName] = attribValue;
              emitNode("attribute", {name:attribName, value:attribValue});
              attribValue = attribName = "";
              if (c === ">") startTagDone();
              else state = S_ATTRIB;
            } else attribValue += c;
          } else if (is(quote, c)) {
            q = c;
          } else {
            attribValue = c;
          }
        continue;
        
        // end tags
        case S_END_TAG:
          // keep reading the tag name until we hit the >
          if (c === ">") {
            // tag is done, end it.
            // enforce well-formedness for XML, but let anything go for HTML.
            // if the tag isn't a tag in the list, then just spit it out as text.
            if (!tagName) {
              // never got it.
              strictFail(
                "Invalid weird stupid close tag where it doesn't belong. WTF, dude.");
              textNode += "</>";
              state = S_TEXT_NODE;
            } else endTag();
          } else if (is(whitespace,c)) {
            if (!tagName) continue; // still waiting for the tag name.
            state = S_END_TAG_WHITESPACE;
          } else if (tagName === "" && not(alpha,c)) {
            // tags must start with an alpha.
            strictFail("Tag does not start with alphabetic character.");
            state = S_TEXT_NODE;
            textNode = "</"+c;
          } else if (not(alphanumDashUnder,c)) {
            strictFail("Invalid character in tag name.");
            textNode = "</"+tagName+c;
            tagName = "";
            state = S_TEXT_NODE;
          } else {
            tagName += c;
          } 
        continue;
        case S_END_TAG_WHITESPACE:
          // need to see a > next, or fail.
          if (c === ">") endTag();
          else if (not(whitespace, c)) strictFail("Funny stuff in closing tag.");
        continue;
        
        // processing instructions.
        case S_PROC_INST:
          // <? has already been chomped.
          // read in data to ?>, and then emit.
          if (c === "?") state = S_PROC_INST_ENDING;
          else if (procInstName) {
            if (is(nameBody, c)) {
              procInstName += c;
            } else {
              if (not(whitespace, c)) procInstBody = c;
              else procInstBody = "";
              procInst = {name:procInstName, data:procInstBody};
              state = S_PROC_INST_BODY;
            }
          } else if (is(nameStart, c)) {
            procInstName = c;
          } else if (is(whitespace, c)) {
            // keep looking
          } else {
            strictFail("Invalid processing instruction");
          }
        continue;
        case S_PROC_INST_ENDING:
          if (c === ">") {
            procInst.body = procInstBody;
            emitNode("processingInstruction", procInst);
            procInst = null;
            procInstBody = procInstName = "";
            state = S_TEXT_NODE;
          } else {
            procInstBody += "?"+c;
            state = S_PROC_INST_BODY;
          }
        continue;
        case S_PROC_INST_BODY:
          if (c === "?") state = S_PROC_INST_ENDING;
          else if (!procInstBody && not(whitespace, c)) procInstBody = c;
          else if (procInstBody) procInstBody += c;
        continue;
        
      } // switch(state)
    } // while(buffer.length)
    // if we're closed, then finish it up.
    if (closed) eof();
    going = false;
  };
};

})(
  typeof exports === "object" ? exports : (this.sax = {})
);
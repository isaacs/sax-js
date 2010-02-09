# sax js

A sax-style parser for XML and HTML.

Designed with [node](http://nodejs.org/) in mind, but should work fine in the
browser or other CommonJS implementations.

## Usage

    var sax = require("./lib/sax"),
      strict = true, // set to false for html-mode
      parser = sax.parser(strict);
    
    parser.onerror = function (e) {
      // an error happened. 
    };
    parser.ontext = function (t) {
      // got some text.  t is the string of text.
    };
    parser.onopentag = function (node) {
      // opened a tag.  node has "name" and "attributes"
    };
    parser.onattribute = function (attr) {
      // an attribute.  attr has "name" and "value"
    };
    parser.onend = function () {
      // parser stream is done, and ready to have more stuff written to it.
    };
    
    parser.write('<xml>Hello, <who name="world">world</who>!</xml>').close();

## Methods

`write` - Write bytes onto the stream. You don't have to do this all at once. You
can keep writing as much as you want.

`close` - Close the stream. Once closed, no more data may be written until it is
done processing the buffer, which is signaled by the `end` event.

## Events

All events emit with a single argument.  To listen to an event, assign a function to `on<eventname>`.  Functions get executed in the this-context of the parser object.

`error` - Indication that something bad happened. The error will be hanging out on
`parser.error`, and must be deleted before parsing can continue. By listening to
this event, you can keep an eye on that kind of stuff. Note: this happens *much*
more in strict mode. Argument: instance of `Error`.

`text` - Text node. Argument: string of text.

`doctype` - The `<!DOCTYPE` declaration. Argument: doctype body string.

`processinginstruction` - Stuff like `<?xml foo="blerg" ?>`. Argument: object with
`name` and `body` members. Attributes are not parsed, as processing instructions
have implementation dependent semantics.

`opentag` - An opening tag. Argument: object with `name` and `attributes`. In
non-strict mode, tag names are uppercased.

`closetag` - A closing tag. In loose mode, tags are auto-closed if their parent
closes. In strict mode, well-formedness is enforced.  Note that self-closing tags
will have `closeTag` emitted immediately after `openTag`.  Argument: tag name.

`attribute` - An attribute node.  Argument: object with `name` and `value`.

`comment` - A comment node.  Argument: the string of the comment.

`end` - Indication that the closed stream is complete, and ready to start parsing
a new XML document.

## Todo

It'd be better if it parsed character classes in attribute names and values.  
Right now it doesn't.
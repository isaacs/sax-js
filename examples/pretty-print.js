var printer = require("../lib/sax").parser(false, {lowercasetags:true, trim:true}),
  sys = require("sys"),
  fs = require("fs");

function entity (str) {
  return str.replace('"', '&quot;');
}

printer.tabstop = 2;
printer.level = 0;
printer.indent = function () {
  sys.print("\n");
  for (var i = this.level; i > 0; i --) {
    for (var j = this.tabstop; j > 0; j --) {
      sys.print(" ");
    }
  }
}
printer.onopentag = function (tag) {
  this.indent();
  this.level ++;
  sys.print("<"+tag.name);
  for (var i in tag.attributes) {
    sys.print(" "+i+"=\""+entity(tag.attributes[i])+"\"");
  }
  sys.print(">");
}
printer.ontext = printer.ondoctype = function (text) {
  this.indent();
  sys.print(text);
}
printer.onclosetag = function (tag) {
  this.level --;
  this.indent();
  sys.print("</"+tag+">");
}
printer.oncdata = function (data) {
  this.indent();
  sys.print("<![CDATA["+data+"]]>");
}
printer.oncomment = function (comment) {
  this.indent();
  sys.print("<!--"+comment+"-->");
}
printer.onerror = function (error) {
  sys.debug(error);
  throw error;
}

if (!process.argv[2]) {
  throw new Error("Please provide an xml file to prettify\n"+
    "TODO: read from stdin or take a file");
}
var xmlfile = require("path").join(process.cwd(), process.argv[2]);
fs.open(xmlfile, "r", 0666, function (er, fd) {
  if (er) throw er;
  (function R () {
    fs.read(fd, 1024, null, "utf8", function (er, data, bytesRead) {
      if (er) throw er;
      if (data) {
        printer.write(data);
        R();
      } else {
        fs.close(fd);
        printer.close();
      }
    });
  })();
});




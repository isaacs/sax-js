var sax = require("../lib/sax")
  , parser = sax.parser()
  , assert = require("assert")
  , inspect = require('util').inspect
  ;

var paused = false

var events = [];

var expected = [
  [
    "attribute",
    [
      {
        "name": "XMLNS:XSI",
        "value": "http://www.w3.org/2001/XMLSchema-instance"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "VERSION",
        "value": "2.0"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "XSI:NONAMESPACESCHEMALOCATION",
        "value": "vast.xsd"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "VAST",
        "attributes": {
          "XMLNS:XSI": "http://www.w3.org/2001/XMLSchema-instance",
          "VERSION": "2.0",
          "XSI:NONAMESPACESCHEMALOCATION": "vast.xsd"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "ID",
        "value": "223626102"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "AD",
        "attributes": {
          "ID": "223626102"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "INLINE",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "VERSION",
        "value": "2.0"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "ADSYSTEM",
        "attributes": {
          "VERSION": "2.0"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "DART_DFA"
    ]
  ],
  [
    "closetag",
    [
      "ADSYSTEM"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "ADTITLE",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "In-Stream Video"
    ]
  ],
  [
    "closetag",
    [
      "ADTITLE"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "DESCRIPTION",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "A test creative with a description."
    ]
  ],
  [
    "closetag",
    [
      "DESCRIPTION"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "SURVEY",
        "attributes": {},
        "isSelfClosing": true
      }
    ]
  ],
  [
    "closetag",
    [
      "SURVEY"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "ID",
        "value": "DART"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "IMPRESSION",
        "attributes": {
          "ID": "DART"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/imp;v7;x;223626102;0-0;0;47414672;0/0;30477563/30495440/1;;~aopt=0/0/ff/0;~cs=j%3fhttp://s0.2mdn.net/dot.gif\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "IMPRESSION"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "ID",
        "value": "ThirdParty"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "IMPRESSION",
        "attributes": {
          "ID": "ThirdParty"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/ad/N270.Process_Other/B3473145;sz=1x1;ord=7753381?\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "IMPRESSION"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "CREATIVES",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "SEQUENCE",
        "value": "1"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "ADID",
        "value": ""
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "CREATIVE",
        "attributes": {
          "SEQUENCE": "1",
          "ADID": ""
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "LINEAR",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "DURATION",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "00:00:58"
    ]
  ],
  [
    "closetag",
    [
      "DURATION"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKINGEVENTS",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "start"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "start"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/activity;src=2215309;met=1;v=1;pid=47414672;aid=223626102;ko=0;cid=30477563;rid=30495440;rv=1;timestamp=7753381;eid1=11;ecn1=1;etm1=0;\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "midpoint"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "midpoint"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/activity;src=2215309;met=1;v=1;pid=47414672;aid=223626102;ko=0;cid=30477563;rid=30495440;rv=1;timestamp=7753381;eid1=18;ecn1=1;etm1=0;\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "midpoint"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "midpoint"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/ad/N270.Process_Other/B3473145.3;sz=1x1;ord=7753381?\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "firstQuartile"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "firstQuartile"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/activity;src=2215309;met=1;v=1;pid=47414672;aid=223626102;ko=0;cid=30477563;rid=30495440;rv=1;timestamp=7753381;eid1=26;ecn1=1;etm1=0;\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "firstQuartile"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "firstQuartile"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/ad/N270.Process_Other/B3473145.2;sz=1x1;ord=7753381?\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "thirdQuartile"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "thirdQuartile"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/activity;src=2215309;met=1;v=1;pid=47414672;aid=223626102;ko=0;cid=30477563;rid=30495440;rv=1;timestamp=7753381;eid1=27;ecn1=1;etm1=0;\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "thirdQuartile"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "thirdQuartile"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/ad/N270.Process_Other/B3473145.4;sz=1x1;ord=7753381?\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "complete"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "complete"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/activity;src=2215309;met=1;v=1;pid=47414672;aid=223626102;ko=0;cid=30477563;rid=30495440;rv=1;timestamp=7753381;eid1=13;ecn1=1;etm1=0;\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "complete"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "complete"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/ad/N270.Process_Other/B3473145.5;sz=1x1;ord=7753381?\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "mute"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "mute"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/activity;src=2215309;met=1;v=1;pid=47414672;aid=223626102;ko=0;cid=30477563;rid=30495440;rv=1;timestamp=7753381;eid1=16;ecn1=1;etm1=0;\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "pause"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "pause"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/activity;src=2215309;met=1;v=1;pid=47414672;aid=223626102;ko=0;cid=30477563;rid=30495440;rv=1;timestamp=7753381;eid1=15;ecn1=1;etm1=0;\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "fullscreen"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "fullscreen"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/activity;src=2215309;met=1;v=1;pid=47414672;aid=223626102;ko=0;cid=30477563;rid=30495440;rv=1;timestamp=7753381;eid1=19;ecn1=1;etm1=0;\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "EVENT",
        "value": "fullscreen"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "TRACKING",
        "attributes": {
          "EVENT": "fullscreen"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/ad/N270.Process_Other/B3473145.6;sz=1x1;ord=7753381?\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "TRACKINGEVENTS"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "ADPARAMETERS",
        "attributes": {},
        "isSelfClosing": true
      }
    ]
  ],
  [
    "closetag",
    [
      "ADPARAMETERS"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "VIDEOCLICKS",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "CLICKTHROUGH",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      " http://www.google.com/support/richmedia "
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "CLICKTHROUGH"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "ID",
        "value": "DART"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "CLICKTRACKING",
        "attributes": {
          "ID": "DART"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/click%3Bh%3Dv8/3c41/3/0/%2a/z%3B223626102%3B0-0%3B0%3B47414672%3B255-0/0%3B30477563/30495440/1%3B%3B%7Eaopt%3D0/0/ff/0%3B%7Esscs%3D%3fhttp://s0.2mdn.net/dot.gif\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "CLICKTRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "ID",
        "value": "ThirdParty"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "CLICKTRACKING",
        "attributes": {
          "ID": "ThirdParty"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://ad.doubleclick.net/clk;212442087;33815766;i?http://www.google.com/support/richmedia\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "CLICKTRACKING"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "VIDEOCLICKS"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "MEDIAFILES",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "ID",
        "value": "1"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "DELIVERY",
        "value": "progressive"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "TYPE",
        "value": "video/x-flv"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "BITRATE",
        "value": "457"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "WIDTH",
        "value": "300"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "HEIGHT",
        "value": "225"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "MEDIAFILE",
        "attributes": {
          "ID": "1",
          "DELIVERY": "progressive",
          "TYPE": "video/x-flv",
          "BITRATE": "457",
          "WIDTH": "300",
          "HEIGHT": "225"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nhttp://rmcdn.2mdn.net/MotifFiles/html/2215309/PID_914438_1235753019000_dcrmvideo.flv\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "MEDIAFILE"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "ID",
        "value": "2"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "DELIVERY",
        "value": "streaming"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "TYPE",
        "value": "video/x-flv"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "BITRATE",
        "value": "457"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "WIDTH",
        "value": "300"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "HEIGHT",
        "value": "225"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "MEDIAFILE",
        "attributes": {
          "ID": "2",
          "DELIVERY": "streaming",
          "TYPE": "video/x-flv",
          "BITRATE": "457",
          "WIDTH": "300",
          "HEIGHT": "225"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      "\nrtmp://rmcdn.f.2mdn.net/ondemand/MotifFiles/html/2215309/PID_914438_1235753019000_dcrmvideo.flv\n"
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "MEDIAFILE"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "MEDIAFILES"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "LINEAR"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "CREATIVE"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "SEQUENCE",
        "value": "1"
      }
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "ADID",
        "value": ""
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "CREATIVE",
        "attributes": {
          "SEQUENCE": "1",
          "ADID": ""
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "COMPANIONADS",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "closetag",
    [
      "COMPANIONADS"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "CREATIVE"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "CREATIVES"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "EXTENSIONS",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "attribute",
    [
      {
        "name": "TYPE",
        "value": "DART"
      }
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "EXTENSION",
        "attributes": {
          "TYPE": "DART"
        },
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "ADSERVINGDATA",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "DELIVERYDATA",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opentag",
    [
      {
        "name": "GEODATA",
        "attributes": {},
        "isSelfClosing": false
      }
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "opencdata",
    [
      null
    ]
  ],
  [
    "cdata",
    [
      " ct=PT&st=&ac=21&zp=&bw=2&dma=1&city=11349 "
    ]
  ],
  [
    "closecdata",
    [
      null
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "GEODATA"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "DELIVERYDATA"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "ADSERVINGDATA"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "EXTENSION"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "EXTENSIONS"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "INLINE"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "AD"
    ]
  ],
  [
    "text",
    [
      "\n"
    ]
  ],
  [
    "closetag",
    [
      "VAST"
    ]
  ]
];


sax.EVENTS.forEach(function(ev) {
  var methodName = 'on' + ev
  parser[methodName] = function() {
    events.push([ev, Array.prototype.slice.call(arguments)])
    assert.ok(! paused, 'paused')
  }
})

var xml = require('fs').readFileSync(__dirname + '/pause.xml', 'utf8')

var chunkLength = 100;
var currentIndex = 0;

function resume() {
  paused = false
  parser.resume()
  var chunk = xml.substring(currentIndex, currentIndex + chunkLength)
  currentIndex += chunkLength
  parser.write(chunk)
  if (chunk.length === chunkLength) {
    pause()
    // send a chunk while it's paused
    chunk = xml.substring(currentIndex, currentIndex + chunkLength)
    parser.write(chunk) // this should not trigger any event, only when resumed
    currentIndex += chunkLength
    process.nextTick(resume)
  } else {
    parser.close()
  }
}

parser.onend = function() {
  assert.strictEqual(JSON.stringify(expected), JSON.stringify(events));
}

function pause() {
  paused = true
  parser.pause()
}

resume();

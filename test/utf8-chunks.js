var fs             = require('fs')
  , clarinet       = require('../clarinet.js')
  , chunks         = clarinet.createStream()
  , assert         = require('assert')
  ;

var han_value = '我spl我it我';
var han_obj = '{"thing":"' + han_value + '"}';
var han_test_obj = '';
var han_buffer_first = new Buffer([0xe6, 0x88]);
var han_buffer_second = new Buffer([0x91, 0x73, 0x70, 0x6c, 0xe6, 0x88, 0x91, 0x69, 0x74, 0xe6, 0x88]);
var han_buffer_third = new Buffer([0x91]);
var han_buffer_full = new Buffer([
  0xe6, 0x88, 0x91,
  0x73, 0x70, 0x6c,
  0xe6, 0x88, 0x91,
  0x69, 0x74,
  0xe6, 0x88, 0x91
]);

describe('clarinet', function(){
  describe('#utf8-chunks', function() {
    it('should be able to parse utf8 characters split across data chunks', function (done){
      chunks.on("error", function (err) { done(err); });

      chunks.on("data", function (data) {
        han_test_obj += data;
      });

      chunks.on("end", function () {
        assert.equal(han_obj, han_test_obj);
        done();
      });

      chunks.write('{"thing":"');
      chunks.write(han_buffer_first);
      chunks.write(han_buffer_second);
      chunks.write(han_buffer_third);
      //chunks.write(han_buffer_full);
      chunks.write('"}');
      chunks.end();
    });
  });
});

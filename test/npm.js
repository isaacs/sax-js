var fs            = require('fs')
  , clarinet      = require('../clarinet.js')
  , parse_stream  = clarinet.createStream()
  , assert        = require('assert')
  ;

describe('clarinet', function(){
  describe('#npm', function() {
    it('should be able to parse npm', function (done){
      parse_stream.on("error", function (err) { done(err); });
      parse_stream.on("end", function () {
        assert(true, "parsing worked");
        done();
      });
      fs.createReadStream(__dirname + '/../samples/npm2.json')
        .pipe(parse_stream);
    });
  });
});
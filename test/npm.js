var fs             = require('fs')
  , clarinet       = require('../clarinet.js')
  , npm_stream     = clarinet.createStream()
  , twitter_stream = clarinet.createStream()
  , assert         = require('assert')
  ;

describe('clarinet', function(){
  describe('#npm', function() {
    it('should be able to parse npm', function (done){
      npm_stream.on("error", function (err) { done(err); });
      npm_stream.on("end", function () {
        assert.ok(true, "npm worked");
        done();
      });
      fs.createReadStream(__dirname + '/../samples/npm.json')
        .pipe(npm_stream);
    });
    it('should be able to parse twitter', function (done){
      twitter_stream.on("error", function (err) { done(err); });
      twitter_stream.on("end", function () {
        assert.ok(true, "twit worked");
        done();
      });
      fs.createReadStream(__dirname + '/../samples/twitter.json')
        .pipe(twitter_stream);
    });
  });
});
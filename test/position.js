var fs             = require('fs')
  , clarinet       = require('../clarinet.js')
  , parser         = clarinet.CParser()
  , assert         = require('assert')
  ;

var json = '{"one": [{"fish": 1}]}';

describe('clarinet', function(){
  describe('#position', function() {
    it('should be able to correctly track position', function (done){
      fs.readFile('test/sample.json', 'utf8', function (err,data) {
        if (err) {
          done(err);
        }
        parser.onend = function() {
          assert.equal(696, this.position);
        };
        parser.write(data);
        parser.close();
        done();
      });
    });
  });
});

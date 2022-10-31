//var assert = require('assert');
//var add = require('../example_function.js').add;
describe("Add example tests", function() {
  it('should return the sum of two inputs', function(done) {
    assert.equal(add(2, 3), 5);
    assert.equal(add(-2, 3), 1);
    assert.equal(add(0, 0), 0);
    assert.equal(add(-12345, -12345), -24690);
    done();
  });
});
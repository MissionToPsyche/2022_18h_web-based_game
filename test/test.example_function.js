var assert = require('assert');
var example = require('../example_function.js');

describe("Add example tests", function() {
  it('should return the sum of two inputs', function(done) {
    assert.equal(example.add(2, 3), 5);
    assert.equal(example.add(-2, 3), 1);
    assert.equal(example.add(0, 0), 0);
    assert.equal(example.add(-12345, -12345), -24690);
    done();
  });
});
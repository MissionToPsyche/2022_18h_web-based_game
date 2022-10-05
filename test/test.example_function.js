describe("add", function() {

  it("returns the sum of two inputs", function() {
    assert.equal(add(2, 3), 5);
    assert.equal(add(-2, 3), 1);
    assert.equal(add(0, 0), 0);
    assert.equal(add(-12345, -12345), -24690);
  });

});
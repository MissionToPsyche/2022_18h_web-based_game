'use-strict';

describe('Bodies tests', function() {
    let body;

    beforeEach(function() {
        var id = 'testBody';
        var mass = '100';
        var diameter = '15';
        var pos = new Phaser.Geom.Point(0, 0);
        var vel = new Phaser.Math.Vector2(0, 0);

        body = new Body(id, mass, diameter, pos, vel);
    });

    it('should be an object', function(done) {
        expect(body).to.be.a('object');
        done();
    });
});
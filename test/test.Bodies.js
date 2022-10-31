'use-strict';

describe('Body tests', function() {
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

describe('Planet tests', function() {
    let body;
    let planet;

    beforeEach(function() {
        var id = 'testBody';
        var mass = '100';
        var diameter = '15';
        var pos = new Phaser.Geom.Point(0, 0);
        var vel = new Phaser.Math.Vector2(0, 0);
        var distance = 100;

        body = new Body(id, mass, diameter, pos, vel);
        planet = new Planet(id, mass, diameter, body, distance, pos, vel);
    });

    it('should have a distance parameter', function(done) {
        expect(planet).to.have.property('distance');
        done();
    });
});

describe('Satellite tests', function() {
    let body;
    let satellite;

    beforeEach(function() {
        var id = 'testBody';
        var mass = '100';
        var diameter = '15';
        var pos = new Phaser.Geom.Point(0, 0);
        var vel = new Phaser.Math.Vector2(0, 0);
        var distance = 100;

        body = new Body(id, mass, diameter, pos, vel);
        satellite = new Satellite(id, mass, diameter, body, distance, pos, vel);
    });

    it('should have a parent parameter', function(done) {
        expect(satellite).to.have.property('parent');
        done();
    });

    it('should successfully parent to another Body', function(done) {
        expect(satellite.parent).to.be.a('object');
        done();
    });
});

describe('Probe tests', function() {
    let probe;

    beforeEach(function() {
        var id = 'testBody';
        var mass = '100';
        var diameter = '15';
        var pos = new Phaser.Geom.Point(0, 0);
        var vel = new Phaser.Math.Vector2(0, 0);

        probe = new Probe(id, mass, diameter, pos, vel);
    });

    it('should initialize at the position of the sun', function(done) {
        //todo
        done();
    });
});
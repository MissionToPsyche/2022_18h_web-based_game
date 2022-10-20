'use-strict';

const Game = require('../sketch.js');
const expect = require('chai').expect;

describe('Game tests', function() {
    let game;

    // in order to test all sketch.js functionality we must first setup an object that exposes all of its variables and functions
    beforeEach(function() {

        const G = 6.67

        let logo
        const logoPath = "img/Psyche_Icon_Color-SVG.svg"

        const spacecraftPath = "img/spacecraft.png"
        let spacecraft
        const scWidth = 400
        const scHeight = 354

        let bodies = {}
        const dataPath = "data/bodies.json"


        // key codes
        const leftArrow = 37
        const upArrow = 38
        const rightArrow = 39
        const downArrow = 40
        // zoom in in the factor of this number
        const zoom = 10
        // unit of moving when pressing a key
        const moveUnit = 20

        // the initial position of the view
        let position = {x : 0, y : 0}
        // this boolean is true when the canvas is in the initial state
        let initial = true

        game = new Game(G, logo, logoPath, spacecraftPath, spacecraft, scWidth, scHeight, bodies, dataPath,
            leftArrow, upArrow, rightArrow, downArrow, zoom, moveUnit, position, initial);
    });

    // TEST #1
    it('should be an object', function(done) {
        expect(game).to.be.a('object');
        done();
    });

    // TEST #2 we may not want to maintain a test like this as variables change and get added/removed
    it('should store initial values without mutation', function(done) {
        expect(game.G).to.be.equal(6.67);
        expect(game.logo).to.be.equal(undefined);
        expect(game.logoPath).to.be.equal('img/Psyche_Icon_Color-SVG.svg');
        expect(game.spacecraftPath).to.be.equal('img/spacecraft.png');
        expect(game.spacecraft).to.be.equal(undefined);
        expect(game.scWidth).to.be.equal(400);
        expect(game.scHeight).to.be.equal(354);
        // NOTE the use of expect().to.be.deep.equal() is required in order to compare object literals
        expect(game.bodies).to.be.deep.equal({});
        expect(game.dataPath).to.be.equal('data/bodies.json');
        expect(game.leftArrow).to.be.equal(37);
        expect(game.upArrow).to.be.equal(38);
        expect(game.rightArrow).to.be.equal(39);
        expect(game.downArrow).to.be.equal(40);
        expect(game.zoom).to.be.equal(10);
        expect(game.moveUnit).to.be.equal(20);
        expect(game.position).to.be.deep.equal({x : 0, y : 0});
        expect(game.initial).to.be.equal(true);
        done();
    });

    // TEST #3
    it('should successfully throw an error when needed', function() {
        var err = function () { game.throwError(); };
        expect(err).to.throw();
    });

    // TEST #4
    it('should handle player inputs', function() {
        //todo
    });
});
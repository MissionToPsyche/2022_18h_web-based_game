/**
 * Class representing the Phaser 'Scene', which defines our game
 * @extends Phaser.Scene
 */
class Freeplay extends Simulation {
    constructor() {
        super("Freeplay", ["earth", "moon", "psyche"], "earth");
    }
}

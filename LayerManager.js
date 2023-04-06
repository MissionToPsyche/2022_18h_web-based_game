class LayerManager {
    constructor() {
		if (this instanceof MenuManager) {
			throw Error('A static class cannot be instantiated.');
		}
	}

    static scene;
    static layers = []; //An array of layer objects

    /**
     * Sets the scene of the layer manager
     * @param {Phaser.Scene} scene 
     */
    static setScene(scene){
        this.scene = scene;
    }

    /**
     * Creates a new layer object and adds it to the array of layers.
     * @param {Phaser.GameObject} children - An array of game objects to assign to the newly created layer
     * @returns the index of the new layer in the array of layers.
     */
    static addLayer(children) {
        if (this.scene == null) {
            throw Error('Scene must be set before layer can be created');
        }
        return this.layers.push(new Phaser.GameObjects.Layer(this.scene, children)) - 1;
    }

    static addToLayer(idx, child) {
        this.layers[idx].add([child]);
        console.log(this.layers[idx]);
    }
}
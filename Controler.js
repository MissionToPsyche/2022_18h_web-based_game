/**
 * Class defining functionality for controling the probe
 */
class Controler {
    constructor (_scene, _player) {
        this.scene = _scene;
        this.player = _player;

        this.pauseKey = 'P';
        this.orbitKey = 'SHIFT';
        this.pictureKey = 'SPACE';
        this.d_up = 'UP';
        this.d_down = 'DOWN';
        this.d_left = 'LEFT';
        this.d_right = 'RIGHT';

        this.maxAcc = 0.01;
        this.APT = 0.01;
        this.yAcc = 0;
        this.xAcc = 0;
        this.rotation = 0;

        this.updateKeyEvents();
    }

    /**
     * Updates the events for all keys in controler
     */
    updateKeyEvents() {
        this.scene.input.keyboard.addKey(this.d_up, true, true);
        this.scene.input.keyboard.addKey(this.d_down, true, true);
        this.scene.input.keyboard.addKey(this.d_left, true, true);
        this.scene.input.keyboard.addKey(this.d_right, true, true);

        this.scene.input.keyboard.addKey(this.pauseKey);
        this.scene.input.keyboard.addKey(this.orbitKey);
        this.scene.input.keyboard.addKey(this.pictureKey);
        
        this.scene.input.keyboard
            .on('keydown-' + this.pauseKey, () => {
                this.scene.updatePauseColor('pressed');
            }).on('keyup-' + this.pauseKey, () => {
                // disable pause when in the taking photo page
                if (!this.scene.takingPhoto) {
                    this.scene.togglePaused();
                }
                this.scene.updatePauseColor();
            }).on('keyup-' + this.orbitKey, () => {
                this.scene.toggleOrbit();
                this.scene.updateOrbitColor(this.scene.bodies["psyche_probe"].orbitToggle ? 'on' : null);
            }).on('keyup-' + this.pictureKey, () => {
                this.scene.photoKeyEvent();
            }).on('keydown-' + this.d_up, () => {
                if (this.player.inOrbit && !this.bodies["psyche_probe"].isOrbitChanging()) {
                    this.player.addToOrbit(10);
                } else {
                    this.yAcc -= this.APT;
                    if(this.yAcc >= -this.maxAcc) { this.yAcc = -this.maxAcc }
                }
            }).on('keyup-' + this.d_up, () => {
                this.yAcc = 0;
            }).on('keydown-' + this.d_down, () => {
                if (this.player.inOrbit && !this.bodies["psyche_probe"].isOrbitChanging()) {
                    this.player.addToOrbit(-10);
                } else {
                    this.yAcc += this.APT;
                    if(this.yAcc <= this.maxAcc) { this.yAcc = this.maxAcc }
                }
            }).on('keyup-' + this.d_down, () => {
                this.yAcc = 0;
            }).on('keydown-' + this.d_left, () => {
                if (this.player.inOrbit) {
                    this.rotation -= 5;
                } else {
                    this.xAcc -= this.APT;
                    if(this.xAcc <= -this.maxAcc) { this.xAcc = -this.maxAcc }
                }
            }).on('keyup-' + this.d_left, () => {
                this.xAcc = 0;
            }).on('keydown-' + this.d_right, () => {
                if (this.player.inOrbit) {
                    this.rotation += 5;
                } else {
                    this.xAcc += this.APT;
                    if(this.xAcc >= this.maxAcc) { this.xAcc = this.maxAcc }
                }
            }).on('keyup-' + this.d_right, () => {
                this.xAcc = 0;
            });
    }

    /** 
     * toggles the use of movement keys
     */
    toggleMovementKeys() {
        this.scene.keyboard.up.enabled = !this.scene.keyboard.up.enabled;
        this.scene.keyboard.down.enabled = !this.scene.keyboard.down.enabled;
        this.scene.keyboard.left.enabled = !this.scene.keyboard.left.enabled;
        this.scene.keyboard.right.enabled = !this.scene.keyboard.right.enabled;
    }

    /**
     * Gets the acceleration from player input
     * @returns {Phaser.Math.Vector2} The acceleration vector from player input
     */
    getAccelerationVector() {
        let accVector = new Phaser.Math.Vector2(this.xAcc, this.yAcc);
        if (accVector.length() > this.maxAcc) { accVector.setLength(this.maxAcc) }
        return accVector;
    }

    /**
     * Gets the current rotation from controler input
     * @returns {number} the rotation in degrees
     */
    getRotation () {
        return this.rotation;
    }
}
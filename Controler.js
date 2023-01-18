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

        this.maxAcc = 1;
        this.APT = 1;
        this.yAcc = 0;
        this.xAcc = 0;
        this.accVector = new Phaser.Math.Vector2(0, 0);

        this.updateKeyEvents();
    }

    /**
     * Updates the events for all keys in controler
     */
    updateKeyEvents() {
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
            });
    }
}
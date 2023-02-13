/**
 * Class defining functionality for controling the probe
 */
class Controler {
    constructor (_scene, _player) {
        this.scene = _scene;
        this.player = _player;

        this.controlMethod = 0;

        this.pauseKey_setting = 'P';
        this.orbitKey_setting = 'SHIFT';
        this.pictureKey_setting = 'SPACE';
        this.d_up_setting = 'UP';
        this.d_down_setting = 'DOWN';
        this.d_left_setting = 'LEFT';
        this.d_right_setting = 'RIGHT';
        this.controlToggleKey_setting = 'C';

        this.keyboard = this.scene.input.keyboard;

        //default key settings
        this.pauseKey = this.keyboard.addKey(this.pauseKey_setting);
        this.orbitKey = this.keyboard.addKey(this.orbitKey_setting);
        this.pictureKey = this.keyboard.addKey(this.pictureKey_setting);
        this.d_up = this.keyboard.addKey(this.d_up_setting, true, true);
        this.d_down = this.keyboard.addKey(this.d_down_setting, true, true);
        this.d_left = this.keyboard.addKey(this.d_left_setting, true, true);
        this.d_right = this.keyboard.addKey(this.d_right_setting, true, true);
        this.controlToggleKey = this.keyboard.addKey(this.controlToggleKey_setting);

        this.maxAcc = 0.02;
        this.APT = 0.02;
        this.yAcc = 0;
        this.xAcc = 0;
        this.rotation = 0;
        this.totalRotation = 0;
        this.totalAcc = 0;

        this.updateKeyEvents();

        //temp just to view control changes. Remove later when we have an options menu for this.
        this.controlText = this.scene.add.text(4, 90, '0');
        this.controlText.setText("Controls: 4-Way");
        CameraManager.addUISprite(this.controlText);
    }

    /**
     * Updates the events for all keys in controler
     */
    updateKeyEvents() {
        //updating key settings in case of change
        this.pauseKey = this.keyboard.addKey(this.pauseKey_setting);
        this.orbitKey = this.keyboard.addKey(this.orbitKey_setting);
        this.pictureKey = this.keyboard.addKey(this.pictureKey_setting);

        this.d_up = this.keyboard.addKey(this.d_up_setting, true, true);
        this.d_down = this.keyboard.addKey(this.d_down_setting, true, true);
        this.d_left = this.keyboard.addKey(this.d_left_setting, true, true);
        this.d_right = this.keyboard.addKey(this.d_right_setting, true, true);
        
        this.pauseKey
            .on('down', () => {
                this.scene.updatePauseColor('pressed');
            }).on('up', () => {
                // disable pause when in the taking photo page
                if (!this.scene.takingPhoto) {
                    this.scene.togglePaused();
                }
                this.scene.updatePauseColor();
            });
        this.orbitKey
            .on('up', () => {
                this.scene.toggleOrbit();
                this.scene.updateOrbitColor(this.player.orbitToggle ? 'on' : null);
            });
        this.pictureKey
            .on('up', () => {
                this.scene.photoKeyEvent();
            });
        this.controlToggleKey
            .on('up', () => {
                if (this.controlMethod == 0) { 
                    this.controlMethod = 1;
                    this.controlText.setText("Controls: Tank in Space");
                }
                else { 
                    this.controlMethod = 0;
                    this.controlText.setText("Controls: 4-Way");
                }
            });
        this.d_up
            .on('down', () => {
                if (this.player.inOrbit && !this.player.isOrbitChanging()) {
                    this.player.addToOrbit(10);
                } else {
                    this.yAcc = -this.APT;
                    this.totalAcc = -this.APT;
                }
            }).on('up', () => {
                this.yAcc = 0;
                this.totalAcc = 0;
            });
        this.d_down
            .on('down', () => {
                if (this.player.inOrbit && !this.player.isOrbitChanging()) {
                    this.player.addToOrbit(-10);
                } else {
                    this.yAcc = this.APT;
                    this.totalAcc = this.APT;
                }
            }).on('up', () => {
                this.yAcc = 0;
                this.totalAcc = 0;
            });
        this.d_left
            .on('down', () => {
                if (this.player.inOrbit) {
                    this.rotation = -0.02;
                } else if (this.controlMethod == 1) {
                    this.rotation = -0.04;
                } else {
                    this.xAcc = -this.APT;
                }
            }).on('up', () => {
                this.xAcc = 0;
                this.rotation = 0;
            });
        this.d_right
            .on('down', () => {
                if (this.player.inOrbit) {
                    this.rotation = 0.02;
                } else if (this.controlMethod == 1) {
                    this.rotation = 0.04;
                } else {
                    this.xAcc = this.APT;
                }
            }).on('up', () => {
                this.xAcc = 0;
                this.rotation = 0;
            });
    }

    /** 
     * toggles the use of movement keys
     */
    toggleMovementKeys() {
        this.d_up.enabled = !this.d_up.enabled;
        this.d_down.enabled = !this.d_down.enabled;
        this.d_left.enabled = !this.d_left.enabled;
        this.d_right.enabled = !this.d_right.enabled;
    }

    /**
     * Gets the acceleration from player input
     * @returns {Phaser.Math.Vector2} The acceleration vector from player input
     */
    getAccelerationVector() {
        if (this.controlMethod == 1 ) {
            let accVector = new Phaser.Math.Vector2(1, 1).setLength(this.totalAcc).rotate(Phaser.Math.Angle.Wrap(this.totalRotation));
            return accVector;
        } else {
            let accVector = new Phaser.Math.Vector2(this.xAcc, this.yAcc);
            if (accVector.length() > this.maxAcc) { accVector.setLength(this.maxAcc) }
            return accVector;
        }
    }

    /**
     * Gets the control method currently being used by the game controler.
     * @returns {number} number representing control method.
     */
    getControlMethod() {
        return this.controlMethod
    }

    /**
     * Gets the current rotation from controler input
     * @returns {number} the rotation in degrees
     */
    getRotation () {
        this.totalRotation = this.totalRotation + this.rotation;
        if (this.controlMethod == 1 && !this.player.inOrbit){
            return this.totalRotation;
        } else {
            return this.rotation;
        }
    }
}
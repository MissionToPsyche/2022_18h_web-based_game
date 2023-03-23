class MenuManager {
	constructor() {
		if (this instanceof MenuManager) {
			throw Error('A static class cannot be instantiated.');
		}
	}

	static restartButtonListener(_scene, _button) {
		_button.id.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                _button.id.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                _button.id.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                _button.id.setTint(0xF47D33);
                _button.menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                _button.id.setTint(0xFFFFFF);
                _scene.ingame_music.stop();
                _scene.scene.restart();
                _scene.paused = false
                _scene.gameOver = false;
                // Make the direction icon show up again.
                _scene.direction = undefined;
            });
	}

	static exitButtonListener(_scene, _button) {
		_button.id.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                _button.id.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                _button.id.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                _button.id.setTint(0xF47D33);
                _button.menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                _button.id.setTint(0xFFFFFF);
                _scene.ingame_music.stop();
                _scene.scene.start('MainMenu');
                _scene.paused = false;
                _scene.gameOver = false;
            });
	}

    static playButtonListener(_scene, _button) {
        _button.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.updatePauseColor(_scene, 'hover');
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.updatePauseColor(_scene);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.updatePauseColor(_scene, 'pressed');
                if (!_scene.gameOver) {
                    var menu_audio = _scene.sound.add('menu');
                    menu_audio.play();
                }
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                // disable pause when in the taking photo page
                if (!_scene.takingPhoto) {
                    this.updatePauseColor(_scene);
                    _scene.togglePaused();
                }
            });
    }

    static pauseButtonListener(_scene, _button) {
        _button.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.updatePauseColor(_scene, 'hover');
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.updatePauseColor(_scene);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                this.updatePauseColor(_scene, 'pressed');
                if (!_scene.gameOver) {
                    var menu_audio = _scene.sound.add('menu');
                    menu_audio.play();
                }
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                // disable pause when in the taking photo page
                if (!_scene.takingPhoto) {
                    this.updatePauseColor(_scene);
                    _scene.togglePaused();
                }
            });
    }

    static testListener(_button) {
        _button.id.setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                _button.id.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                _button.id.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                _button.id.setTint(0xF47D33);
                _button.menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                _button.id.setTint(0xFFFFFF);
            });
    }
    /**
     * updates the color of the pause and play buttons based on the given state of the button
     * @param {string} state The state of the button. Can be: hover, pressed or no value for default color
     */
    static updatePauseColor(_scene, _state) {
        switch (_state) {
            case 'hover':
                _scene.pauseButton.setTint(0xF9A000);
                _scene.playButton.setTint(0xF9A000);
                break;
            case 'pressed':
                _scene.pauseButton.setTint(0xF47D33);
                _scene.playButton.setTint(0xF47D33);
                break;
            default:
                _scene.pauseButton.setTint(0xFFFFFF);
                _scene.playButton.setTint(0xFFFFFF);
        }
    }
}
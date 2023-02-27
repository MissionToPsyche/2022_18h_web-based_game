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
                _button.exitButton.setTint(0xF9A000);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                _button.exitButton.setTint(0xFFFFFF);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                _button.exitButton.setTint(0xF47D33);
                menu_audio.play();
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
                _button.exitButton.setTint(0xFFFFFF);
                _scene.ingame_music.stop();
                _scene.scene.start('MainMenu');
                _scene.paused = false;
                _scene.gameOver = false;
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
}
class Button extends Phaser.GameObjects.Sprite {
	constructor(_scene, _pos, _id, _text, _frame) {
		super(_scene, _pos.x, _pos.y, _id, _frame);

		this.actionKey = '';
		this.id = _scene.add.sprite(_pos.x, _pos.y, 'button').setOrigin(0.5).setScale(0.5).setVisible(0);
		this.text = _scene.add.text(_pos.x, _pos.y, _text, { fontSize: '26px', color: '#000000' }).setOrigin(0.5).setVisible(0);
		CameraManager.addUISprite(this.id);
		CameraManager.addUISprite(this.text);
	}

	setText(_text) {
		this.text.setText(_text);
	}

	setKey(_listener) {

	}

	setAction(_action) {
		this.setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
            this.id.setTint(0xF9A000);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
            this.id.setTint(0xFFFFFF);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            this.id.setTint(0xF47D33);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
            this.id.setTint(0xFFFFFF);
        });
	}

	setPosition(_pos) {
		//this.x = _pos.x;
		//this.y = _pos.y;
	}

	getElements() {
		return [this.id, this.text];
	}
}
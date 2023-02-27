class Button extends Phaser.GameObjects.Sprite {
	constructor(_scene, _pos, _id, _text, _frame) {
		super(_scene, _pos.x, _pos.y, _id, _frame);

		this.actionKey = '';
		this.id = _scene.add.image(_pos.x, _pos.y, _id)
			.setOrigin(0.5)
			.setScale(0.5)
			.setDepth(100)
			.setVisible(0);
		this.text = _scene.add.text(_pos.x, _pos.y, _text, { fontSize: '26px', color: '#000000' })
			.setOrigin(0.5)
			.setDepth(100)
			.setVisible(0);
		this.menu_audio = _scene.sound.add('menu');
		//MenuManager.testListener(this);
		//MenuManager.restartButtonListener(_scene, this);
	}

	setText(_text) {
		this.text.setText(_text);
	}

	setKey(_listener) {

	}

	setPosition(_pos) {
		//this.x = _pos.x;
		//this.y = _pos.y;
	}

	setDepth(_depth) {
		this.id = _depth;
		this.text = _depth + 1;
	}

	getButton() {
		return this.id;
	}

	getText() {
		return this.text;
	}

	getElements() {
		return [this.id, this.text];
	}
}
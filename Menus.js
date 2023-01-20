class Menu {
	constructor(_scene) {
		this.scene = _scene;
		this.elements = [];
	}

	addElement(_element) {
		_element.setVisible(false);
		this.elements.push(_element);
		CameraManager.addUISprite(_element);
	}

	removeElement(_element) {
		// remove the specified element from this menu
	}

	moveElement(_element, _scale, _y, _delay, _duration, _ease) {
		// move the element
	}

	toggleMenu() {
		// set all elements in this menu to visible
		this.elements.forEach(function (element) {
			if (element.visible) {
				element.setVisible(false);
			} else {
				element.setVisible(true);
			}
		});
	}
}
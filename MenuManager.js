class MenuManager {
	constructor() {
		if (this instanceof MenuManager) {
			throw Error('A static class cannot be instantiated.');
		}
	}

	// class properties
	static menus = [];

	static addMenu(_menu) {
		this.menus.push(_menu);
	}

}
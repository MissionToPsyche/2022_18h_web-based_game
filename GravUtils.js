const G = 6.67

//basic calculation for gravity. b1 and b2 are the two bodies involved.
//R is the radius between the two
function calcGravity (m1, m2, r) {
	// this is Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
	return G * (m1 * m2) / (r * r);
}

//calculates the gravitational acceleration on a mass based on force
function gaussLaw (f, m1) {
    var g = new Phaser.Math.Vector2(f.x/m1, f.y/m1);
	return g;
}

/*****************************
GravUtils
- An object prototype containing various util funcitons for gravity 
*****************************/
class GravUtils {
	constructor() {
		if (this instanceof GravUtils) {
			//This is a static object, and the constructor should not be called
			throw Error('This is a static class')
		}
	}

	//basic calculation for gravity. b1 and b2 are the two bodies involved.
	//R is the radius between the two
	static calcGravity (m1, m2, r) {
		// this is Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
		return G * (m1 * m2) / (r * r);
	}

	//calculates the gravitational acceleration on a mass based on force
	static gaussLaw (f, m1) {
		return createVector(f.x/m1, f.y/m1)
	}
}
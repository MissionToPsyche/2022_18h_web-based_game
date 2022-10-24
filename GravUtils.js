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
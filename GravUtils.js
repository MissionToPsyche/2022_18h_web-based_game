const G = 6.674

/**
 * Basic calculation for gravity
 * Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
 * @param {number} m1 - The mass of the first body involved in this calculation
 * @param {number} m2 - The mass of the second body involved in this calculatiom
 * @param {number} r - The radius between these two bodies
 * @return {number} the gravity to be applied
 */
function calcGravity (m1, m2, r) {
	return (G * (m1 * m2)) / (r * r);
}

/**
 * Calculates the gravitational acceleration on a mass based on force
 * @param {Phaser.Math.Vector2} f - Force vector
 * @param {number} m1 - The mass to apply force to
 * @return {Phaser.Math.Vector2} Gauss's law calculated on the input mass and force
 */
function gaussLaw (f, m1) {
    var g = new Phaser.Math.Vector2(f.x/m1, f.y/m1);
	return g;
}

/**
 * Calculate the orbit velocity of a satellite around its parent body
 * @param {Body} satellite - The orbiting satellite
 * @param {Body} parent - The satellite's parent body
 * @param {number} angle - The satellite's current angle
 * @return {Phaser.Math.Vector2} desired orbit velocity for the given satellite around its parent
 */
function orbitVelocity(satellite, parent, angle) {
	var p1 = new Phaser.Geom.Point(satellite.x, satellite.y);
	var p2 = new Phaser.Geom.Point(parent.x, parent.y);
	var r = Phaser.Math.Distance.BetweenPoints(p1, p2);
	var v = Math.sqrt((G * parent.mass) / r);
	var final = new Phaser.Math.Vector2(r * Math.cos(angle), r * Math.sin(angle));

	final.rotate(Phaser.Math.TAU);
	final.setLength(v);
	final.add(parent.vel);

	return final;
}
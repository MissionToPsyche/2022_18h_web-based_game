const G = 6.674

/**
 * Basic calculation for gravity
 * Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
 * @param {m1} The first body involved in this calculation
 * @param {m2} The second body involved in this calculatiom
 * @param {r} The radius between these two bodies
 */
function calcGravity (m1, m2, r) {
	return (G * (m1 * m2)) / (r * r);
}

/**
 * Calculates the gravitational acceleration on a mass based on force
 * @param {f} Force vector
 * @param {m1} The mass to apply force to
 */
function gaussLaw (f, m1) {
    var g = new Phaser.Math.Vector2(f.x/m1, f.y/m1);
	return g;
}

/**
 * Calculate the orbit velocity of a satellite around its parent body
 * @param {satellite} The orbiting satellite
 * @param {parent} The satellite's parent body
 * @param {angle} The satellite's current angle
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
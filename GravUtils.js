const G = 6.674

//basic calculation for gravity. b1 and b2 are the two bodies involved.
//R is the radius between the two
function calcGravity (m1, m2, r) {
	// this is Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
	return (G * (m1 * m2)) / (r * r);
}

//calculates the gravitational acceleration on a mass based on force
function gaussLaw (f, m1) {
    var g = new Phaser.Math.Vector2(f.x/m1, f.y/m1);
	return g;
}

function orbitVelocity(satellite, parent, angle) {
	var p1 = new Phaser.Geom.Point(satellite.x, satellite.y);
	var p2 = new Phaser.Geom.Point(parent.x, parent.y);
	var r = Phaser.Math.Distance.BetweenPoints(p1, p2);
	var v = Math.sqrt((G * parent.mass) / r);

	if(angle != null){
		Math.atan2(p2.y - p1.y, p2.x - p1.x);
	}

	var final = new Phaser.Math.Vector2(r * Math.cos(angle), r * Math.sin(angle));

	final.rotate(Phaser.Math.TAU);
	final.setLength(v);
	final.add(parent.vel);

	return final;
}

//max min optional
function lockOrbit(sat, parent, max, min) {
	//calculate intended next position
	var nextx = sat.x + sat.vel.x;
	var nexty = sat.y + sat.vel.y;

	//if intended next position deviates from body's orbit radius, 
	//adjust current velocity so that the next position is within orbit radius
	var nextPos = new Phaser.Geom.Point(nextx, nexty);
	var parPos = new Phaser.Geom.Point(parent.x, parent.y);
	var r = Phaser.Math.Distance.BetweenPoints(nextPos, parPos);

	if (!max) {
		max = sat.distance;
	} if (!min) {
		min = sat.distance;
	}

	if (r > max) {
		const correction = new Phaser.Math.Vector2(0, 0).copy(parPos).subtract(nextPos).setLength(r - max);
		sat.vel.add(correction);
	} else if (r < min) {
		const correction = new Phaser.Math.Vector2(0, 0).copy(parPos).subtract(nextPos).setLength(r - min);
		sat.vel.add(correction);
	}
	return 0;
}

/*
 * A funciton that derives the componate of
 * a vector in the direction of annother vector
 * v1 = the vector whos componate vector you'd like to derive
 * v2 = the vector that gives the direction you'd like to derive from v1
 * returns the length/magnitude of the componate of v1 in the direction of v2
 */
function covindov(v1, v2) {
	return v1.dot(v2)/v2.length();
}
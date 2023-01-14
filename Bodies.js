/**
 * Class representing a Body
 * Defines the functionality for celestial bodies in the simulation
 * @extends Phaser.GameObjects.Sprite
 */
class Body extends Phaser.GameObjects.Sprite {

	/**
	 * Represents a celestial body
	 * @constructor
	 * @param {Phaser.Scene} _scene - The Scene this Body will be added to
	 * @param {Phaser.Geom.Point} _pos - The starting position of this body
	 * @param {string} _id - The id of this Body
	 * @param {number} _mass - The mass of this Body
	 * @param {number} _diameter - The diameter of this Body
	 * @param {Phaser.Textures.Frame} _frame - The frame this Body will be added to
	 */
	constructor (_scene, _pos, _id, _mass, _diameter, _frame) {
		super(_scene, _pos.x, _pos.y, _id, _frame);
		this.id = _id
		this.mass = _mass
		this.vel = new Phaser.Math.Vector2(0, 0)
		this.r = _diameter / 2
		this.listeners = []
		this.listenRadius = 10 + this.r
		this.collided = false;

		this.setDisplaySize(this.r * 2, this.r * 2)
			.setSize(this.r * 2, this.r *2);
	}

	/** Cause this body to orbit its parent if one exists and affect position by calculated velocity */
	updatePosition(scene) {
		if (this.parent != null) {
			this.orbit(this.parent)
		}

		this.x += this.vel.x;
		this.y += this.vel.y;
	}

	/** calculate velocity based off of force applied */
	force(f) {
		this.vel.add(gaussLaw(f, this.mass));
	}

	//begining of implementation of observer pattern to notify probes when close enough to annother body

	/** add body to array of bodies that may be affected by dynamic gravity */
	subscribe(listener) {
		this.listeners.push(listener)
	}

	/** remove body from array of bodies that may be affected by dynamic gravity */
	unsubscribe(listener) {
		//yes, this is how you remove a specific array item in js. Yes, it's overly complicated.
		this.listeners = this.listeners.filter(body => body.id != listener.id)
	}

	/** notify all subscribed listening bodies */
	notify() {
		if (!this.listeners) {
			return
		}

		this.listeners.forEach(function (listener) {
			//calculate radius from origin (this body) to lister
			var p1 = new Phaser.Geom.Point(this.x, this.y);
			var p2 = new Phaser.Geom.Point(listener.x, listener.y);
			const r = Phaser.Math.Distance.BetweenPoints(p1, p2);

			//check if lister is within listen radius
			//also check if it's not within the planet so the probe isn't flung out of existance.
			if (r <= this.listenRadius && r > this.r) {
				//create vector f in direction of the listening body
                const f = new Phaser.Math.Vector2(this.x - listener.x, this.y - listener.y);
				//set direction vector to the length of the force applied by gravity between
				//the two bodies, resulting in the force vector between the two bodies
				f.setLength(calcGravity(listener.mass, this.mass, r));
				//inform the listener of the force.
				listener.update(f);
			} else if (r <= this.r && this.collided == false) { //detect a collision

				//debug, this info will be useful later
				console.log(listener.id + " collided with " + this.id + "!");
				console.log(listener.id + " horizontal velocity: " + Math.abs(listener.vel.x));
				console.log(listener.id + " vertical velocity:   " + Math.abs(listener.vel.y));

				//cause the probe to bounce
				//listener.vel.x *= -1;
				//listener.vel.y *= -1;

				listener.collided = true;
				this.collided = true;
			}
		}.bind(this));
	}

	/** apply force from body subscribed to */
	update(f) {
		//NOTE** Might want to merge this function with this.force(f) at some point
		this.vel.add(gaussLaw(f, this.mass).scale(0.1)); //TEMP divide by 2 'cause gravity too stronk
	}
}

/**
 * Class representing a Satellite
 * Defines the functionality for a planet that orbit around the sun
 * @extends Body
 */
class Satellite extends Body {

	/**
	 * Represents a satellite, a type of body in the game that orbits around another body
	 * @constructor
	 * @param {Phaser.Scene} _scene - The Scene this Satellite will be added to
	 * @param {string} _id - The id of this Satellite
	 * @param {number} _mass - The mass of this Satellite
	 * @param {number} _diameter - The diameter of this Satellite
	 * @param {Body} _parent - The parent Body for this Satellite
	 * @param {number} _angle - The initial angle of the Satellite
	 * @param {number} _distance - The distance between the Satellite and its parent Body
	 * @param {Phaser.Textures.Frame} - The Frame this Satellite will be added to
	 */
	constructor (_scene, _id, _mass, _diameter, _parent, _angle, _distance, _frame) {
		super(_scene, CameraManager.getCenter(), _id, _mass, _diameter, _frame);
		this.scene = _scene;
		this.distance = _distance;
		this.path = [];
		this.angle = _angle;
		if (!this.angle) {
			this.angle = 0;
		}

		if (_parent != null) {
			this.parent = _parent;
			this.x = this.parent.x;
			this.y = this.parent.y;
		}

		this.x = this.x + this.distance * Math.cos(this.angle);
		this.y = this.y + this.distance * Math.sin(this.angle);

		if (this.parent != null) {
			this.vel = orbitVelocity(this, this.parent, this.angle)
		}
	}

	/**
	 * Return points on path as a curve
	 * @return {Phaser.Curves.Spline} Points on the path of this satellite
	 */
	getPathCurve () {
		return new Phaser.Curves.Spline(this.path);
	}

	/** Add the current onscreen position into `this.path` */
	updatePosition(scene) {
		super.updatePosition(scene)

		this.path.push(new Phaser.Math.Vector2(this.x, this.y));
		if (this.path.length > Math.min(this.mass * 10, (this.distance * Phaser.Math.PI2)/2)) {
			this.path.splice(0, 1)
		}
	}

	/**
	 * Use Newton's law of Universal Gravitation to apply force to this Satellite and cause it to orbit
	 * its parent
	 */
	orbit(parent) {
		var p1 = new Phaser.Geom.Point(this.x, this.y);
		var p2 = new Phaser.Geom.Point(parent.x, parent.y);
		const r = Phaser.Math.Distance.BetweenPoints(p1, p2)
		const f = new Phaser.Math.Vector2(0, 0).copy(p2).subtract(p1)

		// this is Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
		// we use it here to calculate the force `parent` applies
		f.setLength(calcGravity(this.mass, parent.mass, r));

		// and apply it
		this.force(f)
	}
}

/**
 * Class representing a Moon
 * Defines the functionality for a moon that orbit around a planet
 * @extends Body
 */
class Moon extends Body {
	/**
	 * Represents a moon, a type of body in the game that orbits around another body
	 * @constructor
	 * @param {Phaser.Scene} _scene - The Scene this Moon will be added to
	 * @param {string} _id - The id of this Moon
	 * @param {number} _mass - The mass of this Moon
	 * @param {number} _diameter - The diameter of this Moon
	 * @param {Body} _parent - The parent Body for this Moon
	 * @param {number} _angle - The initial angle of the Moon
	 * @param {number} _distance - The distance between the Moon and its parent Body
	 * @param {Phaser.Textures.Frame} - The Frame this Moon will be added to
	 */
	constructor (_scene, _id, _mass, _diameter, _parent, _angle, _distance, _frame) {
		super(_scene, CameraManager.getCenter(), _id, _mass, _diameter, _frame);
		this.scene = _scene
		this.parent = _parent;
		this.distance = _distance;
		this.path = [];
		this.theta = _angle;
		this.deltaTheta = 0.15;

		if (this.parent != null) {
			this.parent = _parent;
		}
		// copy parent's position
		if (typeof(this.parent.pos) != "undefined" && this.parent.pos.x != 0) {
			this.x = this.parent.x + this.distance * Math.cos(this.theta);
			this.y = this.parent.y + this.distance * Math.sin(this.theta);
		}
	}

	/**
	 * return points on path as a curve
	 * @return {Phaser.Curves.Spline} Points on the path of this moon
	 */

	getPathCurve () {
		return new Phaser.Curves.Spline(this.path);
	}

	/** Add the current onscreen position into `this.path` */
	updatePosition(scene) {
		if (typeof(this.parent) != "undefined" && this.parent.x != 0) {
			this.theta += this.deltaTheta;
			this.x = this.parent.x + this.distance * Math.cos(this.theta);
			this.y = this.parent.y + this.distance * Math.sin(this.theta);
		}

		this.path.push(new Phaser.Math.Vector2(this.x, this.y));
		if (this.path.length > Math.min(this.mass * 10, (this.distance * Phaser.Math.PI2)/2)) {
			this.path.splice(0, 1)
		}
	}
}

/**
 * Class representing a Probe
 * Defines the functionality for a spacecraft
 * @extends Body
 */
class Probe extends Body {

	/**
	 * Represents a probe, a type of body that the player can control
	 * @constructor
	 * @param {Phaser.Scene} _scene - The Scene this probe will be added to
	 * @param {string} _id - The id of this probe
	 * @param {number} _mass - The mass of this probe
	 * @param {number} _diameter - The diameter of this probe
	 * @param {Phaser.Textures.Frame} - The Frame this probe will be added to
	 */
	constructor (_scene, _id, _mass, _diameter, _frame) {
		super(_scene, CameraManager.getCenter(), _id, _mass, _diameter, _frame)
		this.orbitToggle = false; //TO DO: REMOVE WHEN DONE TESTING GRAVITY

		//deploy the probe near earth so that it doesn't immediately collide
		this.x = this.scene.bodies["earth"].x - 35;
		this.y = this.scene.bodies["earth"].y;
	}

	/** Update the position of this probe */
    update (f) {
        //toggle for gravity
		//NOTE: FOR TESTING ONLY.
		if (!this.orbitToggle) {
			return
		}

        super.update(f);
    }

    /**
     * Get the distance from the probe to a body
     * @param {string} the id of the body
     * @return {number} the distance between the probe and a body
     */
    getDistance(bodyId) {
    	if (typeof(this.scene.bodies[bodyId].x) == undefined) {
    		return -1;
    	} else {
    		let bodyX = this.scene.bodies[bodyId].x;
    		let bodyY = this.scene.bodies[bodyId].y;
    		return Math.sqrt((this.x - bodyX) * (this.x - bodyX) + (this.y - bodyY) * (this.y - bodyY));
    	}

    }

    /**
     * Get the distance from this probe to psyche
     * @return {number} The distance between this probe and psyche
     */
    getPsycheDistance() {
    	let psycheX = this.scene.bodies["psyche"].x;
    	let psycheY = this.scene.bodies["psyche"].y;
    	return Math.sqrt((this.x - psycheX) * (this.x - psycheX) + (this.y - psycheY) * (this.y - psycheY));
    }

    /**
     * Get the horizontal distance between the probe and psyche
     * @return {number} the horizontal distancee between the probe and psyche
     */
    getPsycheDirectionX() {
    	let psycheX = this.scene.bodies["psyche"].x;
    	return (psycheX - this.x) / this.getPsycheDistance();
    }

    /**
     * Get the vertical distance between the probe and psyche
     * @return {number} The vertical distance between the probe and psyche
     */
    getPsycheDirectionY() {
    	let psycheY = this.scene.bodies["psyche"].y;
    	return (psycheY - this.y) / this.getPsycheDistance();
    }

    /**
     * Check if a body is in the view of the probe.
     * @param {string} the index of the body
     * @param {number} radius of the view
     * @param {number} start rotation of the view in radius
     * @param {number} end rotation of the view in radius
     * @return {boolean}
     */
    isInView(idx, r, startRotation, endRotation) {
    	let targetX = this.scene.bodies[idx].x;
    	let targetY = this.scene.bodies[idx].y;
    	let distance = Math.sqrt((this.x - targetX) * (this.x - targetX) + (this.y - targetY) * (this.y - targetY));
    	
    	// check if target body is too far
    	if (distance > r) {
    		return false;
    	}

    	// get the angle of the target body
    	let targetCos = (targetX - this.x) / distance;
    	let targetSin = (targetY - this.y) / distance;
    	let angle = Math.acos(targetCos);
    	if (targetSin < 0) {
    		angle = Math.PI * 2 - angle;
    	}

    	// check if angle is in the startRotation end Rotation range
    	if (endRotation < (Math.PI * 3 / 2)) {
    		// startRotation endRotation range is [endRotation, startRotation]
    		return (angle >= endRotation) && (angle <= startRotation);
    	} else {
    		// range is [endRotation, 2pi] union [0, startRotation]
    		return (angle >= endRotation) || (angle <= startRotation);
    	}
    }


}

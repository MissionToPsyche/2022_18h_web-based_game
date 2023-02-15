const OCR = 500;

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
	 * @param {string} _icon - the name of this body's minimap Icon
	 */
	constructor (_scene, _pos, _id, _mass, _diameter, _frame, _icon) {
		super(_scene, _pos.x, _pos.y, _id, _frame);
		if (_icon != null) {
			this.minimap_icon = new Phaser.GameObjects.Sprite(_scene, _pos.x, _pos.y, _icon, _frame);
		} else {
			this.minimap_icon = new Phaser.GameObjects.Sprite(_scene, _pos.x, _pos.y, _id, _frame);
		}

		this.id = _id
		this.mass = _mass
		this.vel = new Phaser.Math.Vector2(0, 0)
		this.r = _diameter / 2
		this.listeners = []
		this.listenRadius = this.r + this.r * 5;
		//this.listenRadius = 10 + this.r

		var md = Math.pow(this.r, 1 / 2) * 75;
		this.collided = false;

		this.setDisplaySize(this.r * 2, this.r * 2)
			.setSize(this.r * 2, this.r *2);
		this.minimap_icon.setDisplaySize(md, md)
			.setSize(md, md);

		//add the body and the minimap sprite to the scene:
		_scene.add.existing(this);
		_scene.add.existing(this.minimap_icon);
		//add them to respective cameras for proper occlusion
		CameraManager.addGameSprite(this);
		CameraManager.addMinimapSprite(this.minimap_icon);
	}

	/**
	 * Updates the position of the body by the body's
	 * velocity.
	 */
	updatePosition() {
		// affect position by calculated velocity
		this.x += this.vel.x;
		this.y += this.vel.y;
		//update minimap_icon
		this.minimap_icon.x = this.x;
		this.minimap_icon.y = this.y;
	}

	/** 
	 * Applies the accelleration from a given force
	 * to the body's velocity.
	 * @param {Phaser.Math.Vector2} f - The applied force
	 */
	force(f) {
		this.vel.add(gaussLaw(f, this.mass));
	}

	//---begining of implementation of observer pattern to notify probes when close enough to annother body---

	/**
	 * add body array of listeners for the dynamic gravity system.
	 * @param {Body} listener - The Body to be added to listeners
	 */
	subscribe(listener) {
		this.listeners.push(listener)
	}

	/**
	 * remove body from array of listeners for the dynamic gravity system.
	 * @param {Body} listener - The listening Body to be removed
	 */
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

	/** 
	 * Applies the accelleration to the body from the force exerted on it
	 * by one of the body's listeners.
	 * @param {Phaser.Math.Vector2} f - The applied force
	 */
	update(f) {
		//NOTE** Might want to merge this function with this.force(f) at some point
		this.vel.add(gaussLaw(f, this.mass).scale(0.1)); //TEMP scale 'cause gravity too stronk
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
		this.theta = _angle;
		if (!this.theta) {
			this.theta = 0;
		}

		if (_parent != null) {
			this.parent = _parent;
		}

		if (typeof(this.parent) != "undefined" && this.parent.x != 0) {
			this.x = this.parent.x + this.distance * Math.cos(this.theta);
			this.y = this.parent.y + this.distance * Math.sin(this.theta);
			this.vel = orbitVelocity(this, this.parent, this.theta); //set initial orbit velocity.
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
	updatePosition() {
		super.updatePosition()
		if (this.parent != null) {
			this.orbit(this.parent);
			lockOrbit(this, this.parent);
		}

		this.path.push(new Phaser.Math.Vector2(this.x, this.y));
		if (this.path.length > Math.min(Math.pow(this.mass, 1/4) * 600, (this.distance * Phaser.Math.PI2)/2)) {
			this.path.splice(0, 1)
		}
	}

	/**
	 * Use Newton's law of Universal Gravitation to apply force to this Satellite and cause it to orbit
	 * its parent
	 * @param {Body} parent - the body for the satellite to orbit.
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
		super(_scene, CameraManager.getCenter(), _id, _mass, _diameter, _frame, _id + "_icon");
		// the initial state of gravity system
		// if the gravify is on at the beginning of the game, the Probe will have a 
		// initial velocity when starting from the earth
		this.gravityToggle = true; //TO DO: REMOVE WHEN DONE TESTING GRAVITY
		this.inOrbit = true; //when true, indicates that probe is orbiting a planet
		this.orbitToggle = true; //when true, starts the orbit lock on process
		this.rotation = 0;

		this.foos = 1; //fraction of orbit speed
		this.orbitChangeCounter = 0;
		this.orbitCounter = 0;

		this.maxOrbit = 40; //TO DO: find better system for determining min/max orbit
		this.minOrbit = 40;
		this.currentOrbit = 40;
		this.newOrbit = 40;
		
		this.orbitTarget = this.scene.bodies["earth"]; //the target of the probe's orbit.

		//overload minimap display size
		this.minimap_icon.setDisplaySize(this.r * 200, this.r * 200)
			.setSize(this.r * 200, this.r * 200);

		//set camera zoom for initial state
		var totalSize = (this.currentOrbit * 2 + this.r * 2 ) * 1.1;
		CameraManager.zoomToSize(totalSize);

		//deploy the probe near earth so that it doesn't immediately collide
		this.x = this.scene.bodies["earth"].x - 35;
		this.y = this.scene.bodies["earth"].y;
	}

	/**
	 * Updates the position of the body by the body's
	 * velocity. Also adjusts the position of the probe
	 * Based on the probe's orbit lock if applicatble.
	 */
	updatePosition () {
		//checking if orbit lock is enabled
		if (this.inOrbit) {
			lockOrbit(this, this.orbitTarget, this.currentOrbit);

			//slowly bring probe up to orbit velocity
			//TO DO: Test this properly. I'm not 100% on if it all works

			//calculate current fraction of orbit velocity.
			//this is so that the probe can gain the velocity necissary
			//to maintain a proper orbit smoothly rather than all at once.
			var orbitVel = orbitVelocity(this, this.orbitTarget);
			this.foos = covindov(this.vel, orbitVel) / orbitVel.length();
			if (this.foos < 1) {
				var ovf = new Phaser.Math.Vector2(orbitVel.x, orbitVel.y).setLength(orbitVel.length()/500);

				this.vel.add(ovf);
				//console.log(ovf.x + ", " + ovf.y);
			}

			//if orbit was changed, slowly bring the current orbit to the new orbit
			if (this.orbitChangeCounter > 0) {
				//get the difference between the two orbits:
				var diff = this.newOrbit - this.currentOrbit;
				//add portion of diff to current orbit.
			    this.currentOrbit += diff/this.orbitChangeCounter;
				this.orbitChangeCounter -= 1;
			}

			
		}
		super.updatePosition();
	}

	/** 
	 * Applies the accelleration to the body from the force exerted on it
	 * by one of the probe's listeners.
	 * @param {Phaser.Math.Vector2} f - The applied force
	 */
	 update (f) {
        //toggle for gravity
		//NOTE: FOR TESTING ONLY.
		if (!this.gravityToggle) {
			return
		}

        super.update(f);
    }

	/**
	 * Starts the process of the probe locking onto a body.
	 * The probe polls all bodies in the given scene and chooses
	 * the closest one in range, then enters the maintaining state.
	 * @param {Phaser.Scene} scene - the scene the probe searches bodies in.
	 */
	startOrbitLock(scene) {
		//poll all planets and get closest planet within range (determined by max orbit)
		console.log("Starting Orbit Lock")
		var parent;
		var pr = 2000;
		var p1;
		var p2;
		var r = 0;
		for (const scenebody in scene.bodies) {
			var body = scene.bodies[scenebody]
			if(!scene.cameras.main.worldView.contains(body.x, body.y)) {
				continue; //if body isn't on screen, don't bother checking.
			} else if (body == this) {
				continue; //if body is this probe, don't consider it.
			} else {
				console.log(body.id + " On screen!");
			}
			p1 = new Phaser.Geom.Point(this.x, this.y);
			p2 = new Phaser.Geom.Point(body.x, body.y);
			r = Phaser.Math.Distance.BetweenPoints(p1, p2);

			if (r < (pr + body.r)) {
				parent = body;
				pr = r - body.r;
			}
		}

		if (parent != null) {
			console.log("Lock Success!")
			console.log(parent)
			//set orbit target and enable orbit lock for second stage
			this.orbitTarget = parent;
			this.orbitToggle = true;
		} else {
			console.log("Lock Fail...")
		}
	}

	/**
	 * Ends or cancels the probe's orbit lock, returning
	 * the probe to a non-orbit state.
	 */
	stopOrbitLock() {
		this.inOrbit = false;
		this.orbitToggle = false;
		this.orbitCounter = OCR;
		CameraManager.changeCamTarget(this);
		CameraManager.returnToSetZoom();
		return;
	}

	/**
	 * While the probe is in the between state of
	 * finding a lock target but not having completed
	 * the lock, checks ensure that the probe is still
	 * close enough to the target for it to lock on.
	 * If the probe maintains distance for long enough,
	 * the probe enters its locked on state.
	 */
	maintainOrbit(scene, indicator, progress) {
		console.log("Maintaining Lock...")
		var p1 = new Phaser.Geom.Point(this.x, this.y);
		var p2 = new Phaser.Geom.Point(this.orbitTarget.x, this.orbitTarget.y);
		var r = Phaser.Math.Distance.BetweenPoints(p1, p2);
		if (this.orbitCounter <= 0) {
			//if timer is up, orbitlock is successful
			this.inOrbit = true;
			this.currentOrbit = this.orbitTarget.r + r;
			CameraManager.changeCamTarget(this.orbitTarget);
			this.setOrbitRadius (this.orbitTarget.r);
			console.log("Maintaining Lock success!");
			return;
		} else if (!scene.cameras.main.worldView.contains(this.orbitTarget.x, this.orbitTarget.y)) {
			//if orbit target isn't on screen, break lock
			this.stopOrbitLock();
			return;
		}

		this.orbitCounter -= 1;

		return 1 - this.orbitCounter/OCR;
	}

	/**
	 * Sets a new orbit radius for the probe to travel
	 * @param {number} radius - the new orbit radius
	 * @param {number} [duration=1000] - how long it should take to change the radius
	 */
	setOrbitRadius(radius, duration) {
		if (!duration) {
			duration = 150;
		} else {
			duration /= 6.66;
		}
		this.newOrbit = this.orbitTarget.r + radius;
		if (this.newOrbit < this.orbitTarget.r) {
			this.newOrbit = this.orbitTarget.r;
		}
		this.orbitChangeCounter = duration;
		//change zoom level so that planet and probe are visable
		var totalSize = (this.newOrbit * 2 + this.r * 2 ) * 1.1;
		CameraManager.zoomToSize(totalSize);
	}

	/**
	 * Adds given value to the radius of the current orbit
	 * @param {number} add number to add to current orbit
	 */
	addToOrbit(add) {
		this.setOrbitRadius(this.currentOrbit + add - this.orbitTarget.r);
	}

	/**
	 * Checks whether or not the probe is changing it's orbit
	 * @returns {boolean} the status of the changing orbit
	 */
	isOrbitChanging() {
		return this.orbitChangeCounter > 0;
	}

	/**
	 * Creates a circular path with a radius of the probe's min or max orbit around
	 * it's orbit lock target.
	 * @param {string} newOrCur - string determining if the path represents the new or current orbit.
	 * @returns {Phaser.Curves.Spline} the resulting curve from the path.
	 */
	getOrbitPath(newOrCur) {
		var radius = 0;
		if (newOrCur == 'new'){
			radius = this.newOrbit;
		} else if (newOrCur == 'cur') {
			radius = this.currentOrbit;
		}
		var orbitPath = new Phaser.Geom.Circle(this.orbitTarget.x, this.orbitTarget.y, radius).getPoints(false, 0.5);
		return new Phaser.Curves.Spline(orbitPath);
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
     * Get the horizontal distance between the probe and psyche
     * @return {number} the horizontal distancee between the probe and psyche
     */
    getPsycheDirectionX() {
    	let psycheX = this.scene.bodies["psyche"].x;
    	return (psycheX - this.x) / this.getDistance("psyche");
    }

    /**
     * Get the vertical distance between the probe and psyche
     * @return {number} The vertical distance between the probe and psyche
     */
    getPsycheDirectionY() {
    	let psycheY = this.scene.bodies["psyche"].y;
    	return (psycheY - this.y) / this.getDistance("psyche");
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

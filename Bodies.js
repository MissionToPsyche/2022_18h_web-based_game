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

		var md = Math.pow(this.r, 1 / 2) * 75;

		this.setDisplaySize(this.r * 2, this.r * 2)
			.setSize(this.r * 2, this.r *2);
		this.minimap_icon.setDisplaySize(md, md)
			.setSize(md, md);
		console.log(this.minimap_icon);

		//add the body and the minimap sprite to the scene:
		_scene.add.existing(this);
		_scene.add.existing(this.minimap_icon);
		//add them to respective cameras for proper occlusion
		CameraManager.addGameSprite(this);
		CameraManager.addMinimapSprite(this.minimap_icon);
	}

	/** Cause this body to orbit its parent if one exists and affect position by calculated velocity */
	updatePosition(scene) {
		// affect position by calculated velocity
		this.x += this.vel.x;
		this.y += this.vel.y;
		//update minimap_icon
		this.minimap_icon.x = this.x;
		this.minimap_icon.y = this.y;
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
	updatePosition(scene) {
		super.updatePosition(scene)
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
		this.maxOrbit = 40; //TO DO: find better system for determining min/max orbit
		this.minOrbit = 40;
		this.foos = 1; //fraction of orbit speed
		this.orbitCounter = 0;
		this.orbitTarget = this.scene.bodies["earth"]; //the target of the probe's orbit.
		this.inOrbit = true; //when true, indicates that probe is orbiting a planet
		this.orbitToggle = true; //when true, starts the orbit lock on process

		//overload minimap display size
		this.minimap_icon.setDisplaySize(this.r * 200, this.r * 200)
			.setSize(this.r * 200, this.r * 200);

		if (typeof(this.parent) != "undefined" && this.parent.x != 0) {
			this.x = this.parent.x + this.distance * Math.cos(this.theta);
			this.y = this.parent.y + this.distance * Math.sin(this.theta);
			this.vel = orbitVelocity(this, this.parent, this.theta); //set initial orbit velocity.
		}
	}

	updatePosition (scene) {
		//checking if orbit lock is enabled
		if (this.inOrbit) {
			lockOrbit(this, this.orbitTarget, this.maxOrbit, this.minOrbit);

			//slowly bring probe up to orbit velocity
			//TO DO: Test this properly. I'm not 100% on if it all works
			if (this.foos < 1) {
				var orbitVel = orbitVelocity(this, this.orbitTarget);
				var ovf = new Phaser.Math.Vector2(orbitVel.x, orbitVel.y).setLength(orbitVel.length()/1000);

				this.vel.add(ovf);

				//calculate current fraction of orbit velocity.
				//this is so that the probe can gain the velocity necissary
				//to maintain a proper orbit smoothly rather than all at once.
				var orbitVel = orbitVelocity(this, this.orbitTarget);
				this.foos = covindov(this.vel, orbitVel) / orbitVel;
			}

			//a little thing to bring the orbits to the same value over time
			if (this.maxOrbit > this.minOrbit) {
				this.maxOrbit -= 0.01;
				this.minOrbit += 0.01;
			} else {
				this.minOrbit = this.maxOrbit;
			}
		}
		super.updatePosition(scene);
	}

	/** Update the position of this probe */
    update (f) {
        //toggle for gravity
		//NOTE: FOR TESTING ONLY.
		if (!this.gravityToggle) {
			return
		}

        super.update(f);
    }

	startOrbitLock(scene) {
		//poll all planets and get closest planet within range (determined by max orbit)
		console.log("Starting Orbit Lock")
		var parent;
		var pr = this.maxOrbit;
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

	stopOrbitLock() {
		this.inOrbit = false;
		this.orbitToggle = false;
		this.maxOrbit = 200;
		this.minOrbit = 0;
		this.orbitCounter = 500;
		CameraManager.changeCamTarget(this);
		CameraManager.returnToSetZoom();
		return;
	}

	maintainOrbit() {
		console.log("Maintaining Lock...")
		if (this.orbitCounter <= 0) {
			//if timer is up, orbitlock is successful
			this.inOrbit = true;
			this.maxOrbit = this.orbitTarget.r + this.orbitTarget.r * 2;
			this.minOrbit = this.orbitTarget.r;
			console.log("Maintaining Lock success!");
			CameraManager.changeCamTarget(this.orbitTarget);
			//change zoom level so that planet and probe are visable
			var totalSize = (this.maxOrbit * 2 + this.r * 2 ) * 1.1;
			CameraManager.zoomToSize(totalSize);
			return;
		}

		var p1 = new Phaser.Geom.Point(this.x, this.y);
		var p2 = new Phaser.Geom.Point(this.orbitTarget.x, this.orbitTarget.y);
		var r = Phaser.Math.Distance.BetweenPoints(p1, p2);
		if (r > (this.maxOrbit + this.orbitTarget.r)) {
			this.stopOrbitLock();
			return
		}

		this.orbitCounter -= 1;
	}

	getOrbitPath(minOrMax) {
		var radius = 0;
		if (minOrMax == 'min'){
			radius = this.minOrbit;
		} else if (minOrMax == 'max') {
			radius = this.maxOrbit;
		}
		var orbitPath = new Phaser.Geom.Circle(this.orbitTarget.x, this.orbitTarget.y, radius).getPoints(false, 0.5);
		return new Phaser.Curves.Spline(orbitPath);
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


}

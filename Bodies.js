/*****************************
Body
- Defines the functionality for celestial bodies in the simulation
*****************************/
class Body extends Phaser.GameObjects.Sprite {
	constructor (_scene, _pos, _id, _mass, _diameter, _frame) {
		super(_scene, _pos.x, _pos.y, _id, _frame);
		this.id = _id
		this.mass = _mass
		this.vel = new Phaser.Math.Vector2(0, 0)
		this.r = _diameter / 2
		this.listeners = []
		this.listenRadius = 40 + this.r

		this.setDisplaySize(this.r * 2, this.r * 2)
			.setSize(this.r * 2, this.r *2);
	}

	updatePosition(scene) {
		// affect position by calculated velocity
		this.x += this.vel.x;
		this.y += this.vel.y;
	}

	force(f) {
		// calculate velocity based off of force applied
		this.vel.add(gaussLaw(f, this.mass));
	}

	//begining of implementation of observer pattern to notify probes when close enough to annother body

	//add body to array of bodies that may be affected by dynamic gravity
	subscribe(listener) {
		this.listeners.push(listener)
	}

	//remove body from array of bodies that may be affected by dynamic gravity
	unsubscribe(listener) {
		//yes, this is how you remove a specific array item in js. Yes, it's overly complicated.
		this.listeners = this.listeners.filter(body => body.id != listener.id)
	}

	notify() {
		//notify all subscribed listeners
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

	update(f) {
		//apply force from body subscribed to
		//NOTE** Might want to merge this function with this.force(f) at some point
		this.vel.add(gaussLaw(f, this.mass).scale(0.1)); //TEMP divide by 2 'cause gravity too stronk
	}
}

/*****************************
Satellite
- Defines the functionality for a body that orbits annother body
- subclass of Body
*****************************/
class Satellite extends Body {
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

	getPathCurve () {
		// return points on path as a curve
		return new Phaser.Curves.Spline(this.path);
	}

	updatePosition(scene) {
		super.updatePosition(scene)
		if (this.parent != null) {
			this.orbit(this.parent);
			lockOrbit(this, this.parent);
		}

		// add the current onscreen position into `this.path`
		this.path.push(new Phaser.Math.Vector2(this.x, this.y));
		if (this.path.length > Math.min(this.mass * 10, (this.distance * Phaser.Math.PI2)/2)) {
			this.path.splice(0, 1)
		}
	}

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

/*****************************
Probe
- Defines the functionality for a spacecraft
*****************************/
class Probe extends Body {

	constructor (_scene, _id, _mass, _diameter, _frame) {
		super(_scene, CameraManager.getCenter(), _id, _mass, _diameter, _frame)
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
		this.lockToggle = true; //when true, starts the orbit lock on process

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
		var pr = this.maxOrbit
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

			if ((r - body.r) < pr) {
				parent = body;
				pr = r - body.r;
			}
		}

		if (parent != null) {
			console.log("Lock Success!")
			console.log(parent)
			//set orbit target and enable orbit lock for second stage
			this.orbitTarget = parent;
			this.lockToggle = true;
		} else {
			console.log("Lock Fail...")
		}
	}

	stopOrbitLock() {
		this.inOrbit = false;
		this.lockToggle = false;
		this.maxOrbit = 50;
		this.minOrbit = 10;
		this.orbitCounter = 1000;
		return;
	}

	maintainOrbit() {
		console.log("Maintaining Lock...")
		if (this.orbitCounter <= 0) {
			//if timer is up, orbitlock is successful
			this.inOrbit = true;
			this.maxOrbit += this.orbitTarget.r;
			this.minOrbit += this.orbitTarget.r;
			console.log("Maintaining Lock success!")
			return;
		}

		var p1 = new Phaser.Geom.Point(this.x, this.y);
		var p2 = new Phaser.Geom.Point(this.orbitTarget.x, this.orbitTarget.y);
		var r = Phaser.Math.Distance.BetweenPoints(p1, p2);
		if (r > this.maxOrbit) {
			this.stopOrbitLock();
			return
		}

		this.orbitCounter -= 1;
	}

    getPsycheDistance() {
    	let psycheX = this.scene.bodies["psyche"].x;
    	let psycheY = this.scene.bodies["psyche"].y;
    	return Math.sqrt((this.x - psycheX) * (this.x - psycheX) + (this.y - psycheY) * (this.y - psycheY));
    }

    getPsycheDirectionX() {
    	let psycheX = this.scene.bodies["psyche"].x;
    	return (psycheX - this.x) / this.getPsycheDistance();
    }

    getPsycheDirectionY() {
    	let psycheY = this.scene.bodies["psyche"].y;
    	return (psycheY - this.y) / this.getPsycheDistance();
    }


}
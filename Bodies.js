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
		this.listenRadius = 10 + this.r

		this.setDisplaySize(this.r * 2, this.r * 2)
			.setSize(this.r * 2, this.r *2);
	}

	updatePosition(scene) {
		if (this.parent != null) {
			this.orbit(this.parent)
		}

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
- Defines the functionality for a planet that orbit around the sun
- subclass of Body
*****************************/
class Satellite extends Body {
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

	getPathCurve () {
		// return points on path as a curve
		return new Phaser.Curves.Spline(this.path);
	}

	updatePosition(scene) {
		super.updatePosition(scene)

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
Satellite
- Defines the functionality for a satellite that orbit around a planet
- subclass of Body
*****************************/
class Moon extends Body {
	constructor (_scene, _id, _mass, _diameter, _parent, _angle, _distance, _frame) {
		super(_scene, CameraManager.getCenter(), _id, _mass, _diameter, _frame);
		this.scene = _scene
		this.parent = _parent;
		this.distance = _distance;
		this.path = [];
		this.theta = _angle;
		this.deltaTheta = 0.30;

		if (this.parent != null) {
			this.parent = _parent;
		}
		// copy parent's position
		if (typeof(this.parent.pos) != "undefined" && this.parent.pos.x != 0) {
			this.x = this.parent.x + this.distance * Math.cos(this.theta);
			this.y = this.parent.y + this.distance * Math.sin(this.theta);
		}
	}

	getPathCurve () {
		// return points on path as a curve
		return new Phaser.Curves.Spline(this.path);
	}

	updatePosition(scene) {
		if (typeof(this.parent) != "undefined" && this.parent.x != 0) {
			this.theta += this.deltaTheta;
			this.x = this.parent.x + this.distance * Math.cos(this.theta);
			this.y = this.parent.y + this.distance * Math.sin(this.theta);
		}

		// add the current position into `this.path`
		this.path.push(new Phaser.Math.Vector2(this.x, this.y));
		if (this.path.length > Math.min(this.mass * 10, (this.distance * Phaser.Math.PI2)/2)) {
			this.path.splice(0, 1)
		}
	}
}

/*****************************
Probe
- Defines the functionality for a spacecraft
*****************************/
class Probe extends Body {
	constructor (_scene, _id, _mass, _diameter, _frame) {
		super(_scene, CameraManager.getCenter(), _id, _mass, _diameter, _frame)
		this.orbitToggle = false; //TO DO: REMOVE WHEN DONE TESTING GRAVITY

		this.x = this.scene.bodies["earth"].x;
		this.y = this.scene.bodies["earth"].y;
	}

    update (f) {
        //toggle for gravity
		//NOTE: FOR TESTING ONLY.
		if (!this.orbitToggle) {
			return
		}

        super.update(f);
    }
}

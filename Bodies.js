/*****************************
Body
- Defines the functionality for celestial bodies in the simulation
*****************************/
class Body {
	constructor (_id, _mass, _diameter, _pos, _vel) {
		this.id = _id
		this.mass = _mass
		this.pos = createVector(0, 0)
		this.vel = createVector(0, 0)
		this.r = _diameter / 2
		this.imagePath = "img/icons/" + _id + ".svg"
		this.image = loadImage(this.imagePath)
		this.listeners = []
		this.listenRadius = 10 + this.r
	}

	show() {
		// draw the body's icon
		image(this.image, this.pos.x - this.r, this.pos.y - this.r, this.r * 2, this.r * 2)
	}

	updatePosition() {
		if (this.parent != null) {
			this.orbit(this.parent)
		}

		// affect position by calculated velocity
		this.pos.x += this.vel.x
		this.pos.y += this.vel.y
	}

	force(f) {
		// calculate velocity based off of force applied
		this.vel.add(GravUtils.gaussLaw(f, this.mass));
		this.vel.add(this.parent.vel.x, this.parent.vel.x);
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
			const r = dist(listener.pos.x, listener.pos.y, this.pos.x, this.pos.y)

			//check if lister is within listen radius
			//also check if it's not within the planet so the probe isn't flung out of existance.
			if (r <= this.listenRadius && r > this.r) {
				//create vector f in direction of the listening body
				const f = this.pos.copy().sub(listener.pos)
				//set direction vector to the length of the force applied by gravity between
				//the two bodies, resulting in the force vector between the two bodies
				f.setMag(GravUtils.calcGravity(listener.mass, this.mass, r))
				//inform the listener of the force.
				listener.update(f)
			}
		}.bind(this))
	}

	update(f) {
		//toggle for gravity
		//NOTE: FOR TESTING ONLY.
		if (!gravityToggle) {
			return
		}

		//apply force from body subscribed to
		//NOTE** Might want to merge this function with this.force(f) at some point
		this.vel.add(GravUtils.gaussLaw(f, this.mass).div(10)); //TEMP divide by 2 'cause gravity too stronk
	}
}

/*****************************
Satellite
- Defines the functionality for a Satellite, such as a planet, moon, or asteroid
- subclass of Body
*****************************/
class Satellite extends Body {
	constructor(_id, _mass, _diameter, _parent_id, _distance, _pos, _vel) {
		super(_id, _mass, _diameter, _pos, _vel);
		this.parent_id = _parent_id;
		this.parent = null;
		this.distance = _distance;
		this.path = [];
	}

	initialize () {
		let origin
		if (this.parent_id == null) {
			// this is the sun
			origin = createVector(0, 0)
		} else {
			// this is everything else, and should only be called after all
			// bodies have been initialized
			this.parent = bodies[this.parent_id]
			origin = this.parent.pos.copy()
		}

		this.pos = origin

		// this calculates a random initial position in the orbit, at `distance` from `parent`
		const theta = random(TWO_PI)
		const bodyPos = origin.add(createVector(this.distance * cos(theta), this.distance * sin(theta)))
		const bodyVel = bodyPos.copy()

		if (this.parent_id != null) {
			bodyVel.rotate(HALF_PI)
			bodyVel.setMag(sqrt(G * (this.parent.mass / bodyPos.mag())))
		}

		this.pos = bodyPos
		this.vel = bodyVel
	}

	show () {
		// draw the points in `this.path`
		stroke("#ffffff44")
		strokeCap(SQUARE)

		for (let i = 0; i < this.path.length - 1; i++) {
			line(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y)
		}

		super.show()
	}

	updatePosition() {
		// add the current position into `this.path`
		this.path.push(this.pos.copy());
		if (this.path.length > this.mass * 10) {
			this.path.splice(0, 1)
		}

		super.updatePosition()
	}

	orbit(parent) {
		const r = dist(this.pos.x, this.pos.y, parent.pos.x, parent.pos.y)
		const f = parent.pos.copy().sub(this.pos)

		// this is Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
		// we use it here to calculate the force `parent` applies
		f.setMag(GravUtils.calcGravity(this.mass, parent.mass, r));

		// and apply it
		this.force(f)
	}
}

/*****************************
Probe
- Defines the functionality for a spacecraft
*****************************/
class Probe extends Body {
	constructor (_id, _mass, _diameter, _pos, _vel) {
		super(_id, _mass, _diameter, _pos, _vel)
	}

	initialize () {
		this.pos.x = bodies["earth"].pos.x;
		this.pos.y = bodies["earth"].pos.y;
	}
}
/*****************************
Body
- Defines the functionality for celestial bodies in the simulation
*****************************/
class Body {
	constructor (_id, _mass, _diameter, _pos, _vel) {
		this.id = _id
		this.mass = _mass
		this.pos = new Phaser.Geom.Point(0, 0)
		this.vel = new Phaser.Math.Vector2(0, 0)
		this.r = _diameter / 2
		this.imagePath = "img/icons/" + _id + ".svg"
		this.sprite;
		this.listeners = []
		this.listenRadius = 10 + this.r
	}

    //loads the Body's image into memory
    //'scene' is the scene the image is being loaded into
    initialize(scene) {
        this.sprite = scene.add.sprite(this.pos.x,this.pos.y,this.id)
            .setDisplaySize(this.r * 2, this.r *2)
            .setSize(this.r * 2, this.r *2);
    }

	updatePosition(scene) {
		if (this.parent != null) {
			this.orbit(this.parent)
		}

		// affect position by calculated velocity
		this.pos.x += this.vel.x 
		this.pos.y += this.vel.y

        //update position in scene
        //**TO DO: find better way to center everything.
        var finalX = this.pos.x + 2048/2;
        var finalY = this.pos.y + 2048/2;
        this.sprite.setPosition(finalX, finalY)
	}

	force(f) {
		// calculate velocity based off of force applied
		this.vel.add(gaussLaw(f, this.mass));
		this.vel.add(this.parent.vel);
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
			const r = Phaser.Math.Distance.BetweenPoints(this.pos, listener.pos)

			//check if lister is within listen radius
			//also check if it's not within the planet so the probe isn't flung out of existance.
			if (r <= this.listenRadius && r > this.r) {
				//create vector f in direction of the listening body
                const f = new Phaser.Math.Vector2(0, 0).copy(this.pos).subtract(listener.pos)
				//set direction vector to the length of the force applied by gravity between
				//the two bodies, resulting in the force vector between the two bodies
				f.setLength(calcGravity(listener.mass, this.mass, r))
				//inform the listener of the force.
				listener.update(f)
			}
		}.bind(this))
	}

	update(f) {
		//apply force from body subscribed to
		//NOTE** Might want to merge this function with this.force(f) at some point
		this.vel.add(gaussLaw(f, this.mass).scale(0.1)); //TEMP divide by 2 'cause gravity too stronk
	}
}

/*****************************
Planet
- Defines the functionality for a planet that orbit around the sun
- subclass of Body
*****************************/
class Satellite extends Body {
	constructor (_id, _mass, _diameter, _parent, _distance, _pos, _vel) {
		super(_id, _mass, _diameter, _pos, _vel);
		this.parent = _parent;
		this.distance = _distance;
		this.path = [];
	}

	initialize (scene) {
        super.initialize(scene)
		let origin = new Phaser.Geom.Point(0, 0)
		if (this.parent != null) {
			this.parent = scene.bodies[this.parent]
			Phaser.Geom.Point.CopyFrom(this.parent.pos, origin)
		}

		this.pos = origin

		// this calculates a random initial position in the orbit, at `distance` from `parent`
		var theta = Phaser.Math.FloatBetween(0, Phaser.Math.PI2)
		var bodyPos = origin.setTo(origin.x + this.distance * Math.cos(theta), origin.y + this.distance * Math.sin(theta))
		var bodyVel = new Phaser.Math.Vector2(bodyPos.x, bodyPos.y)

		if (this.parent != null) {
			bodyVel.rotate(Phaser.Math.TAU)
			bodyVel.setLength(Math.sqrt(G * (this.parent.mass / 
				Phaser.Math.Distance.BetweenPoints(bodyPos, this.parent.pos))));
		}

		this.pos = bodyPos
		this.vel = bodyVel
	}

	getPathCurve () {
		// return points on path as a curve
		return new Phaser.Curves.Spline(this.path);
	}

	updatePosition(scene) {
		super.updatePosition(scene)

		// add the current position into `this.path`
		this.path.push(new Phaser.Math.Vector2(this.pos.x + 2048/2, this.pos.y + 2048/2));
		if (this.path.length > Math.min(this.mass * 10, (this.distance * Phaser.Math.PI2)/2)) {
			this.path.splice(0, 1)
		}
	}

	orbit(parent) {
		const r = Phaser.Math.Distance.BetweenPoints(this.pos, parent.pos)
		const f = new Phaser.Math.Vector2(0, 0).copy(parent.pos).subtract(this.pos)

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
	constructor (_id, _mass, _diameter, _parent, _distance, _pos, _vel) {
		super(_id, _mass, _diameter, _pos, _vel);
		this.parent = _parent;
		this.distance = _distance;
		this.path = [];
		this.theta = 0;
		this.deltaTheta = 0.17;
	}

	initialize (scene) {
		super.initialize(scene)

		if (this.parent != null) {
			this.parent = scene.bodies[this.parent]
		}
		// copy parent's position
		if (typeof(this.parent.pos) != "undefined" && this.parent.pos.x != 0) {
			this.pos.x = this.parent.pos.x + this.distance * Math.cos(this.theta);
			this.pos.y = this.parent.pos.y + this.distance * Math.sin(this.theta);
		}
	}

	getPathCurve () {
		// return points on path as a curve
		return new Phaser.Curves.Spline(this.path);
	}

	updatePosition(scene) {
		if (typeof(this.parent.pos) != "undefined" && this.parent.pos.x != 0) {
			this.theta += this.deltaTheta;
			this.pos.x = this.parent.pos.x + this.distance * Math.cos(this.theta);
			this.pos.y = this.parent.pos.y + this.distance * Math.sin(this.theta);
		}

		//update position in scene
        //**TO DO: find better way to center everything.
        this.sprite.setPosition(this.pos.x + 2048/2, this.pos.y + 2048/2)

		// add the current position into `this.path`
		this.path.push(new Phaser.Math.Vector2(this.pos.x + 2048/2, this.pos.y + 2048/2));
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
	constructor (_id, _mass, _diameter, _pos, _vel) {
		super(_id, _mass, _diameter, _pos, _vel)
		this.gravityToggle = false; //TO DO: REMOVE WHEN DONE TESTING GRAVITY
	}

	initialize (scene) {
        super.initialize(scene);
		this.pos.x = scene.bodies["sol"].pos.x;
		this.pos.y = scene.bodies["sol"].pos.y;
	}

    update (f) {
        //toggle for gravity
		//NOTE: FOR TESTING ONLY.
		if (!this.gravityToggle) {
			return
		}

        super.update(f);
    }
}
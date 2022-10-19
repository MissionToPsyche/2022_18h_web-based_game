const G = 6.67

let logo
const logoPath = "img/Psyche_Icon_Color-SVG.svg"

let bodies = {}
const dataPath = "data/bodies.json"

let luna
// moon's initial angle from the earth
let lunaTheta = 0
// unit of moving when orbiting around the earth
let lunaDeltaTheta = 0.17

// key codes
const leftArrow = 37
const upArrow = 38
const rightArrow = 39
const downArrow = 40
const spacebar = 32
// zoom in in the factor of this number
const zoom = 10
// unit of moving when pressing a key
const moveUnit = 0.01

//boolean for gravity on/off default: off
let gravityToggle = false
let keyHeld = false;

// the initial position of the view
let position = {x : 0, y : 0}
// this boolean is true when the canvas is in the initial state
let initial = true

function setup() {
	createCanvas(windowWidth, windowHeight);
	logo = loadImage(logoPath)

	loadJSON(dataPath, setupBodies)
}

function setupBodies(json) {
	for (type in json) {
		for (body of json[type]) {

			let id = body['id'];
			let mass = body['mass']['value'];
			let diameter = body['diameter']['value'];

			if(type != "probes"){
				let parent = body['orbits'];
				let orbit_distance = body['orbit_distance']['value'];
				bodies[id] = new Planet(id, mass, diameter, parent, orbit_distance);
			} else {
				bodies[id] = new Probe(id, mass, diameter);
			}
		}
	}

	for (const body in bodies) {
		if(bodies[body].initialize){
			bodies[body].initialize();
		}
	}

	//subscribe probe to all other bodies.
	//NOTE** hard coded to psyche probe for now
	for (const body in bodies) {
		if(bodies[body].id != "psyche_probe"){
			bodies[body].subscribe(bodies["psyche_probe"])
		}
	}
}

function draw() {
	background("#12031d")
	image(logo, 24, 24, 96, 96)

	// initial position of the view is on the center of the canvas, the sun
	if (initial) {
		// start from the earth
		//How to get the position of a planet: 
		// planets[2] is the earth, please refer to data/bodies.json for the index of a specific planet
		// planets[2].pos.x and planets[2].pos.y is the relative position from the sun
		// For example, if the earth is initially on the upper right direction from the sun, 
		// planets[2].pos.x will be a positive value and planets[2].pos.y will be a negative value
		// sun is the center of the screen, so I used width/2 and height/2 to get the position of the sun here
		// zoom is the factor by which the screen is zoomed
		// Since the screen is zoomed in, the distance from the center (sun) to the planet increases
		// so that's why the relative position planets[2].pos.x and planets[2].pos.y need to * zoom

		//Draw function can be called before planets exist, so checking if planet exists first.
		//NOTE: This is a bad way of doing this! Find a new way to do this later
		//position.x = width / 2 - zoom * bodies["earth"].pos.x;
		//position.y = height / 2 - zoom * bodies["earth"].pos.y;
		initial = false;
	}

	//super basic probe controls
	//note: FOR TESTING ONLY, THIS IS A BAD WAY OF DOING THIS
    if (keyIsPressed) {
    	if (keyCode == rightArrow) {
    		bodies["psyche_probe"].vel.x += moveUnit;
    	} else if (keyCode == leftArrow) {
    		bodies["psyche_probe"].vel.x -= moveUnit;
    	} else if (keyCode == upArrow) {
    		bodies["psyche_probe"].vel.y -= moveUnit;
    	} else if (keyCode == downArrow) {
    		bodies["psyche_probe"].vel.y += moveUnit;
    	} else if (keyCode == spacebar) {
			if (gravityToggle && !keyHeld) {
				gravityToggle = false
			} else if (!gravityToggle && !keyHeld) {
				gravityToggle = true
			}
			keyHeld = true
		} else {
			keyHeld = false
		}
    } else {
		keyHeld = false
	}

	//text for gravity on/off toggle
	textSize(32)
	if (gravityToggle) {
		text('Gravity : On',0 ,120)
	} else {
		text('Gravity : Off',0 ,120)
	}
	fill(255, 255, 255);

	//prevent psyche from going too far out for now
	//note: FOR TESTING ONLY, THIS IS A BAD WAY OF DOING THIS
	const boundry = 6500
	if (typeof(bodies["psyche_probe"]) != "undefined") {
		if (bodies["psyche_probe"].pos.x >= 650) {
			bodies["psyche_probe"].vel.x = 0
			bodies["psyche_probe"].pos.x = 649
		} if (bodies["psyche_probe"].pos.y >= 650) {
			bodies["psyche_probe"].vel.y = 0
			bodies["psyche_probe"].pos.y = 649
		} if (bodies["psyche_probe"].pos.x <= -650) {
			bodies["psyche_probe"].vel.x = 0
			bodies["psyche_probe"].pos.x = -649
		} if (bodies["psyche_probe"].pos.y <= -650) {
			bodies["psyche_probe"].vel.y = 0
			bodies["psyche_probe"].pos.y = -649
		}

		//camera tracking probe
		//note: FOR TESTING ONLY, THIS IS A BAD WAY OF DOING THIS
		position.x = bodies["psyche_probe"].pos.x * (-10) + 900;
		position.y = bodies["psyche_probe"].pos.y * (-10) + 500;
	}
    translate(position.x, position.y)
    scale(zoom, zoom)

	for (const body in bodies) {
		//apply dynamic gravity
		//NOTE: THIS IS A BAD PLACE TO DO THIS. MOVE THIS TO AN APPROPRIATE PLACE LATER!!
		bodies[body].notify() 

		//update body positions
		bodies[body].show()
		bodies[body].updatePosition()
	}
}

/*****************************
GravUtils
- An object prototype containing various util funcitons for gravity 
*****************************/
class GravUtils {
	constructor() {
		if (this instanceof GravUtils) {
			//This is a static object, and the constructor should not be called
			throw Error('This is a static class')
		}
	}

	//basic calculation for gravity. b1 and b2 are the two bodies involved.
	//R is the radius between the two
	static calcGravity (m1, m2, r) {
		// this is Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
		return G * (m1 * m2) / (r * r);
	}

	//calculates the gravitational acceleration on a mass based on force
	static gaussLaw (f, m1) {
		return createVector(f.x/m1, f.y/m1)
	}
}

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
Planet
- Defines the functionality for a planet that orbit around the sun
- subclass of Body
*****************************/
class Planet extends Body {
	constructor (_id, _mass, _diameter, _parent, _distance, _pos, _vel) {
		super(_id, _mass, _diameter, _pos, _vel);
		this.parent = _parent;
		this.distance = _distance;
		this.path = [];
	}

	initialize () {
		let origin
		if (this.parent != null) {
			this.parent = bodies[this.parent]
			origin = this.parent.pos.copy()
		} else {
			origin = createVector(0, 0)
		}

		this.pos = origin

		// this calculates a random initial position in the orbit, at `distance` from `parent`
		const theta = random(TWO_PI)
		const bodyPos = origin.add(createVector(this.distance * cos(theta), this.distance * sin(theta)))
		const bodyVel = bodyPos.copy()

		if (this.parent != null) {
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
		super.updatePosition()

		// add the current position into `this.path`
		this.path.push(this.pos.copy());
		if (this.path.length > this.mass * 10) {
			this.path.splice(0, 1)
		}
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
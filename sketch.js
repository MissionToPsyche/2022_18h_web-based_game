const G = 6.67

let logo
const logoPath = "img/Psyche_Icon_Color-SVG.svg"

let bodies = {}
const dataPath = "data/bodies.json"


// key codes
const leftArrow = 37
const upArrow = 38
const rightArrow = 39
const downArrow = 40
// zoom in in the factor of this number
const zoom = 10
// unit of moving when pressing a key
const moveUnit = 20

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
			let id = body['id']
			let parent = body['orbits']
			let orbit_distance = body['orbit_distance']['value']
			let mass = body['mass']['value']
			let diameter = body['diameter']['value']

			bodies[id] = new Body(id, parent, mass, diameter, orbit_distance)
		}
	}

	for (const body in bodies) {
		bodies[body].initialize()
	}
}

function draw() {
	background("#12031d")
	image(logo, 24, 24, 96, 96)

	translate(width / 2, height / 2)
  
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
		position.x = width / 2 - zoom * planets[2].pos.x
		position.y = height / 2 - zoom * planets[2].pos.y
		initial = false
	}

    if (keyIsPressed) {
    	if (keyCode == rightArrow) {
    		position.x -= moveUnit
    	} else if (keyCode == leftArrow) {
    		position.x += moveUnit
    	} else if (keyCode == upArrow) {
    		position.y += moveUnit
    	} else if (keyCode == downArrow) {
    		position.y -= moveUnit
    	}
    }

    translate(position.x, position.y)
    scale(zoom, zoom)

	sun.show()

	for (const body in bodies) {
		bodies[body].show()
		bodies[body].update()
	}
}

/*****************************
PolarGrid
- A manager for the polar grid system
*****************************/
function PolarGrid () {
	//This is a static object, and the constructor should not be called
	throw new Error('This is a static class');
}

PolarGrid.prototype = {
	//converts radius and theta(angle) to x y coordinates
	convertToXY: function(r, t, x, y) {
		x = r * Math.cos(t);
		y = r * Math.sin(t);
	},

	//converts x y coordinates to radius and theta
	convertFromXY: function(x, y, r, t) {
		r = Math.sqrt(x * x + y * y);
		t = Math.atan(y / x);
	}
}

/*****************************
Body
- Defines the functionality for celestial bodies in the simulation
*****************************/
function Body(_id, _parent, _mass, _diameter, _distance, _pos, _vel) {
	this.id = _id
	this.parent = _parent
	this.mass = _mass
	this.distance = _distance
	this.pos = createVector(0, 0)
	this.vel = createVector(0, 0)
	this.r = _diameter / 2
	this.path = []
	this.imagePath = "img/icons/" + _id + ".svg"
	this.image = loadImage(this.imagePath)
}

Body.prototype = {
	initialize: function () {
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
	},

	show: function () {
		// draw the points in `this.path`
		stroke("#ffffff44")
		strokeCap(SQUARE)

		for (let i = 0; i < this.path.length - 1; i++) {
			line(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y)
		}

		// draw the body's icon
		image(this.image, this.pos.x - this.r, this.pos.y - this.r, this.r * 2, this.r * 2)
	},

	update: function () {
		if (this.parent != null) {
			this.orbit(this.parent)
		}

		// affect position by calculated velocity
		this.pos.x += this.vel.x
		this.pos.y += this.vel.y

		// add the current position into `this.path`
		this.path.push(this.pos.copy())
		if (this.path.length > this.mass * 10) {
			this.path.splice(0, 1)
		}
	},

	force: function (f) {
		// calculate velocity based off of force applied
		this.vel.x += (f.x / this.mass) + this.parent.vel.x
		this.vel.y += (f.y / this.mass) + this.parent.vel.x
	},

	orbit: function (parent) {
		const r = dist(this.pos.x, this.pos.y, parent.pos.x, parent.pos.y)
		const f = parent.pos.copy().sub(this.pos)

		// this is Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
		// we use it here to calculate the force `parent` applies
		f.setMag(G * (this.mass * parent.mass) / (r * r))

		// and apply it
		this.force(f)
	}
}
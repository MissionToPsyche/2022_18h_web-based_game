const G = 6.67
const logoPath = "img/Psyche_Icon_Color-SVG.svg"
let logo

let sun
let moon
let planets = []
const numPlanets = 9
const destabilize = 0.1

// These are **not** using the "proper" values from `data/bodies.json`...
// I'd like if there was a nice way to use realistic values, but the planets
// vary so much in size and distance from the Sun, that it's hard to fit
// them all on the screen :(

const masses = [200, 30, 50, 60, 60, 2000, 600, 90, 100, 5]
const diameters = [100, 15, 25, 20, 15, 100, 90, 50, 60, 10]
const distances = [0, 100, 150, 200, 250, 350, 475, 550, 600, 650]

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

	sun = createBody(null, distances[0], masses[0], diameters[0], 0)

	for (let i = 1; i <= numPlanets; i++) {
		planets.push(createBody(sun, distances[i], masses[i], diameters[i], i))
	}

	moon = createBody(planets[2], 10, 10, 10, 3.1)
}

function createBody(parent, distance, mass, diameter, orbit) {
	// this calculates a random initial position in the orbit, at `distance` from `parent`
	const theta = random(TWO_PI)
	const bodyPos = createVector(distance * cos(theta), distance * sin(theta))

	// this calculates an initial velocity, tangent to the orbit
	const bodyVel = bodyPos.copy()
	if (parent != null) {
		bodyVel.rotate(HALF_PI)
		bodyVel.setMag(sqrt(G * (parent.mass / bodyPos.mag())))
	}

	return new Body(parent, mass, diameter, bodyPos, bodyVel, orbit)
}

function draw() {
	background("#12031d")
	image(logo, 24, 24, 96, 96)

	// initial position of the view is on the center of the canvas, the sun
	// TODO: initial position is supposed to be the earth
	if (initial) {
		position.x = width / 2
		position.y = height / 2
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

	for (const planet of planets) {
		planet.show()
		planet.update()
	}

	moon.show()
	moon.update()
}

class Body {
	constructor(_parent, _mass, _diameter, _pos, _vel, _orbit) {
		this.parent = _parent
		this.mass = _mass
		this.pos = _pos
		this.vel = _vel
		this.r = _diameter / 2
		this.path = []
		this.imagePath = "img/icons/" + _orbit + ".svg"
		this.image = loadImage(this.imagePath)
	}

	show() {
		// draw the points in `this.path`
		stroke("#ffffff44")
		for (let i = 0; i < this.path.length - 1; i++) {
			line(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y)
		}

		// draw the body's icon
		image(this.image, this.pos.x - this.r, this.pos.y - this.r, this.r * 2, this.r * 2)
	}

	update() {
		// affect position by calculated velocity
		this.pos.x += this.vel.x
		this.pos.y += this.vel.y

		// add the current position into `this.path`
		this.path.push(this.pos.copy())
		if (this.path.length > this.mass * 10) {
			this.path.splice(0, 1)
		}

		if (this.parent != null) {
			this.orbit(this.parent)
		}
	}

	force(f) {
		// calculate velocity based off of force applied
		this.vel.x += f.x / this.mass
		this.vel.y += f.y / this.mass
	}

	orbit(parent) {
		let r = dist(this.pos.x, this.pos.y, parent.pos.x, parent.pos.y)
		let f = parent.pos.copy().sub(this.pos)

		// this is Newton's Law of Universal Gravitation (https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)
		// we use it here to calculate the force `parent` applies
		f.setMag(G * (this.mass * parent.mass) / (r * r))

		// and apply it
		this.force(f)
	}
}
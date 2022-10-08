const G = 6.67

let logo
const logoPath = "img/Psyche_Icon_Color-SVG.svg"

let bodies = {}
const dataPath = "data/bodies.json"


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

	for (const body in bodies) {
		bodies[body].show()
		bodies[body].update()
	}
}

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
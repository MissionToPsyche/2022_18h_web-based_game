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
				bodies[id] = new Satellite(id, mass, diameter, parent, orbit_distance);
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

// used in mocha tests
class Game {
	constructor(G, logo, logoPath, spacecraftPath, spacecraft, scWidth, scHeight, bodies, dataPath,
		leftArrow, upArrow, rightArrow, downArrow, zoom, moveUnit, position, initial) {
		this.G = G;
		this.logo = logo;
		this.logoPath = logoPath;
		this.spacecraftPath = spacecraftPath;
		this.spacecraft = spacecraft;
		this.scWidth = scWidth;
		this.scHeight = scHeight;
		this.bodies = bodies;
		this.dataPath = dataPath;
		this.leftArrow = leftArrow;
		this.upArrow = upArrow;
		this.rightArrow = rightArrow;
		this.downArrow = downArrow;
		this.zoom = zoom;
		this.moveUnit = moveUnit;
		this.position = position;
		this.initial = initial;
	}

	// this should be exposed to our test files because it is a member of the Game class
	exampleHelperFunction() {
	}

	// helper used in draw() to handle player inputs
	playerInputHandler() {
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
	}

	// helper used in GravUtils() to throw an error
	throwError(error) {
		throw new Error(error);
	}
}
module.exports = Game;

// export functions so that mocha tests can see them
//module.exports = { setup, setupBodies, draw, Body }
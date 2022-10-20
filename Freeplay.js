class Freeplay extends Phaser.Scene {
    constructor () {
        super({key:"Freeplay"});
        //creating body objects
        this.bodies = {};
        this.json;
    }

    preload () {
        this.load.json('bodies', 'data/bodies.json');

        //loading in all image assets
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo

        //staticly loading all the individual assets for now
        //**TO DO: */ change to a more general
        this.load.image('earth', "img/icons/earth.svg");
        this.load.image('jupiter', "img/icons/jupiter.svg");
        this.load.image('luna', "img/icons/luna.svg");
        this.load.image('mars', "img/icons/mars.svg");
        this.load.image('mercury', "img/icons/mercury.svg");
        this.load.image('neptune', "img/icons/neptune.svg");
        this.load.image('pluto', "img/icons/pluto.svg");
        this.load.image('psyche_probe', "img/icons/psyche_probe.svg");
        this.load.image('saturn', "img/icons/saturn.svg");
        this.load.image('sol', "img/icons/sol.svg");
        this.load.image('uranus', "img/icons/uranus.svg");
        this.load.image('venus', "img/icons/venus.svg");
    }

    create () {
        this.cameras.main.setBounds(0, 0, 1024, 2048);

        this.cameras.main.centerOn(0, 0);

        this.image = this.add.image(50,50,'logo').setScale(0.5);
        this.json = this.cache.json.get('bodies');

        //creating Body objects
        for (var type in this.json) {
            for (var body of this.json[type]) {
    
                let id = body['id'];
                let mass = body['mass']['value'];
                let diameter = body['diameter']['value'];
    
                if(type != "probes"){
                    let parent = body['orbits'];
                    let orbit_distance = body['orbit_distance']['value'];
                    this.bodies[id] = new Satellite(id, mass, diameter, parent, orbit_distance);
                } else {
                    this.bodies[id] = new Probe(id, mass, diameter);
                }
            }
        }

        console.log("========Initializing========")
        //initialize all bodies
        for (const body in this.bodies) {
            if(this.bodies[body].initialize){
                this.bodies[body].initialize(this);
            }
        }
        //subscribe probe to all other bodies.
        //NOTE** hard coded to psyche probe for now
        for (const body in this.bodies) {
            if(this.bodies[body].id != "psyche_probe"){
                this.bodies[body].subscribe(this.bodies["psyche_probe"]);
            }
        }
        console.log("========Done========")
    }

    //this is the scene's main update loop
    update () {
        for (const body in this.bodies) {
            //apply dynamic gravity
            //NOTE: THIS IS A BAD PLACE TO DO THIS. MOVE THIS TO AN APPROPRIATE PLACE LATER!!
            this.bodies[body].notify() 
    
            //update body positions
            this.bodies[body].updatePosition(this)
        }
    }
}
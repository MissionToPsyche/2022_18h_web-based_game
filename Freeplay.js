class Freeplay extends Phaser.Scene {
    constructor () {
        super({key:"Freeplay"});
        //creating body objects
        this.bodies = {};
        this.json;
        this.keyToggle = false //for testing only
        this.paused = false
        this.graphics;
        this.gravText;
        this.pauseIndicator;
    }

    preload () {
        this.load.json('bodies', 'data/bodies.json');

        //loading in all image assets
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('play', 'img/icons/play-circle.svg'); //asset for psyche logo
        this.load.image('pause', 'img/icons/pause-circle.svg'); //asset for psyche logo

        //staticly loading all the individual assets for now
        //**TO DO: */ change to a more general
        this.load.image('earth', "img/icons/earth.svg");
        this.load.image('jupiter', "img/icons/jupiter.svg");
        this.load.image('luna', "img/icons/luna.svg");
        this.load.image('mars', "img/icons/mars.svg");
        this.load.image('mercury', "img/icons/mercury.svg");
        this.load.image('neptune', "img/icons/neptune.svg");
        this.load.image('pluto', "img/icons/pluto.svg");
        this.load.image('psyche', "img/icons/psyche.svg");
        this.load.image('psyche_probe', "img/icons/psyche_probe.svg");
        this.load.image('saturn', "img/icons/saturn.svg");
        this.load.image('sol', "img/icons/sol.svg");
        this.load.image('uranus', "img/icons/uranus.svg");
        this.load.image('venus', "img/icons/venus.svg");
    }

    create () {
        //Solar system is 2048x2048
        this.matter.world.setBounds(0, 0, 2048, 2048);
        this.cameras.main.setBounds(0, 0, 2048, 2048).setZoom(3).setName('main');
        this.cameras.main.centerOn(0, 0);

        var logo = this.add.image(50, 50, 'logo').setScale(0.5);
        this.playIndicator = this.add.image(964, 708, 'play').setScale(0.5)
        this.pauseIndicator = this.add.image(964, 708, 'pause').setScale(0.5)

        this.add.image(50, 50, 'logo').setScale(0.5);
        this.gravText = this.add.text(4, 90, '0')
        this.gravText.setText("Gravity: ON")

        //ignore all UI elements on main camera.
        this.cameras.main.ignore([logo, this.gravText, this.playIndicator, this.pauseIndicator])

        //creating Body objects
        this.json = this.cache.json.get('bodies');
        for (var type in this.json) {
            if (type != "satellites") {
                for (var body of this.json[type]) {
        
                    let id = body['id'];
                    let mass = body['mass']['value'];
                    let diameter = body['diameter']['value'];
        
                    if(type != "probes"){
                        let parent = body['orbits'];
                        let angle = body['angle'];
                        let orbit_distance = body['orbit_distance']['value'];
                        this.bodies[id] = new Planet(id, mass, diameter, parent, angle, orbit_distance);
                    } else {
                        this.bodies[id] = new Probe(id, mass, diameter);
                    }
                }
            } else {
                // create satellites such as luna
                for (var body of this.json[type]) {
                    let id = body['id'];
                    let mass = body['mass']['value'];
                    let diameter = body['diameter']['value'];
                    let parent = body['orbits'];
                    let orbit_distance = body['orbit_distance']['value'];
                    this.bodies[id] = new Satellite(id, mass, diameter, parent, orbit_distance);
                }
            }
        }

        //creating a UI camera for UI elements
        const UICam = this.cameras.add(0, 0, 2048, 2048)

        console.log("========Initializing========")
        //initialize all bodies
        for (const body in this.bodies) {
            if(this.bodies[body].initialize){
                this.bodies[body].initialize(this);
                
            }
            //made sure every body ignores UICamera
            //Everything not in the UI NEEDS to be added to this.
            UICam.ignore(this.bodies[body].sprite)
        }

        this.player = this.bodies["psyche_probe"].sprite;
        console.log(this.player);
        this.cameras.main.startFollow(this.player, false);

        //subscribe probe to all other bodies.
        //NOTE** hard coded to psyche probe for now
        for (const body in this.bodies) {
            if(this.bodies[body].id != "psyche_probe"){
                this.bodies[body].subscribe(this.bodies["psyche_probe"]);
            }
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        console.log(Phaser.Input.Keyboard.SPACEBAR)
    }

    //this is the scene's main update loop
    update() {
        //Probe controls
        //**TO DO: Wrap in a custom controler later.
        const moveUnit = 0.01

        // update pause/play indicator
        if (this.paused) {
            this.playIndicator.setVisible(false)
            this.pauseIndicator.setVisible(true)
        } else {
            this.pauseIndicator.setVisible(false)
            this.playIndicator.setVisible(true)
        }

        // only move if not paused
        if (!this.paused) {
            if (this.cursors.left.isDown) {
                this.bodies["psyche_probe"].vel.x -= moveUnit;
            }
            else if (this.cursors.right.isDown) {
                this.bodies["psyche_probe"].vel.x += moveUnit;
            }

            if (this.cursors.up.isDown) {
                this.bodies["psyche_probe"].vel.y -= moveUnit;
            }
            else if (this.cursors.down.isDown) {
                this.bodies["psyche_probe"].vel.y += moveUnit;
            }
        }

        if (this.spaceKey.isDown) {
            this.bodies["psyche_probe"].gravityToggle = !this.keyToggle ? !this.bodies["psyche_probe"].gravityToggle : this.bodies["psyche_probe"].gravityToggle
            this.gravText.setText("Gravity: " + (this.bodies["psyche_probe"].gravityToggle ? "ON" : "OFF"))
            this.keyToggle = true
        } else if (this.pauseKey.isDown) {
            this.paused = !this.keyToggle ? !this.paused : this.paused
            this.keyToggle = true
        } else {
            this.keyToggle = false
        }

        //prevent psyche from going too far out for now
	    //note: FOR TESTING ONLY, THIS IS A BAD WAY OF DOING THIS
        if (this.bodies["psyche_probe"].pos.x >= 650) {
            this.bodies["psyche_probe"].vel.x = 0
            this.bodies["psyche_probe"].pos.x = 649
        } if (this.bodies["psyche_probe"].pos.y >= 650) {
            this.bodies["psyche_probe"].vel.y = 0
            this.bodies["psyche_probe"].pos.y = 649
        } if (this.bodies["psyche_probe"].pos.x <= -650) {
            this.bodies["psyche_probe"].vel.x = 0
            this.bodies["psyche_probe"].pos.x = -649
        } if (this.bodies["psyche_probe"].pos.y <= -650) {
            this.bodies["psyche_probe"].vel.y = 0
            this.bodies["psyche_probe"].pos.y = -649
        }

        // don't update bodies if paused
        if (this.paused) {
            return
        }

        for (const body in this.bodies) {
            /*
            if(this.graphics){
                this.graphics.destroy()
            }
            this.graphics = this.add.graphics()
            */

            //apply dynamic gravity
            //NOTE: THIS IS A BAD PLACE TO DO THIS. MOVE THIS TO AN APPROPRIATE PLACE LATER!!
            this.bodies[body].notify() 

            //draw paths
            /*
            if(this.bodies[body].id != "psyche_probe"){
                this.bodies[body].drawPath(this.graphics)
            }
            */
    
            //update body positions
            this.bodies[body].updatePosition(this)
        }
    }
}
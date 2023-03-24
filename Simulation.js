class Simulation extends Phaser.Scene {
    constructor(gamemode) {
        super({ key: gamemode });

        this.bodies = {};
        this.graphics = null;
        this.minigraphics = null;

        this.player = null;
        this.controller = null;

        this.psyche_probe_fx = null;
    }

    /** Loads all necessary assets for the scene before the simulation runs */
    preload() {
        this.load.json('bodies', 'data/bodies.json');

        //loading in all image assets
        this.load.image('minimap_border', 'img/icons/minimap-border.png'); //border for minimap
        this.load.image('logo', 'img/Psyche_Icon_Color-SVG.svg'); //asset for psyche logo
        this.load.image('play', 'img/icons/play-circle.svg');
        this.load.image('pause', 'img/icons/pause-circle.svg');
        this.load.image('button', "img/icons/button.png"); // a default button with no text
        this.load.image('orbit', 'img/icons/orbit.svg');
        this.load.image('direction', 'img/icons/direction.png'); // an arrow
        this.load.image('exit', 'img/icons/exit.png'); // an exit button
        this.load.image('restart', 'img/icons/restart.png'); // a restart button

        //staticly loading all the individual assets for now
        //**TO DO: change to a more general method of preloading images 
        this.load.spritesheet('sun', "img/sprites/sun_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('mercury', "img/sprites/mercury_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('venus', "img/sprites/venus_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('earth', "img/sprites/earth_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('moon', "img/sprites/moon_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('mars', "img/sprites/mars_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('jupiter', "img/sprites/jupiter_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('saturn', "img/sprites/saturn_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('uranus', "img/sprites/uranus_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('neptune', "img/sprites/neptune_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('pluto', "img/sprites/pluto_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('psyche', "img/sprites/psyche_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('psyche_probe', "img/sprites/probe_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('psyche_probe_fx', "img/sprites/fx_spritesheet.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image('psyche_probe_icon', "img/icons/arrow.png");

        // button sfx
        this.load.audio('menu', 'assets/sfx/misc_menu_4.wav');
        this.load.audio('negative', 'assets/sfx/negative.wav');
        this.load.audio('positive', 'assets/sfx/positive.wav');

        this.load.audio('ingame_music', 'assets/music/02_Ingame.mp3');
    }

    create() {
        this.initializeGraphics();
        this.initializeMusic();
        this.initializeBodies();
        this.initializeProbe();
    }

    initializeGraphics() {
        this.graphics = this.add.graphics();
        this.minigraphics = this.add.graphics();
        var logo = this.add.image(50, 50, 'logo').setScale(0.5);
        var map_border = this.add.image(880, 110, 'minimap_border').setScale(0.35);

        this.matter.world.setBounds(0, 0, 20480, 20480);

        CameraManager.initializeMainCamera(this);
        CameraManager.initializeUICamera(this);
        CameraManager.initializeMiniCamera(this);
        CameraManager.addGameSprite(this.graphics);
        CameraManager.addMinimapSprite(this.minigraphics);
        CameraManager.addUISprite(map_border);
        CameraManager.addUISprite(logo);
    }

    initializeMusic() {
        this.ingame_music = this.sound.add('ingame_music');
        if (!this.ingame_music.isPlaying) {
            this.ingame_music.play({ loop: true });
        }
    }

    initializeBodies() {
        const bodies_json = this.cache.json.get('bodies');
        for (var type in bodies_json) {
            for (var body of bodies_json[type]) {
                let id = body['id'];
                let mass = body['mass']['value'];
                let diameter = body['diameter']['value'];
                let orbit_distance = body['orbit_distance']['value'];

                if (type == "probes") {
                    this.bodies[id] = new Probe(this, id, mass, diameter);
                } else {
                    let parent = this.bodies[body['orbits']];
                    let angle = body['angle'];
                    let day_length = body['day_length']['value'];

                    this.bodies[id] = new Satellite(this, id, mass, diameter, parent, angle, orbit_distance, day_length);
                }

                this.createAnimations(id)
            }
        }

        this.bodies["earth"].subscribe(this.bodies["moon"]);
        CameraManager.setFollowSprite(this.bodies["earth"]);
    }

    initializeProbe() {
        const fx = ["thrust", "brake"]
        this.psyche_probe_fx = this.add.sprite(this.bodies["psyche_probe"].x, this.bodies["psyche_probe"].y, "psyche_probe_fx")
        this.psyche_probe_fx.setDisplaySize(this.bodies["psyche_probe"].r * 2, this.bodies["psyche_probe"].r * 2)
            .setSize(this.bodies["psyche_probe"].r * 2, this.bodies["psyche_probe"].r * 2);
        this.psyche_probe_fx.setDisplayOrigin(7, 5)
        for (let i = 0; i < 2; i++) {
            const offset = 6 * i
            this.psyche_probe_fx.anims.create({
                key: "psyche_probe_fx-" + fx[i],
                frames: this.anims.generateFrameNumbers("psyche_probe_fx", { start: offset, end: offset + 5 }),
                framerate: 12,
                repeat: -1
            })
        }

        this.psyche_probe_fx.setTexture("psyche_probe_fx", 0);
        CameraManager.addGameSprite(this.psyche_probe_fx)

        for (const body in this.bodies) {
            if (this.bodies[body].id != "psyche_probe") {
                this.bodies[body].subscribe(this.bodies["psyche_probe"]);
            }
        }

        this.player = this.bodies["psyche_probe"];
        this.controller = new Controller(this, this.player);
        this.player.setController(this.controller);
    }

    createAnimations(id) {
        for (const dir of Constants.DIRECTIONS) {
            const offset = (id == "psyche_probe" ? 14 : 16) * Constants.DIRECTIONS.indexOf(dir)
            this.anims.create({
                key: id + "-" + dir,
                frames: this.anims.generateFrameNumbers(id, {
                    start: offset,
                    end: offset + (id == "psyche_probe" ? 7 : 9)
                }),
                frameRate: 12,
                repeat: -1
            });
        }

        this.bodies[id].setTexture(id, 0);
    }
}
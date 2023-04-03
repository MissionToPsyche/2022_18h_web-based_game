const Freeplay = new Simulation(
    gamemode = "Freeplay",
    targets = [
        "mercury",
        "mars",
        "earth",
        "venus",
        "jupiter",
        "saturn",
        "uranus",
        "neptune",
        "pluto",
        "psyche"
    ],
    starting = "earth"
)
const PsycheMission = new Simulation(
    "PsycheMission",
    ["psyche"],
    "earth"
)

//creating game config object
var config = {
    type: Phaser.AUTO, //sets renderer to use WebGL where available, and canvas for everything else.
    //setting game screen size
    width: 1024,
    height: 768,
    backgroundColor: '#12031d',
    pixelArt: true,
    physics: {
        //setting physics to "matter" an engine capable of a lot of body sim tools
        default: 'matter',
        matter: {
            gravity: {
                //setting universal gravity in both x and y directions to 0
                scale: 0
            }
        }
    },
    //defining game scenes
    scene: [MainMenu, PsycheMission]
}

var game = new Phaser.Game(config);

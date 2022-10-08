const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

let gameFrame = 0;
ctx.font = '50px Georgia';

//Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect();

const mouse = {
    x:canvas.width/2,
    y:canvas.height/2,
    click: false
}

canvas.addEventListener('keyup', function(event){
    switch(event.key){
        case 'ArrowLeft':
            mouse.click = false;
            break;
        case 'ArrowRight':
            mouse.click = false;
            break;
        case 'ArrowUp':
            mouse.click = false;
            break;
        case 'ArrowDown':
            mouse.click = false;
            break;
    }
});

canvas.addEventListener('mousedown',function(event){
    mouse.click = true;
    mouse.x= event.x - canvasPosition.left;
    mouse.y= event.y - canvasPosition.top;
});
canvas.addEventListener('mouseup', function(event){
    mouse.click = false;
});

//Player
const playerLeft = new Image();
playerLeft.src = 'probe_left.png';

const playerRight = new Image();
playerRight.src = 'probe_right.png';

class Player{
    constructor(){
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 498;
        this.spriteHeight = 327;
    }
    update(){
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        let theta = Math.atan2(dy,dx);
        this.angle = theta;
        if(mouse.x != this.x){
            this.x -= dx/50;
        }
        if(mouse.y != this.y){
            this.y -= dy/50;
        }
    }
    draw(){
        if(mouse.click){
            ctx.linewidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
        }
        // ctx.fillStyle = 'red';
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // ctx.fill();
        // ctx.closePath();
        // ctx.fillRect(this.x, this.y, this.radius, 10);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if(this.x >= mouse.x){
            ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, 
                this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);
        } else{
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, 
                this.spriteWidth, this.spriteHeight, 0 - 60, 0 - 45, this.spriteWidth/4, this.spriteHeight/4);
        }
        ctx.restore();
    }
}
const player = new Player();

//Animation Loop
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    player.draw();
    requestAnimationFrame(animate);
}

animate();
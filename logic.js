const canvas = document.getElementById('sandbox');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const c = canvas.getContext('2d');

console.log(window.innerWidth);
console.log(window.innerHeight);

class Game {
    constructor() {
        this.entities = [];
        console.log('adding!')
        this.addEntity(new Player(0, 0, 10, 'red'));
    }

    draw() {
        for (var x = 0; x < this.entities.length; x++) {
            this.entities[x].draw();
        }
    }

    update(dt) {
        for (var x = 0; x < this.entities.length; x++) {
            this.entities[x].update(dt);
        }
    }
 
    addEntity(entity) {
        this.entities.push(entity);
    }
}

class Player {
    constructor(x, y, r, c) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
        this.dx = 0.04;
        this.dy = 0.04;

        let selfReference = this;

        addEventListener('keydown', function(e) {
            switch (e.key) {
                case 'ArrowLeft':
                    selfReference.dx = -1;
                    break;
                case 'ArrowRight':
                    selfReference.dx = 1;
                    break;
                case 'ArrowUp':
                    selfReference.dy = -1;
                    break;
                case 'ArrowDown':
                    selfReference.dy = 1;
                    break;
            }
        });
    }

    draw() {
        c.beginPath();
        // c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        c.fillStyle = this.c;
        c.fillRect(0, 0, 10, 10);
        c.fill();
    }

    update(dt) {
        this.draw();
        this.x += this.dx * dt;
        this.y += this.dy * dt;
    }
}

addEventListener('click', () => {
    console.log('clicked!')
})

/////////////////
// Game loop
///////////////// 

var lastTime = new Date();
var game = new Game();

function animate() {
    let now = new Date();
    let dt = now - lastTime; // ms
    lastTime = now

    // console.log(dt);
    // clear screen
    c.clearRect(0, 0, canvas.width, canvas.height);

    c.font = "30px Arial";
    c.fillText("" + window.innerWidth + " " + window.innerHeight, 10, 50);
    
    // update game
    game.update(dt);
    // draw game
    game.draw();

    requestAnimationFrame(animate);
}

animate();

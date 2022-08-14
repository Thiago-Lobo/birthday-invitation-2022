class Swipe {
    constructor(element) {
        this.xDown = null;
        this.yDown = null;
        this.element = typeof(element) === 'string' ? document.querySelector(element) : element;

        this.element.addEventListener('touchstart', function(evt) {
            this.xDown = evt.touches[0].clientX;
            this.yDown = evt.touches[0].clientY;
        }.bind(this), false);

    }

    onLeft(callback) {
        this.onLeft = callback;

        return this;
    }

    onRight(callback) {
        this.onRight = callback;

        return this;
    }

    onUp(callback) {
        this.onUp = callback;

        return this;
    }

    onDown(callback) {
        this.onDown = callback;

        return this;
    }

    handleTouchMove(evt) {
        if ( ! this.xDown || ! this.yDown ) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        this.xDiff = this.xDown - xUp;
        this.yDiff = this.yDown - yUp;

        if ( Math.abs( this.xDiff ) > Math.abs( this.yDiff ) ) { // Most significant.
            if ( this.xDiff > 0 ) {
                this.onLeft();
            } else {
                this.onRight();
            }
        } else {
            if ( this.yDiff > 0 ) {
                this.onUp();
            } else {
                this.onDown();
            }
        }
        
        this.xDown = null;
        this.yDown = null;
    }

    run() {
        this.element.addEventListener('touchmove', function(evt) {
            this.handleTouchMove(evt);
        }.bind(this), false);
    }
}

function createHiPPICanvas(w, h) {
    let ratio = window.devicePixelRatio;
    let cv = document.createElement("canvas");
    document.body.appendChild(cv);
    cv.width = w * ratio;
    cv.height = h * ratio;
    cv.style.width = w + "px";
    cv.style.height = h + "px";
    cv.getContext("2d").scale(ratio, ratio);
    return cv;
}

const canvas = createHiPPICanvas(window.innerWidth, window.innerHeight);
const swiper = new Swipe(document);
const c = canvas.getContext('2d');

var lastSwipe = 'none';

swiper.onDown(() => {
    lastSwipe = 'down';
});
swiper.onLeft(() => {
    lastSwipe = 'left';
});
swiper.onRight(() => {
    lastSwipe = 'right';
});
swiper.onUp(() => {
    lastSwipe = 'up';
});
swiper.run();

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
    c.fillText(lastSwipe, 10, 90);
    
    
    // update game
    game.update(dt);
    // draw game
    game.draw();

    requestAnimationFrame(animate);
}

animate();

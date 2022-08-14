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

function randomIntFromInterval(min, max) {
    let rand = Math.random();
    let result = Math.floor(rand * (max - min) + min);
    return result == max ? result - 1 : result;
}

function createHiPPICanvas(w, h) {
    let ratio = window.devicePixelRatio;
    let cv = document.getElementById("theCanvas");
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

const DIRECTION_DOWN = 0;
const DIRECTION_LEFT = 1;
const DIRECTION_UP = 2;
const DIRECTION_RIGHT = 3;

const WIN_SIZE = 29 + 3;

const gridWidth = window.innerWidth > 1280 ? 26 : 13;
const gridSizeX = window.innerWidth / gridWidth;
const gridSizeY = gridSizeX;
const gridHeight = Math.floor(window.innerHeight / gridSizeY);

var img = new Image();
img.src = document.getElementById('sprite1').src;

var images = document.getElementsByTagName('img'); 
var sprites = [];

for(var i = 0; i < images.length; i++) {
    let img = new Image();
    img.src = images[i].src;
    sprites.push(img);
}


class Game {
    constructor() {
        this.curvePointGrid = new Array(gridWidth);
        this.initializeGrids();
        this.player = new Player(1, 4, this);
        this.randomizeFood();

        this.initializeInput();
    }

    initializeInput() {
        let selfReference = this;

        addEventListener('keydown', function(e) {
            switch (e.key) {
                case 'ArrowLeft':
                selfReference.player.turn(DIRECTION_LEFT);
                    break;
                case 'ArrowRight':
                    selfReference.player.turn(DIRECTION_RIGHT);
                    break;
                case 'ArrowUp':
                    selfReference.player.turn(DIRECTION_UP);
                    break;
                case 'ArrowDown':
                    selfReference.player.turn(DIRECTION_DOWN);
                    break;
            }
        });

        swiper.onDown(() => {
            lastSwipe = 'down';
            selfReference.player.turn(DIRECTION_DOWN);
        });
        swiper.onLeft(() => {
            lastSwipe = 'left';
            selfReference.player.turn(DIRECTION_LEFT);
        });
        swiper.onRight(() => {
            lastSwipe = 'right';
            selfReference.player.turn(DIRECTION_RIGHT);
        });
        swiper.onUp(() => {
            lastSwipe = 'up';
            selfReference.player.turn(DIRECTION_UP);
        });

        swiper.run();
    }

    initializeGrids() {
        for (var x = 0; x < gridWidth; x++) {
            this.curvePointGrid[x] = new Array(gridHeight);
        }
    }

    draw() {

        this.player.draw();
        if (this.food) {
            this.food.draw();
        }
        if (this.animationFood) {
            this.animationFood.draw();
        }

        c.font = "20px Comic Sans MS";
        c.fillStyle = "cyan"
        c.fillText("Thiagos restantes: " + (WIN_SIZE - this.player.size), 30, 40);
    }

    update(dt) {
        this.player.update(dt);
        
        if (this.food) {
            this.food.update(dt);
        }

        if (this.animationFood) {
            this.animationFood.update(dt);
        }
    }

    startEndAnimations() {
        this.food.isEnd = true;
        this.player.isEnd = true;
    }

    end() {
        this.curvePointGrid = new Array(gridWidth);
        this.initializeGrids();

        this.player = new Player(1, 4, this);
        
        console.log("ending")
        this.animationFood = new Food(this.food.x, this.food.y, this)
        this.animationFood.sprite = this.food.sprite;
        this.animationFood.isEnd = this.food.isEnd;
        this.animationFood.width = this.food.width;
        this.animationFood.height = this.food.height;
        this.animationFood.scaleFactor = this.food.scaleFactor;
        this.animationFood.scaleFactorSpeed = this.food.scaleFactorSpeed;
        this.animationFood.doEnd = false;

        this.randomizeFood();
    }

    win() {
        this.player.isWin = true;
        this.food = null;
        setTimeout(function(){
            var fadeTarget = document.getElementById("theCanvas");
            var fadeEffect = setInterval(function () {
                if (!fadeTarget.style.opacity) {
                    fadeTarget.style.opacity = 1;
                }
                if (fadeTarget.style.opacity > 0) {
                    fadeTarget.style.opacity -= 0.01;
                } else {
                    fadeTarget.style.visibility = 'none';
                    fadeTarget.remove()
                    clearInterval(fadeEffect);
                }
            }, 20);
        },0.5);
    }

    randomizeFood() {
        let foodX = randomIntFromInterval(1, gridWidth - 1);
        let foodY = randomIntFromInterval(1, gridHeight - 1);
        
        
        while (this.player.checkDeath(foodX, foodY)) {
            foodX = randomIntFromInterval(1, gridWidth - 1);
            foodY = randomIntFromInterval(1, gridHeight - 1);
        }
        
        this.food = new Food(foodX, foodY, this);
    }
}

class Food {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.sprite = sprites[randomIntFromInterval(0, sprites.length)];
        this.isEnd = false;
        this.doEnd = true;
        this.scaleFactor = 1.2;
        this.game = game;
        this.scaleFactorSpeed = 12;
    }

    draw() {
        let xOffset = this.x * gridSizeX + gridSizeX / 2;
        let yOffset = this.y * gridSizeY + gridSizeY / 2;
        let rotationScale = Math.sin(2 * Math.PI * 0.8 * Date.now() / 1000) * Math.PI / 7;

        c.translate(xOffset, yOffset);
        c.rotate(rotationScale);
        c.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        c.rotate(-rotationScale);
        c.translate(-xOffset, -yOffset);
    
    }

    update(dt) {
        this.aspectCorrectionFactor = gridSizeX / this.sprite.width;
        if (this.sprite.width > this.sprite.height) {
            this.aspectCorrectionFactor = gridSizeY / this.sprite.height;
        }

        this.width = this.sprite.width * this.aspectCorrectionFactor * this.scaleFactor;
        this.height = this.sprite.height * this.aspectCorrectionFactor * this.scaleFactor;

        if (this.isEnd) {
            let dx = window.innerWidth / 2 - (this.x * gridSizeX);
            let dy = window.innerHeight / 2 - (this.y * gridSizeX);
            let moveX = true;
            let moveY = true;

            if (Math.abs(dy) < 10) {
                moveY = false;
            }

            if (Math.abs(dx) < 10) {
                moveX = false;
            }

            let normalizingFactor = Math.sqrt(dx * dx + dy * dy);
            dx = dx / normalizingFactor;
            dy = dy / normalizingFactor;

            if (moveX) {
                this.x += dx * dt * 0.007;
            }
            if (moveY) {
                this.y += dy * dt * 0.007;
            }

            if (!moveX && !moveY) {
                this.scaleFactor += this.scaleFactorSpeed * dt / 1000;
                if (this.scaleFactor >= 30 && this.doEnd) {
                    console.log("calling end")
                    this.scaleFactorSpeed *= -6;
                    this.game.end();
                }
                if (this.scaleFactor < 0) {
                    this.game.animationFood = null;
                }
            }
        }
    }
}

class PlayerCurvePoint {
    constructor(x, y, direction_before, direction_after) {
        this.x = x;
        this.y = y;
        this.direction_before = direction_before;
        this.direction_after = direction_after;
    }

    draw() {
        c.beginPath();
        c.fillStyle = 'blue';
        c.fillRect(this.x * gridSizeX, this.y * gridSizeY, gridSizeX, gridSizeY);
        c.fill();
    }
}

class PlayerPiece {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Player {
    constructor(x, y, game) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.timePerStep = 200; // ms per step
        this.stepTimer = 0;
        this.direction = DIRECTION_DOWN;
        this.size = 3;
        this.lastStepDirection = DIRECTION_DOWN;
        this.playerPieces = [];
        this.updatePlayerPieces();
        this.isEnd = false;
        this.isWin = false;
        this.color = '#f58442'
        this.headColor = '#125c21'
    }

    turn (direction) {
        let oppositeDirection = (direction + 2) % 4;

        if (this.lastStepDirection != oppositeDirection) {
            this.direction = direction;
        }
    }

    draw() {
        for (var n = 0; n < this.playerPieces.length; n++) {
            var piece = this.playerPieces[n]

            c.beginPath();
            c.fillStyle = this.color;
            if (n == 0) {
                c.fillStyle = this.headColor;
            }

            if ((this.isEnd || this.isWin) && ((Date.now()) % 300 > 150)) {
                c.fillStyle = 'white';
            }

            c.fillRect(piece.x * gridSizeX, piece.y * gridSizeY, gridSizeX, gridSizeY);
            c.fill();
        }
    }

    update(dt) {
        if (!this.isEnd && !this.isWin) {
            this.stepTimer += dt;
    
            if (this.stepTimer >= this.timePerStep) {
                let dx = this.direction == DIRECTION_LEFT ? -1 : (this.direction == DIRECTION_RIGHT ? 1 : 0);
                let dy = this.direction == DIRECTION_UP ? -1 : (this.direction == DIRECTION_DOWN ? 1 : 0);
                
                if (this.direction != this.lastStepDirection) {
                    this.game.curvePointGrid[this.x][this.y] = new PlayerCurvePoint(this.x, this.y, this.lastStepDirection, this.direction);
                }
                
                this.x += dx;
                this.y += dy;
                
                if (this.checkDeath(this.x, this.y)) {
                    this.die();
                    return;
                }
    
                this.lastStepDirection = this.direction;
                this.updatePlayerPieces();
                this.tryEat(this.x, this.y);
                
                this.stepTimer = 0;
            }
        }
    }

    updatePlayerPieces() {
        let newPieces = [];

        let x = this.x;
        let y = this.y;
        let direction = (this.lastStepDirection + 2) % 4;
        let dx = direction == DIRECTION_LEFT ? -1 : (direction == DIRECTION_RIGHT ? 1 : 0);
        let dy = direction == DIRECTION_UP ? -1 : (direction == DIRECTION_DOWN ? 1 : 0);

        for (var n = 0; n < this.size; n++) {
            newPieces.push(new PlayerPiece(x, y))
            x += dx;
            y += dy;
            
            if (this.game.curvePointGrid[x][y]) {
                direction = (this.game.curvePointGrid[x][y].direction_before + 2) % 4;
                dx = direction == DIRECTION_LEFT ? -1 : (direction == DIRECTION_RIGHT ? 1 : 0);
                dy = direction == DIRECTION_UP ? -1 : (direction == DIRECTION_DOWN ? 1 : 0);
                
                if (n == this.size - 1) {
                    this.game.curvePointGrid[x][y] = null;
                }
            }
        }
        
        this.playerPieces = newPieces;
    }
    
    tryEat(x, y) {
        if (this.game.food.x == x && this.game.food.y == y) {
            this.size += 1;

            if (this.size >= WIN_SIZE) {
                this.game.win();
                return;
            }

            this.timePerStep -= 2;
            this.game.randomizeFood();
        }
    }

    checkDeath(x, y) {
        if (x >= gridWidth || y >= gridHeight || y < 0 || x < 0) {
            return true;
        }
        
        for (var n = 0; n < this.playerPieces.length; n++) {
            var piece = this.playerPieces[n];
            
            if (x == piece.x && y == piece.y) {
                return true;
            }
        }

        return false;
    }

    die() {
        this.game.startEndAnimations();
    }
}

/////////////////
// Game loop
///////////////// 

var lastTime = new Date();
var game = new Game();
// game.win();

function animate() {
    let now = new Date();
    let dt = now - lastTime; // ms
    lastTime = now

    // console.log(dt);
    // clear screen
    c.clearRect(0, 0, canvas.width, canvas.height);

    // update game
    game.update(dt);
    // draw game
    game.draw();

    requestAnimationFrame(animate);
}

animate();

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

const DIRECTION_DOWN = 0;
const DIRECTION_LEFT = 1;
const DIRECTION_UP = 2;
const DIRECTION_RIGHT = 3;

const gridWidth = 10;
const gridHeight = 10;

const gridSizeX = 30;
const gridSizeY = 30;

class Game {
    constructor() {
        this.foodGrid = new Array(gridWidth);
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
            this.foodGrid[x] = new Array(gridHeight);
        }
    }

    draw() {
        for (var x = 0; x < gridWidth + 1; x++) {
            c.beginPath();
            c.strokeStyle = 'yellow';
            c.moveTo(x * gridSizeX, 0);
            c.lineTo(x * gridSizeX, gridHeight * gridSizeY);
            c.stroke()
        }

        for (var y = 0; y < gridHeight + 1; y++) {
            c.beginPath();
            c.strokeStyle = 'yellow';
            c.moveTo(0, y * gridSizeY);
            c.lineTo(gridWidth * gridSizeX, y * gridSizeY);
            c.stroke()
        }

        // for (var x = 0; x < this.entities.length; x++) {
        //     this.entities[x].draw();
        // }

        this.player.draw();

        for (var x = 0; x < this.curvePointGrid.length; x++) {
            for (var y = 0; y < this.curvePointGrid[x].length; y++) {
                if (this.curvePointGrid[x][y]) {
                    this.curvePointGrid[x][y].draw();
                }
            }
        }

        for (var x = 0; x < this.foodGrid.length; x++) {
            for (var y = 0; y < this.foodGrid[x].length; y++) {
                if (this.foodGrid[x][y]) {
                    this.foodGrid[x][y].draw();
                }
            }
        }
    }

    update(dt) {
        this.player.update(dt);
    }

    end() {
        this.foodGrid = new Array(gridWidth);
        this.curvePointGrid = new Array(gridWidth);
        this.initializeGrids();
        this.player = new Player(1, 4, this);
        this.randomizeFood();
    }

    randomizeFood() {
        let foodX = randomIntFromInterval(0, gridWidth);
        let foodY = randomIntFromInterval(0, gridHeight);
        
        
        while (this.player.checkDeath(foodX, foodY)) {
            foodX = randomIntFromInterval(0, gridWidth);
            foodY = randomIntFromInterval(0, gridHeight);
        }
        
        this.foodGrid[foodX][foodY] = new Food(foodX, foodY);
    }
}

class Food {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw() {
        c.beginPath();
        c.fillStyle = 'green';
        c.fillRect(this.x * gridSizeX, this.y * gridSizeY, gridSizeX, gridSizeY);
        c.fill();
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
        this.timePerStep = 150; // ms per step
        this.stepTimer = 0;
        this.direction = DIRECTION_DOWN;
        this.size = 5;
        this.lastStepDirection = DIRECTION_DOWN;
        this.playerPieces = [];
        this.updatePlayerPieces();
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
            c.fillStyle = 'red';
            c.fillRect(piece.x * gridSizeX, piece.y * gridSizeY, gridSizeX, gridSizeY);
            c.fill();
        }
    }

    update(dt) {
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
        if (this.game.foodGrid[x][y]) {
            this.size += 1;
            this.game.foodGrid[x][y] = null;
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
        // this.timePerStep = 1000000000000000000000000000000000;
        this.game.end();
    }
}

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

    // update game
    game.update(dt);
    // draw game
    game.draw();
    
    c.font = "30px Arial";
    c.fillStyle = "cyan"
    c.fillText("" + window.innerWidth + " " + window.innerHeight, 10, 50);
    c.fillText(lastSwipe, 10, 90);

    requestAnimationFrame(animate);
}

animate();

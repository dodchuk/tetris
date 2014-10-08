'use strict';

// global variables
var time;
var speed = 400;
var play;
var fallingShape;
var nextShape;
var canvas;
var canvasWidth;
var canvasHeight;
var context;

// shape letters
var shapes = [

    // I
    [[0, 1, 0, 0],
     [0, 1, 0, 0],
     [0, 1, 0, 0],
     [0, 1, 0, 0]],

    // SQUARE
    [[0, 0, 0, 0],
     [0, 1, 1, 0],
     [0, 1, 1, 0],
     [0, 0, 0, 0]],

    // T
    [[0, 0, 0, 0],
     [0, 1, 0, 0],
     [1, 1, 1, 0],
     [0, 0, 0, 0]],

    // L
    [[0, 0, 0, 0],
     [0, 1, 0, 0],
     [0, 1, 0, 0],
     [0, 1, 1, 0]],

    // L reverse
    [[0, 0, 0, 0],
     [0, 0, 1, 0],
     [0, 0, 1, 0],
     [0, 1, 1, 0]],

    // S
    [[0, 0, 0, 0],
     [0, 0, 1, 0],
     [0, 1, 1, 0],
     [0, 1, 0, 0]],

    // S reverse
    [[0, 0, 0, 0],
     [0, 1, 0, 0],
     [0, 1, 1, 0],
     [0, 0, 1, 0]]
];



function Shape() {
    this.x = 4;
    this.y = 0;
}

Shape.prototype = {

    init: function() {
        var rotation = Math.floor(Math.random() * 4);

        // generate random shape
        var randomShape = Math.floor(Math.random() * shapes.length);
        this.shape = shapes[randomShape];

        for(var i = 0; i < rotation; i++) {
            this.rotate();
        }
    },

    // gettin next shape
    getNextShape: function() {

        // initialize shape
        nextShape = new Shape();
        nextShape.init();

        // nextShape is now became our fallingShape
        fallingShape = nextShape;

        // when shape goes outside board, game over
        if(this.collision(fallingShape)) {
            Tetris.gameOver();
        }
    },

    // creating new rotated shape
    rotate: function() {

        console.log(this.shape);

        var shapeSize = 4,
            rotatedShape = {};
        
        rotatedShape.shape = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        
        // go through each array in shape array
        for(var y = 0; y < shapeSize; y++) {
            for(var x = 0; x < shapeSize; x++) {
                // new array = len - val of pos of current (-1 for 0-index)
                rotatedShape.shape[x][y] = this.shape[shapeSize - y - 1][x];
            }
        }

        rotatedShape.x = fallingShape.x;
        rotatedShape.y = fallingShape.y;

        if(!this.collision(rotatedShape)) { 
            this.shape = rotatedShape.shape;
        }

        if(this.x + this.leftEdge() < 0) {
            this.x = 0;
        }

        if(this.x + this.rightEdge() >= Board.width) {
            this.x = Board.width - this.rightEdge() - 1;
        }

    },

    // check edges
    // left, right, bottom

    leftEdge: function() {
        for(var y = 0; y < this.shape.length; y++) {
            for(var x = 0; x < this.shape[y].length; x++) {
                // check vertical first! 
                if(this.shape[x][y] !== 0) {
                    return y;
                }
            }
        }
    },

    rightEdge: function() {
        // start at top right
        for(var x = 3; x >= 0; x--) {
            for(var y = 0; y < 4; y++) {
                if(this.shape[y][x] !== 0) {
                    return x;
                }
            }
        }
    },

    bottomEdge: function() {
        for(var y = 3; y >= 0; y--) {
            for(var x = 0; x < this.shape[y].length; x++) {
                if(this.shape[y][x] !== 0) {
                    // return row
                    return y;
                }
            }
        }
    },


    // move shape
    // left, right, down

    moveLeft: function() {
        this.x--;
        if((this.x + this.leftEdge()) < 0 || this.collision(this)) {
            this.x++;
        }
    },

    moveRight: function() {
        this.x++;
        if((this.x + this.rightEdge()) >= Board.width || this.collision(this)) {
            this.x--;
        }
    },

    moveDown: function() {
        this.y++;
        if((this.bottomEdge() + this.y >= Board.height) || this.collision(this)) {
            this.y--;

            // move shape onto board
            Board.update();
            // when shape dropped, go to the next
            this.getNextShape();       
        }
    },


    // detect shape collision
    collision: function(piece) {
        for(var y = 0; y < 4; y++) {
            for(var x = 0; x < 4; x++) {
                if(piece.shape[y][x] !== 0) {
                    if(Board.board[y + piece.y][x + piece.x]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}




function Board() {
    this.x = 0;
    this.y = 0;
    this.height = 30;
    this.width = 15;
    this.board = [];
}


Board.prototype = {

    init: function() {
        this.board = [];
        for(var y = 0; y < this.height; y++) {
            var row = [];
            for(var x = 0; x < this.width; x++) {
                row.push(0);
            }
            this.board.push(row);
        }
    },

    // update falling shape onto board
    update: function() {
        for(var y = 0; y < fallingShape.shape.length; y++) {
            for(var x = 0; x < fallingShape.shape[y].length; x++) {
                if(fallingShape.shape[y][x] !== 0) {
                    this.board[y + fallingShape.y][x + fallingShape.x] = fallingShape.shape[y][x];
                }
            }
        }
        
        this.checkLines();
    },

    // check, if the line is filled 
    checkLines: function() {
        for(var y = this.height - 1; y >= 0; y--) {
            var i = 0;
            for(var x = 0; x < Board.width; x++) {
                if(this.board[y][x] !== 0) {
                    i++;
                }
            }
            // if line full
            if(i === this.width) {
                this.removeLine(y);
                return true;
            }
        }
        return false;
    },

    // remove filled lines
    removeLine: function(row) {
        // remove all pieces from row
        // move pieces above down 1 row
        for(var y = row - 1; y >= 0; y--) {
            for(var x = 0; x < this.width; x++) {
                this.board[y + 1][x] = Board.board[y][x];
            }
        }

    },

    // draw whatever you want
    render: function(x, y, blockType) {

        // canvas tile block size
        var blockSize = 20;
        
        
        //  board width * block size = 600 
        //  board height * block size = 300
        //  or
        //  calculate current X/Y position of fallingShape and draw this on board

        x *= blockSize; 
        y *= blockSize;  


        switch(blockType) {
            case 0:
                context.fillStyle = "#fafafa"; // board color
                break;
            default:
                context.fillStyle = '#000'; // item color
                break;
        }

        // start canvas drawing
        context.beginPath();
        context.fillRect(x, y, blockSize, blockSize);
        context.fill();
        context.stroke();
        context.closePath();
    }

}



var Tetris = {

    init: function(element) {
        canvas = document.getElementById(element); // get canvas element
        context = canvas.getContext('2d'); // get canvas context

        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        Board = new Board();
        fallingShape = new Shape();
        nextShape = new Shape();

        Board.init();
        fallingShape.init();
        nextShape.init();

        time = new Date().getTime();


        play = setInterval(function() {
            
            // let shape fall itself on board
            var delta = new Date().getTime() - time;
            if(delta >= speed) {
                
                // start move down
                fallingShape.moveDown();
                time = new Date().getTime();
                delta = 0;
            }

            // clear canvas
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            // start draw


            // draw board
            for(var y = 0; y < Board.board.length; y++) {
                var row = Board.board[y];
                for(var x = 0; x < row.length; x++) {
                    Board.render(x, y, row[x]);    
                }
            }

            // draw the shape 
            for(var y = 0; y < fallingShape.shape.length; y++) {
                for(var x = 0; x < fallingShape.shape[y].length; x++) {
                    if(fallingShape.shape[y][x] !== 0) {
                        Board.render(x + fallingShape.x, y + fallingShape.y, fallingShape.shape[y][x]);
                    }
                }
            }


        }, 20);

        // 20 
        // interval of clearing board for draw new position of shape 

    },

    gameOver: function() {
        clearTimeout(play);
        alert("Game Over");
    },

    keyDown: function(event) {
        switch(Tetris.getKeyCode(event)) {
            // UP
            case 38:
                fallingShape.rotate();
                break;
            // LEFT
            case 37:
                fallingShape.moveLeft();
                break;
            // RIGHT
            case 39:
                fallingShape.moveRight();
                break;
            // DOWN
            case 40:
                fallingShape.moveDown();
                break;
        }
    },

    getKeyCode: function(event) {
        var keycode;

        if (window.event) {
            keycode = window.event.keyCode;
        } else if (event) {
            keycode = event.which;
        }

        return keycode;
    }

};



// initialize
Tetris.init("canvas");

// initialize keyboard control
document.onkeydown = function(event){   
    Tetris.keyDown.call(this, event);
}
let gameSate = 'notStarted';
let maxPoints = 2;

let paddle1 = document.getElementById('paddle1');
let paddle2 = document.getElementById('paddle2');
let player1Score = document.getElementById('player_1_score');
let player2Score = document.getElementById('player_2_score');
let message = document.getElementById('message');
let ballDoc = document.getElementById('ball');
let board = document.getElementById('board');
let positionBoard = board.getBoundingClientRect();

const Direction = {
    UP:  -1,
    DOWN: 1
}

class Player {
    constructor(paddle, position, score) {
        this.paddle = paddle;
        this.speed = 20;
        this.score = 0;
        this.scoreDoc = score;
        this.top = position.top;
        this.left = position.left;
        this.right = position.right;
        this.bottom = position.bottom;
        this.height = position.height;
        this.width = position.width;
        this.centerY = position.top + position.height / 2;
    }

    move(way) {
        if (gameSate === 'notStarted')
            return;

        if (way === Direction.UP && this.top - this.speed < positionBoard.top
            || way === Direction.DOWN && this.bottom + this.speed > positionBoard.bottom)
                return ;

        this.top += this.speed * way;
        this.bottom += this.speed * way;
        this.centerY += this.speed * way;
        this.paddle.style.top = this.top + "px";
    }
}

class Ball {
    constructor(ball, position) {
        this.ball = ball;
        this.speed = 3;
        this.top = position.top;
        this.left = position.left;
        this.right = position.right;
        this.bottom = position.bottom;
        this.height = position.height;
        this.width = position.width;
        this.centerY = position.top + position.height / 2;
        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : 1 * this.speed;
        this.directionY = 0;
    }

    move() {
        this.top += this.directionY * this.speed;
        this.left += this.directionX * this.speed;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
        this.centerY = this.top + this.height / 2;
        this.ball.style.left = this.left + "px";
        this.ball.style.top = this.top + "px";
    }
}

player1 = new Player(paddle1, paddle1.getBoundingClientRect(), player1Score);
player2 = new Player(paddle2, paddle2.getBoundingClientRect(), player2Score);
ball = new Ball(ballDoc, ballDoc.getBoundingClientRect());

document.addEventListener('keydown', keyDownEvent);

function keyDownEvent(event) {
    // console.log(event);
    switch (event.key) {
        case 'Enter':
            startGame();
            break;
        case 'w':
            player1.move(Direction.UP);
            break;
        case 's':
            player1.move(Direction.DOWN);
            break;
        case 'ArrowUp':
            player2.move(Direction.UP);
            break;
        case 'ArrowDown':
            player2.move(Direction.DOWN);
            break;
        default:
            break;
    }
};

function replacePaddle() {
    player1.top = positionBoard.top + (positionBoard.bottom - positionBoard.top) / 2 - player1.height / 2;
    player1.bottom = player1.top + player1.height;
    player1.centerY = player1.top + player1.height / 2;
    player1.paddle.style.top = player1.top + "px";

    player2.top = positionBoard.top + (positionBoard.bottom - positionBoard.top) / 2 - player2.height / 2;
    player2.bottom = player2.top + player2.height;
    player2.centerY = player2.top + player2.height / 2;
    player2.paddle.style.top = player2.top + "px";
}

function replaceBall() {
    ball.top = positionBoard.top + (positionBoard.bottom - positionBoard.top) / 2;
    ball.left = positionBoard.left + (positionBoard.right - positionBoard.left) / 2;
    ball.ball.style.left = ball.left + "px";
    ball.ball.style.top = ball.top + "px";

    ball.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * ball.speed : 1 * ball.speed;
    ball.directionY = 0;
}

function resetGame() {
    player1.score = 0;
    player2.score = 0;
    player1.scoreDoc.innerHTML = '' + player1.score;
    player2.scoreDoc.innerHTML = '' + player2.score;
    replacePaddle();
}

function getPoint(whoScore) {
    if (whoScore === '1') {
        player1.score++;
        if (player1.score === maxPoints) {
            message.innerHTML = 'Player 1 win / Enter to restart';
            gameSate = 'notStarted';
            resetGame();
            return 1;
        }
        player1.scoreDoc.innerHTML = '' + player1.score;
    } else {
        player2.score++;
        if (player2.score === maxPoints) {
            message.innerHTML = 'Player 2 win / Enter to restart';
            gameSate = 'notStarted';
            resetGame();
            return 1;
        }
        player2.scoreDoc.innerHTML = '' + player2.score;
    }
    replaceBall();
    return 0;
}

function getNewDirection(hit) {
    if (hit === 'left') {
        ball.directionY = Math.acos((player1.centerY - ball.centerY) / 100) - Math.PI / 2;
        ball.directionX = ball.speed + Math.abs(ball.directionY);
    } else {
        ball.directionY = Math.acos((player2.centerY - ball.centerY) / 100) - Math.PI / 2;
        ball.directionX = -ball.speed - Math.abs(ball.directionY);
    }
}

function moveBall() {
    // if the ball touch the top or bottom of the board
    if (ball.top <= positionBoard.top) {
        ball.directionY = -ball.directionY;
    }
    if (ball.bottom >= positionBoard.bottom) {
        ball.directionY = -ball.directionY;
    }

    // if the ball touch the left or right of the board
    if (ball.left <= positionBoard.left) {
        if (getPoint('2'))
            return ;
    }
    if (ball.right >= positionBoard.right) {
        if (getPoint('1'))
            return ;
    }

    // if the ball touch the left or right paddle
    if (ball.left <= player1.right
        && ball.bottom >= player1.top
        && ball.top <= player1.bottom
        && ball.left >= player1.left) {
        getNewDirection('left');
    }
    if (ball.right >= player2.left
        && ball.bottom >= player2.top
        && ball.top <= player2.bottom
        && ball.right <= player2.right) {
        getNewDirection('right');
    }

    // if the ball the top or bottom of the paddle
    if ((ball.top <= player1.bottom
        || ball.bottom >= player1.top)
        && ball.left <= player1.right
        && ball.right >= player1.left) {
        ball.directionY = -ball.directionY;
    }
    if ((ball.bottom >= player2.top
        || ball.top <= player2.bottom)
        && ball.left <= player2.right
        && ball.right >= player2.left) {
        ball.directionY = -ball.directionY;
    }

    ball.move();
    setTimeout(moveBall, 10);
}

function startGame() {
    if (gameSate === 'notStarted') {
        gameSate = 'started';
        message.innerHTML= 'Game is running';
        moveBall();
    }
}

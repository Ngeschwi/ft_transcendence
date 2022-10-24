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

class Player {
    constructor(paddle, position, score) {
        this.paddle = paddle;
        this.score = 0;
        this.scoreDoc = score;
        this.positionTop = position.top;
        this.positionLeft = position.left;
        this.positionRight = position.right;
        this.positionBottom = position.bottom;
    }

    movePaddleUp() {
        this.positionTop -= 15;
        this.paddle.style.top = this.positionTop + "px";
    }

    movePaddleDown() {
        this.positionTop += 15;
        this.paddle.style.top = this.positionTop + "px";
    }
}

class Ball {
    constructor(ball, position) {
        this.ball = ball;
        this.speed = 2;
        this.positionTop = position.top;
        this.positionLeft = position.left;
        this.directionX = 0;
        this.directionY = 0;

        while (this.directionX === 0 || this.directionY === 0) {
            this.directionX = Math.floor(Math.random() * 10) - 5;
            this.directionY = Math.floor(Math.random() * 10) - 5;
        }
    }

    move() {
        this.positionTop += this.directionY * this.speed;
        this.positionLeft += this.directionX * this.speed;
        this.ball.style.left = this.positionLeft + "px";
        this.ball.style.top = this.positionTop + "px";
    }
}

player1 = new Player(paddle1, paddle1.getBoundingClientRect(), player1Score);
player2 = new Player(paddle2, paddle2.getBoundingClientRect(), player2Score);
ball = new Ball(ballDoc, ballDoc.getBoundingClientRect());

document.addEventListener('keydown', keyDownEvent);

function keyDownEvent(event) {
    console.log(event);
    switch (event.key) {
        case 'Enter':
            startGame();
            break;
        case 'w':
            player1.movePaddleUp();
            break;
        case 's':
            player1.movePaddleDown();
            break;
        case 'ArrowUp':
            player2.movePaddleUp();
            break;
        case 'ArrowDown':
            player2.movePaddleDown();
            break;
        default:
            break;
    }
};

function replaceBall() {
    ball.positionTop = positionBoard.top + (positionBoard.bottom - positionBoard.top) / 2;
    ball.positionLeft = positionBoard.left + (positionBoard.right - positionBoard.left) / 2;
    ball.ball.style.left = ball.positionLeft + "px";
    ball.ball.style.top = ball.positionTop + "px";

    ball.directionX = 0;
    ball.directionY = 0;

    while (ball.directionX === 0 || ball.directionY === 0) {
        ball.directionX = Math.floor(Math.random() * 10) - 5;
        ball.directionY = Math.floor(Math.random() * 10) - 5;
    }
}

function resetGame() {
    player1.score = 0;
    player2.score = 0;
    player1.scoreDoc.innerHTML = '' + player1.score;
    player2.scoreDoc.innerHTML = '' + player2.score;
    replaceBall();
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

function moveBall() {
    if (ball.positionTop <= positionBoard.top) {
        ball.directionY = -ball.directionY;
    }
    if (ball.positionTop + 30 >= positionBoard.bottom) {
        ball.directionY = -ball.directionY;
    }
    if (ball.positionLeft <= positionBoard.left) {
        if (getPoint('2'))
            return ;
    }
    if (ball.positionLeft + 30 >= positionBoard.right) {
        if (getPoint('1'))
            return ;
    }

    if (ball.positionLeft <= player1.positionRight
        && ball.positionTop >= player1.positionTop
        && ball.positionTop + 30 <= player1.positionBottom) {
        ball.directionX = -ball.directionX;
    }
    if (ball.positionLeft + 30 >= player2.positionLeft
        && ball.positionTop >= player2.positionTop
        && ball.positionTop + 30 <= player2.positionBottom) {
        ball.directionX = -ball.directionX;
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

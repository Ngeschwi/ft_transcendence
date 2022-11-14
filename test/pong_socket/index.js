// ----- Init Server -----

const express = require('express');
const app = express();
const http = require('http');
const index = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(index);

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/pong.html');
});

io.on('connection', function(client) {
    console.log('Client connected...');
    client.on('join', function(data) {
        console.log(data);
        client.emit('messages', 'Hello from index');
    });
});

index.listen(3000, () => {
    console.log('Server is running on port 3000 ...');
});

// ----- Init Pong -----

// let gameSate = 'notStarted';
// let maxPoints = 10;
//
// let paddle1 = document.getElementById('paddle1');
// let paddle2 = document.getElementById('paddle2');
// let player1Score = document.getElementById('player_1_score');
// let player2Score = document.getElementById('player_2_score');
// let message = document.getElementById('message');
// let ballDoc = document.getElementById('ball');
// let board = document.getElementById('board');
// let positionBoard = board.getBoundingClientRect();
//
// const Direction = {
//     UP:  -1,
//     DOWN: 1
// }
//
// const Do = {
//     CONTINUE: 0,
//     END: 1
// }
//
// let keyPress = {};
//
// class Player {
//     constructor(paddle, position, score, id) {
//         this.id = id;
//         this.paddle = paddle;
//         this.speed = 10;
//         this.score = 0;
//         this.scoreDoc = score;
//         this.top = position.top;
//         this.left = position.left;
//         this.right = position.right;
//         this.bottom = position.bottom;
//         this.height = position.height;
//         this.width = position.width;
//         this.centerY = position.top + position.height / 2;
//     }
//
//     move(way) {
//         if (((keyPress['w'] || keyPress['ArrowUp']) && this.top - this.speed < positionBoard.top)
//             || ((keyPress['s'] || keyPress['ArrowDown']) && this.bottom + this.speed > positionBoard.bottom))
//             return ;
//
//         this.top += this.speed * way;
//         this.bottom += this.speed * way;
//         this.centerY += this.speed * way;
//         this.paddle.style.top = this.top + "px";
//     }
//
//     resetPlace() {
//         this.top = positionBoard.top + (positionBoard.bottom - positionBoard.top) / 2 - this.height / 2;
//         this.bottom = this.top + this.height;
//         this.centerY = this.top + this.height / 2;
//         this.paddle.style.top = this.top + "px";
//     }
// }
//
// class Ball {
//     constructor(ball, position) {
//         this.ball = ball;
//         this.speed = 3;
//         this.top = position.top;
//         this.left = position.left;
//         this.right = position.right;
//         this.bottom = position.bottom;
//         this.height = position.height;
//         this.width = position.width;
//         this.centerY = position.top + position.height / 2;
//         this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
//         this.directionY = 0;
//     }
//
//     move() {
//         this.top += this.directionY * this.speed;
//         this.left += this.directionX * this.speed;
//         this.right = this.left + this.width;
//         this.bottom = this.top + this.height;
//         this.centerY = this.top + this.height / 2;
//         this.ball.style.left = this.left + "px";
//         this.ball.style.top = this.top + "px";
//     }
//
//     resetPlace() {
//         this.top = positionBoard.top + (positionBoard.bottom - positionBoard.top) / 2;
//         this.left = positionBoard.left + (positionBoard.right - positionBoard.left) / 2;
//         this.right = this.left + this.width;
//         this.bottom = this.top + this.height;
//         this.ball.style.left = this.left + "px";
//         this.ball.style.top = this.top + "px";
//
//         this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
//         this.directionY = 0;
//     }
// }
//
// player1 = new Player(paddle1, paddle1.getBoundingClientRect(), player1Score, 1);
// player2 = new Player(paddle2, paddle2.getBoundingClientRect(), player2Score, 1);
// ball = new Ball(ballDoc, ballDoc.getBoundingClientRect());
//
// document.addEventListener('keydown', keyDownEvent);
// document.addEventListener('keyup', keyUpEvent);
//
// function keyDownEvent(event) {
//     // console.log(event);
//     keyPress[event.key] = true;
//     if (event.key === 'Enter') {
//         startGame();
//     }
// }
//
// function keyUpEvent(event) {
//     keyPress[event.key] = false;
// }
//
// function getPoint(whoScore) {
//     if (whoScore === 'left') {
//         player1.score++;
//         player1.scoreDoc.innerHTML = '' + player1.score;
//         if (player1.score === maxPoints) {
//             message.innerHTML = 'Player 1 win / Enter to restart';
//             gameSate = 'notStarted';
//             return Do.END;
//         }
//     } else{
//         player2.score++;
//         player2.scoreDoc.innerHTML = '' + player2.score;
//         if (player2.score === maxPoints) {
//             message.innerHTML = 'Player 2 win / Enter to restart';
//             gameSate = 'notStarted';
//             return Do.END;
//         }
//     }
//     ball.resetPlace();
//     return Do.CONTINUE;
// }
//
// function getNewDirection(hit) {
//     if (hit === 'left') {
//         ball.directionY = Math.tan((ball.centerY - player1.centerY) / (player1.height / 2)) * 2;
//         ball.directionX = ball.speed + (Math.abs(ball.directionY) / 2);
//     } else {
//         ball.directionY = Math.tan((ball.centerY - player2.centerY) / (player2.height / 2)) * 2;
//         ball.directionX = -ball.speed - (Math.abs(ball.directionY) / 2);
//     }
//     ball.move();
//     setTimeout(moveBall, 10);
// }
//
// function movePaddle() {
//     if (keyPress['w']) {
//         player1.move(Direction.UP);
//     }
//     if (keyPress['s']) {
//         player1.move(Direction.DOWN);
//     }
//     if (keyPress['ArrowUp']) {
//         player2.move(Direction.UP);
//     }
//     if (keyPress['ArrowDown']) {
//         player2.move(Direction.DOWN);
//     }
// }
//
// function moveBall() {
//     // if the ball touch the left or right of the board
//     if (ball.left <= positionBoard.left) {
//         if (getPoint('right'))
//             return Do.END;
//     }
//     if (ball.right >= positionBoard.right) {
//         console.log("player1.score", player1.score);
//         if (getPoint('left'))
//             return Do.END;
//         console.log("player1.score", player1.score);
//     }
//
//     // if the ball touch the left or right paddle
//     if (ball.left <= player1.right
//         && ball.bottom >= player1.top
//         && ball.top <= player1.bottom
//         && ball.left >= player1.left) {
//         getNewDirection('left');
//         return Do.CONTINUE;
//     }
//     if (ball.right >= player2.left
//         && ball.bottom >= player2.top
//         && ball.top <= player2.bottom
//         && ball.right <= player2.right) {
//         getNewDirection('right');
//         return Do.CONTINUE;
//     }
//
//     // if the ball touch the top or bottom of the board
//     if (ball.top <= positionBoard.top) {
//         ball.directionY = -ball.directionY;
//     }
//     if (ball.bottom >= positionBoard.bottom) {
//         ball.directionY = -ball.directionY;
//     }
//
//     // if the ball the top or bottom of the paddle
//     if ((ball.top <= player1.bottom
//         || ball.bottom >= player1.top)
//         && ball.left <= player1.right
//         && ball.right >= player1.left) {
//         ball.directionY = -ball.directionY;
//     }
//     if ((ball.bottom >= player2.top
//         || ball.top <= player2.bottom)
//         && ball.left <= player2.right
//         && ball.right >= player2.left) {
//         ball.directionY = -ball.directionY;
//     }
//
//     ball.move();
// }
//
// function moveAll() {
//     if (moveBall() === Do.END)
//         return ;
//     movePaddle();
//     setTimeout(moveAll, 10);
// }
//
// function resetGame() {
//     console.log('reset');
//     player1.score = 0;
//     player2.score = 0;
//     player1.scoreDoc.innerHTML = '' + player1.score;
//     player2.scoreDoc.innerHTML = '' + player2.score;
//     player1.resetPlace();
//     player2.resetPlace();
//     ball.resetPlace();
// }
//
// function startGame() {
//     if (gameSate === 'notStarted') {
//         gameSate = 'started';
//         message.innerHTML= 'Game is running';
//         resetGame();
//         moveAll();
//     }
// }

let paddle1 = document.querySelector('.paddle1');
let paddle2 = document.querySelector('.paddle2');
let player1Score = document.querySelector('.player1Score');
let player2Score = document.querySelector('.player2Score');
let message = document.querySelector('.message');
let ballDoc = document.querySelector('.ball');

class Player {
    constructor(paddle, score, posiX, posiY) {
        this.paddle = paddle;
        this.score = score;
        this.posiX = posiX;
        this.posiY = posiY;
    }

    movePaddleUp() {
        this.posiY -= 10;
        this.paddle.style.top = this.posiY + "px";
    }

    movePaddleDown() {
        this.posiY += 10;
        this.paddle.style.top = this.posiY + "px";
    }
}

const player1 = new Player(paddle1, player1Score, paddle1.offsetLeft, paddle1.offsetTop);
const player2 = new Player(paddle2, player2Score, paddle2.offsetLeft, paddle2.offsetTop);

let ball = {
    ball: ballDoc,
    // position: {
    //     x: positionXBall,
    //     y: positionYBall,
    // },
    speedX: 1,
    speedY: 1
};

document.addEventListener('keydown', function (event) {
    if (event.keyCode === 13) {
        message.innerHTML = "Game Started";
        player1.movePaddleUp();
    }
});

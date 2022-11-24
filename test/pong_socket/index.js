// ----- Init Server -----

let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/pong.html');
});

// ----- Init Pong -----

let nbrPlayer = 0;
let gameState = 'notStarted';
let maxPoints = 5;
let player1;
let player2;
let ball;
let spectators = {};

let positionBoard;

const Direction = {
    UP:  -1,
    DOWN: 1
}
const Do = {
    CONTINUE: 0,
    END: 1
}
let keyPress = {};

class Player {
    constructor(position, score, id, client) {
        this.id = id;
        this.client = client;
        this.speed = 10;
        this.score = 0;
        this.top = position.top;
        this.left = position.left;
        this.right = position.right;
        this.bottom = position.bottom;
        this.height = position.height;
        this.width = position.width;
        this.centerY = position.top + position.height / 2;
    }

    move(way) {
        if (((keyPress['w'] || keyPress['ArrowUp']) && this.top - this.speed < positionBoard.top)
            || ((keyPress['s'] || keyPress['ArrowDown']) && this.bottom + this.speed > positionBoard.bottom))
            return ;

        this.top += this.speed * way;
        this.bottom += this.speed * way;
        this.centerY += this.speed * way;

        this.client.emit('movePaddle', {top: this.top, id: this.id});
        for (let id in spectators) {
            spectators[id].emit('movePaddle', {top: this.top, id: this.id});
        }
    }

    resetPlace() {
        this.top = positionBoard.top + (positionBoard.bottom - positionBoard.top) / 2 - this.height / 2;
        this.bottom = this.top + this.height;
        this.centerY = this.top + this.height / 2;

        this.client.emit('resetPaddle', this.top);
        for (let id in spectators) {
            spectators[id].emit('resetPaddle', this.top);
        }
    }
}

class Ball {
    constructor(position, player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.speed = 3;
        this.top = position.top;
        this.left = position.left;
        this.right = position.right;
        this.bottom = position.bottom;
        this.height = position.height;
        this.width = position.width;
        this.centerY = position.top + position.height / 2;
        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;
    }

    move() {
        this.top += this.directionY * this.speed;
        this.left += this.directionX * this.speed;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
        this.centerY = this.top + this.height / 2;

        this.player1.client.emit('moveBall', {top: this.top, left: this.left});
        this.player2.client.emit('moveBall', {top: this.top, left: this.left});
        for (let id in spectators) {
            spectators[id].emit('moveBall', {top: this.top, left: this.left});
        }
    }

    resetPlace() {
        this.top = positionBoard.top + (positionBoard.bottom - positionBoard.top) / 2;
        this.left = positionBoard.left + (positionBoard.right - positionBoard.left) / 2;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;

        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;

        this.player1.client.emit('resetBall', {top: this.top, left: this.left});
        this.player2.client.emit('resetBall', {top: this.top, left: this.left});
        for (let id in spectators) {
            spectators[id].emit('resetBall', {top: this.top, left: this.left});
        }
    }
}

function getPoint(whoScore) {
    if (whoScore === 'left') {
        player1.score++;
        player1.client.emit('updateScore', {id: player1.id, score: player1.score});
        player2.client.emit('updateScore', {id: player1.id, score: player1.score});
        for (let id in spectators) {
            spectators[id].emit('updateScore', {id: player1.id, score: player1.score});
        }
        if (player1.score === maxPoints) {
            player1.client.emit('win', player1.id);
            gameState = 'notStarted';
            return Do.END;
        }
    } else{
        player2.score++;
        player2.client.emit('updateScore', {id: player2.id, score: player2.score});
        player1.client.emit('updateScore', {id: player2.id, score: player2.score});
        for (let id in spectators) {
            spectators[id].emit('updateScore', {id: player2.id, score: player2.score});
        }
        if (player2.score === maxPoints) {
            player2.client.emit('win', player2.id);
            gameState = 'notStarted';
            return Do.END;
        }
    }
    ball.resetPlace();
    return Do.CONTINUE;
}

function getNewDirection(hit) {
    if (hit === 'left') {
        ball.directionY = Math.tan((ball.centerY - player1.centerY) / (player1.height / 2)) * 2;
        ball.directionX = ball.speed + (Math.abs(ball.directionY) / 2);
    } else {
        ball.directionY = Math.tan((ball.centerY - player2.centerY) / (player2.height / 2)) * 2;
        ball.directionX = -ball.speed - (Math.abs(ball.directionY) / 2);
    }
    ball.move();
    setTimeout(moveBall, 10);
}

function movePaddle() {
    if (keyPress['w']) {
        player1.move(Direction.UP);
        player2.client.emit('moveOtherPaddle', {top: player1.top, id: player1.id});
        for (let id in spectators) {
            spectators[id].emit('moveOtherPaddle', {top: player1.top, id: player1.id});
        }
    }
    if (keyPress['s']) {
        player1.move(Direction.DOWN);
        player2.client.emit('moveOtherPaddle', {top: player1.top, id: player1.id});
        for (let id in spectators) {
            spectators[id].emit('moveOtherPaddle', {top: player1.top, id: player1.id});
        }
    }
    if (keyPress['ArrowUp']) {
        player2.move(Direction.UP);
        player1.client.emit('moveOtherPaddle', {top: player2.top, id: player2.id});
        for (let id in spectators) {
            spectators[id].emit('moveOtherPaddle', {top: player2.top, id: player2.id});
        }
    }
    if (keyPress['ArrowDown']) {
        player2.move(Direction.DOWN);
        player1.client.emit('moveOtherPaddle', {top: player2.top, id: player2.id});
        for (let id in spectators) {
            spectators[id].emit('moveOtherPaddle', {top: player2.top, id: player2.id});
        }
    }
}

function moveBall() {
    // if the ball touch the left or right of the board
    if (ball.left <= positionBoard.left) {
        if (getPoint('right'))
            return Do.END;
    }
    if (ball.right >= positionBoard.right) {
        if (getPoint('left'))
            return Do.END;
    }

    // if the ball touch the left or right paddle
    if (ball.left <= player1.right
        && ball.bottom >= player1.top
        && ball.top <= player1.bottom
        && ball.left >= player1.left) {
        getNewDirection('left');
        return Do.CONTINUE;
    }
    if (ball.right >= player2.left
        && ball.bottom >= player2.top
        && ball.top <= player2.bottom
        && ball.right <= player2.right) {
        getNewDirection('right');
        return Do.CONTINUE;
    }

    // if the ball touch the top or bottom of the board
    if (ball.top <= positionBoard.top) {
        ball.directionY = -ball.directionY;
    }
    if (ball.bottom >= positionBoard.bottom) {
        ball.directionY = -ball.directionY;
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
}

function moveAll() {
    if (moveBall() === Do.END)
        return ;
    movePaddle();
    setTimeout(moveAll, 10);
}

function resetGame() {
    console.log('reset');
    player1.score = 0;
    player2.score = 0;
    player1.client.emit('updateScore', {id: player1.id, score: player1.score});
    player1.client.emit('updateScore', {id: player2.id, score: player2.score});
    player2.client.emit('updateScore', {id: player1.id, score: player1.score});
    player2.client.emit('updateScore', {id: player2.id, score: player2.score});
    for (let id in spectators) {
        spectators[id].emit('updateScore', {id: player1.id, score: player1.score});
        spectators[id].emit('updateScore', {id: player2.id, score: player2.score});
    }
    player1.resetPlace();
    player2.resetPlace();
    ball.resetPlace();
}

function startGame() {
    if (gameState === 'notStarted') {
        gameState = 'started';
        resetGame();
        moveAll();
    }
}

io.on('connection', function(client) {

    console.log('Client connected...');

    client.on('init', function(data) {
        positionBoard = data;
    });

    nbrPlayer++;
    client.emit('nbrPlayer', nbrPlayer);

    client.on('player_join', function(data) {
        if (data.id === 1) {
            console.log('Player ' + data.id + ' join');
            player1 = new Player(data.position, data.score, data.id, client);
        } else if (data.id === 2) {
            console.log('Player ' + data.id + ' join');
            player2 = new Player(data.position, data.score, data.id, client);
            ball = new Ball(data.ballPosition, player1, player2);
        } else {
            spectators[data.id] = client;
            console.log('Spectator ' + data.id + ' join');
        }
    });

    client.on('keyDown', function(data) {
        keyPress[data] = true;
        if (data === 'Enter' && gameState === 'notStarted' && player1 && player2) {
            client.emit('startGame');
            startGame();
        }
    });
    client.on('keyUp', function(data) {
        keyPress[data] = false;
    });

    client.on('disconnect', function() {
        console.log('Client disconnected...');
        nbrPlayer--;
        // if (player1 && player1.client === client) {
        //     player1 = null;
        // }
        // if (player2 && player2.client === client) {
        //     player2 = null;
        // }
        // if (player1 === null && player2 === null) {
        //     gameState = 'notStarted';
        // }
    });
});


server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

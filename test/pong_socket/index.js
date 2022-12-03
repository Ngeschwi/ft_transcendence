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

//TODO: check why the ball have a little difference between clients
//TODO: actually a player can move the other paddle /!\

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

class Player {
    constructor(position, id, client, board) {
        this.keyPress = {};
        this.id = id;
        this.client = client;
        this.speed = 1;
        this.score = 0;
        this.size = {
            width: (position.width / board.width) * 100,
            height: (position.height / board.height) * 100
        };
        this.coordCenter = {
            x: (this.size.width / 2) + (((position.left - board.left) / board.width) * 100),
            y: (this.size.height / 2) + (((position.top - board.top) / board.height) * 100)
        };
        this.coord = {
            top: this.coordCenter.y - this.size.height / 2,
            bottom: this.coordCenter.y + this.size.height / 2,
            left: this.coordCenter.x - this.size.width / 2,
            right: this.coordCenter.x + this.size.width / 2
        };
    }

    getNewPosition() {
        this.coord.top = this.coordCenter.y - this.size.height / 2;
        this.coord.bottom = this.coordCenter.y + this.size.height / 2;
        this.coord.left = this.coordCenter.x - this.size.width / 2;
        this.coord.right = this.coordCenter.x + this.size.width / 2;
    }

    move(way) {

        if ((player1.keyPress['w'] || player2.keyPress['ArrowUp']) && this.coord.top - this.speed < 0) {
            this.coordCenter.y = this.size.height / 2;
        } else if ((player1.keyPress['s'] || player2.keyPress['ArrowDown']) && this.coord.bottom + this.speed > 100) {
            this.coordCenter.y = 100 - this.size.height / 2;
        } else {
            this.coordCenter.y += this.speed * way;
        }

        this.getNewPosition();

        this.client.emit('movePaddle', {top: this.coord.top, id: this.id});
        for (let id in spectators) {
            spectators[id].emit('movePaddle', {top: this.coord.top, id: this.id});
        }
    }

    resetPlace() {
        this.coordCenter.y = 50;
        this.getNewPosition();

        this.client.emit('resetPaddle', this.coord.top);
        for (let id in spectators) {
            spectators[id].emit('resetPaddle', this.coord.top);
        }
    }
}

class Ball {
    constructor(position, player1, player2, board) {
        this.player1 = player1;
        this.player2 = player2;
        this.speed = 0.5;
        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;
        this.size = {
            width: (position.width / board.width) * 100,
            height: (position.height / board.height) * 100
        };
        this.coordCenter = {
            x: (this.size.width / 2) + (((position.left - board.left)/ board.width) * 100),
            y: (this.size.height / 2) + (((position.top - board.top)/ board.height) * 100)
        };
        this.coord = {
            top: this.coordCenter.y - this.size.height / 2,
            bottom: this.coordCenter.y + this.size.height / 2,
            left: this.coordCenter.x - this.size.width / 2,
            right: this.coordCenter.x + this.size.width / 2
        };
    }

    getNewPosition() {
        this.coord.top = this.coordCenter.y - this.size.height / 2;
        this.coord.bottom = this.coordCenter.y + this.size.height / 2;
        this.coord.left = this.coordCenter.x - this.size.width / 2;
        this.coord.right = this.coordCenter.x + this.size.width / 2;
    }
    
    move() {
        this.coordCenter.x += this.directionX * this.speed;
        this.coordCenter.y += this.directionY * this.speed;
        this.getNewPosition();

        this.player1.client.emit('moveBall', {top: this.coord.top, left: this.coord.left});
        this.player2.client.emit('moveBall', {top: this.coord.top, left: this.coord.left});
        for (let id in spectators) {
            spectators[id].emit('moveBall', {top: this.coord.top, left: this.coord.left});
        }
    }

    resetPlace() {
        this.coordCenter.x = 50;
        this.coordCenter.y = 50;
        this.getNewPosition();

        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;

        this.player1.client.emit('resetBall', {top: this.coord.top, left: this.coord.left});
        this.player2.client.emit('resetBall', {top: this.coord.top, left: this.coord.left});
        for (let id in spectators) {
            spectators[id].emit('resetBall', {top: this.coord.top, left: this.coord.left});
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
            player1.client.emit('someoneWin', player1.id);
            player2.client.emit('someoneWin', player1.id);
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
            player2.client.emit('someoneWin', player2.id);
            player1.client.emit('someoneWin', player2.id);
            gameState = 'notStarted';
            return Do.END;
        }
    }
    ball.resetPlace();
    return Do.CONTINUE;
}

function getNewDirection(hit) {
    if (hit === 'left') {
        ball.directionY = Math.tan((ball.coordCenter.y - player1.coordCenter.y) / (player1.size.height / 2)) * 2;
        ball.directionX = ball.speed + (Math.abs(ball.directionY) / 2);
    } else {
        ball.directionY = Math.tan((ball.coordCenter.y - player2.coordCenter.y) / (player2.size.height / 2)) * 2;
        ball.directionX = -ball.speed - (Math.abs(ball.directionY) / 2);
    }
    ball.move();
    setTimeout(moveBall, 10);
}

function movePaddle() {
    if (player1.keyPress['w']) {
        player1.move(Direction.UP);
        player2.client.emit('moveOtherPaddle', {top: player1.coord.top, id: player1.id});
        for (let id in spectators) {
            spectators[id].emit('moveOtherPaddle', {top: player1.coord.top, id: player1.id});
        }
    }
    if (player1.keyPress['s']) {
        player1.move(Direction.DOWN);
        player2.client.emit('moveOtherPaddle', {top: player1.coord.top, id: player1.id});
        for (let id in spectators) {
            spectators[id].emit('moveOtherPaddle', {top: player1.coord.top, id: player1.id});
        }
    }
    if (player2.keyPress['ArrowUp']) {
        player2.move(Direction.UP);
        player1.client.emit('moveOtherPaddle', {top: player2.coord.top, id: player2.id});
        for (let id in spectators) {
            spectators[id].emit('moveOtherPaddle', {top: player2.coord.top, id: player2.id});
        }
    }
    if (player2.keyPress['ArrowDown']) {
        player2.move(Direction.DOWN);
        player1.client.emit('moveOtherPaddle', {top: player2.coord.top, id: player2.id});
        for (let id in spectators) {
            spectators[id].emit('moveOtherPaddle', {top: player2.coord.top, id: player2.id});
        }
    }
}

function moveBall() {
    // if the ball touch the left or right of the board
    if (ball.coord.left <= 0) {
        if (getPoint('right'))
            return Do.END;
    }
    if (ball.coord.right >= 100) {
        if (getPoint('left'))
            return Do.END;
    }

    // if the ball touch the left or right paddle
    if (ball.coord.left <= player1.coord.right
        && ball.coord.bottom >= player1.coord.top
        && ball.coord.top <= player1.coord.bottom
        && ball.coord.left >= player1.coord.left) {
        getNewDirection('left');
        return Do.CONTINUE;
    }
    if (ball.coord.right >= player2.coord.left
        && ball.coord.bottom >= player2.coord.top
        && ball.coord.top <= player2.coord.bottom
        && ball.coord.right <= player2.coord.right) {
        getNewDirection('right');
        return Do.CONTINUE;
    }

    // if the ball touch the top or bottom of the board
    if (ball.coord.top <= 0) {
        ball.directionY = -ball.directionY;
    }
    if (ball.coord.bottom >= 100) {
        ball.directionY = -ball.directionY;
    }

    // if the ball the top or bottom of the paddle
    if ((ball.coord.top <= player1.coord.bottom
        || ball.coord.bottom >= player1.coord.top)
        && ball.coord.left <= player1.coord.right
        && ball.coord.right >= player1.coord.left) {
        ball.directionY = -ball.directionY;
    }
    if ((ball.coord.bottom >= player2.coord.top
        || ball.coord.top <= player2.coord.bottom)
        && ball.coord.left <= player2.coord.right
        && ball.coord.right >= player2.coord.left) {
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
            player1 = new Player(data.position, data.id, client, data.board);
        } else if (data.id === 2) {
            console.log('Player ' + data.id + ' join');
            player2 = new Player(data.position, data.id, client, data.board);
        } else {
            spectators[data.id] = client;
            console.log('Spectator ' + data.id + ' join');
        }
        if (!ball && player1 && player2) {
            ball = new Ball(data.ballPosition, player1, player2, data.board);
        }
    });

    client.on('keyDown', function(data) {
        if (client === player1.client) {
            player1.keyPress[data] = true;
        } else if (client === player2.client) {
            player2.keyPress[data] = true;
        }
        if (data === 'Enter' && gameState === 'notStarted' && player1 && player2 && (client === player1.client || client === player2.client)) {
            client.emit('startGame');
            startGame();
        }
    });
    client.on('keyUp', function(data) {
        if (client === player1.client) {
            player1.keyPress[data] = false;
        } else if (client === player2.client) {
            player2.keyPress[data] = false;
        }
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


const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../../webpack.dev.js');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');

// Setup an Express server
const app = express();
app.use(express.static('public'));

const compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler));

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
    console.log('Player connected!', socket.id);
    socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
    socket.on('disconnect', onDisconnect);
    socket.on(Constants.MSG_TYPES.START_GAME, startGame);
    socket.on(Constants.MSG_TYPES.READY_TO_START, playerIsReady);
    socket.on(Constants.MSG_TYPES.SEER_RESPONSE, verify_seer_choice);
});

// Setup the Game
const game = new Game();

function joinGame(username) {
    console.log("aloha");
    console.log(username);
    game.addPlayer(this, username);
}

  
function onDisconnect() {
    game.removePlayer(this);
}

function startGame(){
    game.startGame();
}

function playerIsReady(){
    game.playerReady();
}

function verify_seer_choice(num){
    game.check_player(num);
}
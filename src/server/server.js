
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../../webpack.dev.js');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
const { kill } = require('../client/networking.js');

// Sets up an Express server
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
    socket.on(Constants.MSG_TYPES.WOLF_RESPONSE, display_message);
    socket.on(Constants.MSG_TYPES.WOLF_KILL, kill);
    socket.on(Constants.MSG_TYPES.RUN_FOR_MAYOR, run_for_mayor);
    socket.on(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE, mayor_vote);
    socket.on(Constants.MSG_TYPES.DROP_OUT_ELECTION, drop_out_election);
    socket.on(Constants.MSG_TYPES.MAYOR_VOTE, tally_mayor_vote);
});

// Sets up the Game
const game = new Game();

// Calls the functions in the Game class to handle these server messages

function joinGame(username) {
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

function display_message(message){
    game.display_message(this, message);
}

function kill(num){
    game.kill(num);
}

function run_for_mayor(run){
    game.run_for_mayor(this, run);
}

function mayor_vote(){
    game.mayor_vote();
}

function tally_mayor_vote(num){
    game.tally_mayor_vote(this, num);
}

function drop_out_election(){
    game.drop_out_election(this);
}

const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../../webpack.dev.js');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');

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
    socket.on(Constants.MSG_TYPES.HEAL, heal);
    socket.on(Constants.MSG_TYPES.POISON, poison);
    socket.on(Constants.MSG_TYPES.WITCH_SKIP, witch_skip);
    socket.on(Constants.MSG_TYPES.HUNTER_RESPONSE, verify_hunter_choice);
    socket.on(Constants.MSG_TYPES.HUNTER_SKIP, hunter_skip);
    socket.on(Constants.MSG_TYPES.CONFIRM_SHOT, confirm_shot);
    socket.on(Constants.MSG_TYPES.CONFIRM_DEATH, confirm_death);
    socket.on(Constants.MSG_TYPES.MAYOR_RESPONSE, verify_mayor_choice);
    socket.on(Constants.MSG_TYPES.CONFIRM_NEW_MAYOR, confirm_new_mayor);
    socket.on(Constants.MSG_TYPES.RUN_FOR_MAYOR, run_for_mayor);
    socket.on(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE, mayor_vote);
    socket.on(Constants.MSG_TYPES.DROP_OUT_ELECTION, drop_out_election);
    socket.on(Constants.MSG_TYPES.MAYOR_VOTE, tally_mayor_vote);
    socket.on(Constants.MSG_TYPES.SUBMIT_VOTE, submit_vote);
    socket.on(Constants.MSG_TYPES.WOLF_MAYOR_REVEAL, wolf_mayor_reveal);
    socket.on(Constants.MSG_TYPES.MOVE_TO_DAY, moveToDay);
    socket.on(Constants.MSG_TYPES.MOVE_TO_VOTING, moveToVote);
    socket.on(Constants.MSG_TYPES.WOLF_VOTE_REVEAL, wolfVoteReveal);
    socket.on(Constants.MSG_TYPES.MAYOR_TIE, moveToMayorTie);
    socket.on(Constants.MSG_TYPES.VOTE_TIE, moveToTie);
    socket.on(Constants.MSG_TYPES.AFTER_VOTE, afterVote);
});

// Sets up the Game
const game = new Game();

// Calls the functions in the Game class to handle these server messages

function joinGame(username) {
    game.addPlayer(this, username);
}
  
function onDisconnect() {
    console.log("here");
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

function heal(){
    game.witch_heal();
}

function poison(num){
    game.witch_poison(num);
}

function witch_skip(){
    game.witch_skip();
}

function verify_hunter_choice(num){
    game.hunter_shoot(num);
}

function hunter_skip(){
    game.hunter_skip();
}
function verify_mayor_choice(num){
    game.new_mayor(num);
}

function confirm_death(){
    game.confirm_death();
}

function confirm_shot(){
    game.confirm_shot();
}

function confirm_new_mayor(){
    game.confirm_new_mayor();
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

function submit_vote(num){
    game.tally_vote(this, num);
}

function wolf_mayor_reveal(){
    game.wolf_mayor_reveal(this);
}

function moveToDay(){
    game.move_to_day();
}

function moveToVote(){
    game.move_to_vote();
}

function wolfVoteReveal(){
    game.wolf_vote_reveal(this);
}

function moveToMayorTie(){
    game.mayorTie();
}

function moveToTie(){
    game.voteTie();
}

function afterVote(){
    game.afterVote();
}

/* This file contains all communication between client and server */

import io from 'socket.io-client';


import { changeDisplay, gotSeerResult, seerNight, wolfNight, wolfNightEnd, wolfChat, gotKillResult, gameover, shoot, shootResult, mayorMenu, mayorResult, deadLastNight, confirm_death_button, deathEnd, showStartGameButton, startGameForAll, electionStart, electionSpeechStart, show_mayor_button, show_mayor_menu, show_drop_out_button, update_candidates, mayor_reveal, show_mayor_menu_candidate, your_number, start_vote, vote_reveal, wolf_mayor_reveal_button, reveal_move_to_day_button, reveal_move_to_vote_button, move_to_vote, wolf_reveal_button, move_to_day, goToNight, reveal_mayor_tie_button, reveal_vote_tie_button, player_disconnected } from "./index";


const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });

const connectedPromise = new Promise(resolve => {
    socket.on('connect', () => {
        console.log('Connected to server!');
        resolve();
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server.');
    });

    /* Listens for server messages from the server, calls a function when message received */
    socket.on(Constants.MSG_TYPES.JOIN_LOBBY, changeDisplay);
    socket.on(Constants.MSG_TYPES.ENOUGH_PEOPLE, showStartGameButton);
    socket.on(Constants.MSG_TYPES.START_GAME, startGameForAll);
    socket.on(Constants.MSG_TYPES.SEER_NIGHT, seerNight);
    socket.on(Constants.MSG_TYPES.WOLF_NIGHT, wolfNight);
    socket.on(Constants.MSG_TYPES.SEER_RESULT, gotSeerResult);
    socket.on(Constants.MSG_TYPES.CHAT_MESSAGE, wolfChat);
    socket.on(Constants.MSG_TYPES.WOLF_END, wolfNightEnd);
    socket.on(Constants.MSG_TYPES.KILL_RESULT, gotKillResult);
    socket.on(Constants.MSG_TYPES.GAME_OVER, gameover);
    socket.on(Constants.MSG_TYPES.HUNTER_SHOOT, shoot);
    socket.on(Constants.MSG_TYPES.SHOOT_RESULT, shootResult);
    socket.on(Constants.MSG_TYPES.MAYOR_SUCCESSOR, mayorMenu);
    socket.on(Constants.MSG_TYPES.NEW_MAYOR, mayorResult);
    
    socket.on(Constants.MSG_TYPES.REVEAL_DEAD_LAST_NIGHT, deadLastNight);
    socket.on(Constants.MSG_TYPES.DEATH_END, deathEnd);
    socket.on(Constants.MSG_TYPES.REVEAL_CONFIRM_DEATH_BUTTON, confirm_death_button);

    socket.on(Constants.MSG_TYPES.ELECTION_START, electionStart);
    socket.on(Constants.MSG_TYPES.ELECTION_SPEECH_START, electionSpeechStart)
    socket.on(Constants.MSG_TYPES.SHOW_MAYOR_BUTTON, show_mayor_button);
    socket.on(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE, show_mayor_menu);
    socket.on(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE_CANDIDATE, show_mayor_menu_candidate)
    socket.on(Constants.MSG_TYPES.SHOW_DROP_OUT_BUTTON, show_drop_out_button);
    socket.on(Constants.MSG_TYPES.UPDATE_CANDIDATES, update_candidates);
    socket.on(Constants.MSG_TYPES.MAYOR_REVEAL, mayor_reveal);
    socket.on(Constants.MSG_TYPES.YOUR_NUMBER, your_number);
    socket.on(Constants.MSG_TYPES.VOTE_REVEAL, vote_reveal);
    socket.on(Constants.MSG_TYPES.WOLF_MAYOR_BUTTON, wolf_mayor_reveal_button);
    socket.on(Constants.MSG_TYPES.REVEAL_MOVE_TO_DAY_BUTTON, reveal_move_to_day_button);
    socket.on(Constants.MSG_TYPES.REVEAL_MOVE_TO_VOTE_BUTTON, reveal_move_to_vote_button);
    socket.on(Constants.MSG_TYPES.MOVE_TO_VOTING, move_to_vote);
    socket.on(Constants.MSG_TYPES.WOLF_VOTE_REVEAL, wolf_reveal_button);
    socket.on(Constants.MSG_TYPES.MOVE_TO_DAY, move_to_day);
    socket.on(Constants.MSG_TYPES.GO_TO_NIGHT, goToNight);
    socket.on(Constants.MSG_TYPES.REVEAL_MAYOR_TIE_BUTTON, reveal_mayor_tie_button);
    socket.on(Constants.MSG_TYPES.REVEAL_VOTE_TIE_BUTTON, reveal_vote_tie_button);
    socket.on(Constants.MSG_TYPES.PLAYER_DISCONNECTED, player_disconnected);
});


/* Functions that send messages from client to server */

export function enterUsername(usernameInput){
    socket.emit(Constants.MSG_TYPES.JOIN_GAME, usernameInput);
}

export function hostStartGame(){
    socket.emit(Constants.MSG_TYPES.START_GAME);
}

export function playerReady(){
    socket.emit(Constants.MSG_TYPES.READY_TO_START);
}

export function getSeerChoice(numInput){
    socket.emit(Constants.MSG_TYPES.SEER_RESPONSE, numInput);
}

export function wolfChatMessage(message){
    socket.emit(Constants.MSG_TYPES.WOLF_RESPONSE, message);
}

export function getKillChoice(numInput){
    socket.emit(Constants.MSG_TYPES.WOLF_KILL, numInput);
}

export function heal(){
    socket.emit(Constants.MSG_TYPES.HEAL);
}

export function poison(numInput){
    socket.emit(Constants.MSG_TYPES.POISON, numInput);
}

export function witchSkip(){
    socket.emit(Constants.MSG_TYPES.WITCH_SKIP);
}

export function getHunterChoice(numInput){
    socket.emit(Constants.MSG_TYPES.HUNTER_RESPONSE, numInput);
}

export function hunterSkip(){
    socket.emit(Constants.MSG_TYPES.HUNTER_SKIP);
}

export function getMayorChoice(numInput){
    socket.emit(Constants.MSG_TYPES.MAYOR_RESPONSE, numInput);
}

export function confirmDeath(){
    socket.emit(Constants.MSG_TYPES.CONFIRM_DEATH);
}

export function runForMayorOrNot(run){
    socket.emit(Constants.MSG_TYPES.RUN_FOR_MAYOR, run);
}

export function moveToMayorVote(){
    socket.emit(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE);
}

export function dropOutElection(){
    socket.emit(Constants.MSG_TYPES.DROP_OUT_ELECTION);
}

export function mayorVote(num){
    socket.emit(Constants.MSG_TYPES.MAYOR_VOTE, num)
}

export function vote(num){
    socket.emit(Constants.MSG_TYPES.SUBMIT_VOTE, num)
}

export function wolfMayorReveal(){
    socket.emit(Constants.MSG_TYPES.WOLF_MAYOR_REVEAL);
}

export function moveToDay(){
    socket.emit(Constants.MSG_TYPES.MOVE_TO_DAY);
}

export function moveToVote(){
    socket.emit(Constants.MSG_TYPES.MOVE_TO_VOTING);
}

export function wolfReveal(){
    socket.emit(Constants.MSG_TYPES.WOLF_VOTE_REVEAL);
}

export function moveToMayorTie(){
    socket.emit(Constants.MSG_TYPES.MAYOR_TIE);
}

export function moveToTie(){
    socket.emit(Constants.MSG_TYPES.VOTE_TIE);
}
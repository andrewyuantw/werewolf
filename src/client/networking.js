
/* This file contains all communication between client and server */

import io from 'socket.io-client';

import { changeDisplay, gotSeerResult, seerNight, wolfNight, wolfNightEnd, wolfChat, gotKillResult, showStartGameButton, startGameForAll, electionStart, electionSpeechStart, show_mayor_button, show_mayor_menu, show_drop_out_button, update_candidates, mayor_reveal, show_mayor_menu_candidate, your_number, start_vote, vote_reveal, wolfMayorRevealButton, wolf_mayor_reveal_button } from "./index";
const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });

const connectedPromise = new Promise(resolve => {
    socket.on('connect', () => {
        console.log('Connected to server!');
        resolve();
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
    socket.on(Constants.MSG_TYPES.ELECTION_START, electionStart);
    socket.on(Constants.MSG_TYPES.ELECTION_SPEECH_START, electionSpeechStart)
    socket.on(Constants.MSG_TYPES.SHOW_MAYOR_BUTTON, show_mayor_button);
    socket.on(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE, show_mayor_menu);
    socket.on(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE_CANDIDATE, show_mayor_menu_candidate)
    socket.on(Constants.MSG_TYPES.SHOW_DROP_OUT_BUTTON, show_drop_out_button);
    socket.on(Constants.MSG_TYPES.UPDATE_CANDIDATES, update_candidates);
    socket.on(Constants.MSG_TYPES.MAYOR_REVEAL, mayor_reveal);
    socket.on(Constants.MSG_TYPES.YOUR_NUMBER, your_number);
    socket.on(Constants.MSG_TYPES.START_VOTE, start_vote);
    socket.on(Constants.MSG_TYPES.VOTE_REVEAL, vote_reveal);
    socket.on(Constants.MSG_TYPES.WOLF_MAYOR_BUTTON, wolf_mayor_reveal_button);
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
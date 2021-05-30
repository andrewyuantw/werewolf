
/* This file contains all communication between client and server */

import io from 'socket.io-client';

import { changeDisplay, gotSeerResult, seerNight, wolfNight, wolfChat, showStartGameButton, startGameForAll, electionStart, electionSpeechStart, show_mayor_button, show_mayor_menu, show_drop_out_button, update_candidates, mayor_reveal, show_mayor_menu_candidate } from "./index";
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
    socket.on(Constants.MSG_TYPES.ELECTION_START, electionStart);
    socket.on(Constants.MSG_TYPES.ELECTION_SPEECH_START, electionSpeechStart)
    socket.on(Constants.MSG_TYPES.SHOW_MAYOR_BUTTON, show_mayor_button);
    socket.on(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE, show_mayor_menu);
    socket.on(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE_CANDIDATE, show_mayor_menu_candidate)
    socket.on(Constants.MSG_TYPES.SHOW_DROP_OUT_BUTTON, show_drop_out_button);
    socket.on(Constants.MSG_TYPES.UPDATE_CANDIDATES, update_candidates);
    socket.on(Constants.MSG_TYPES.MAYOR_REVEAL, mayor_reveal);
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
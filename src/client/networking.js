
import io from 'socket.io-client';

import { changeDisplay, showStartGameButton, startGameForAll } from "./index";
const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
    socket.on('connect', () => {
        console.log('Connected to server!');
        resolve();
    });
    socket.on(Constants.MSG_TYPES.JOIN_LOBBY, changeDisplay);
    socket.on(Constants.MSG_TYPES.ENOUGH_PEOPLE, showStartGameButton);
    socket.on(Constants.MSG_TYPES.START_GAME, startGameForAll);
});

export const play = username => {
    socket.emit(Constants.MSG_TYPES.JOIN_GAME, username);
};

export function startGame(){
    socket.emit(Constants.MSG_TYPES.START_GAME);
}


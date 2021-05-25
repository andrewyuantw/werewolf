
import io from 'socket.io-client';

import { changeDisplay } from "./index";
const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
    socket.on('connect', () => {
        console.log('Connected to server!');
        resolve();
    });
    socket.on(Constants.MSG_TYPES.JOIN_LOBBY, changeDisplay);
});

export const play = username => {
    socket.emit(Constants.MSG_TYPES.JOIN_GAME, username);
};



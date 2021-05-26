const Player = require('./player');
const Constants = require('../shared/constants');

class Game {
    constructor() {
        this.sockets = {};
        this.players = {};
        this.playerCount = 0;
        this.hostID = null;
        this.current_roster = "Lobby: <br>";
    }
  
    addPlayer(socket, username) {
        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(socket.id, username);
        this.playerCount++;
        this.current_roster += `${this.playerCount}. ${username} <br>`;

        if (this.hostID == null){
            this.hostID = socket.id;
        }

        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.JOIN_LOBBY, this.current_roster);
        })

        if (this.playerCount >= 2){
            const host_socket = this.sockets[this.hostID];
            host_socket.emit(Constants.MSG_TYPES.ENOUGH_PEOPLE);
        }
        
        console.log("emitting " + this.current_roster);
    }

    removePlayer(socket) {
        delete this.sockets[socket.id];
        delete this.players[socket.id];
    }

    startGame(){
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.START_GAME);
        })
    }
}

module.exports = Game;
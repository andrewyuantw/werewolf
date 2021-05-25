const Player = require('./player');
const Constants = require('../shared/constants');

class Game {
    constructor() {
        this.sockets = {};
        this.players = {};
        this.current_roster = "";
    }
  
    addPlayer(socket, username) {
        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(socket.id, username);
        this.current_roster += username + "<br>";
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.JOIN_LOBBY, this.current_roster);
        })
        
        console.log("emitting " + this.current_roster);
    }

    removePlayer(socket) {
        delete this.sockets[socket.id];
        delete this.players[socket.id];
    }
}

module.exports = Game;
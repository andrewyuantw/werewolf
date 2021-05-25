class Game {
    constructor() {
        this.sockets = {};
        this.players = {};
    }
  
    addPlayer(socket, username) {
        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(socket.id, username);
    }
}

module.exports = Game;
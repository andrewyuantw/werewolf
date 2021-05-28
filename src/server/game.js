const Player = require('./player');
const Constants = require('../shared/constants');

const PLAYERNUM = 9;

class Game {
    constructor() {
        this.sockets = {};
        this.players = {};
        this.playerCount = 0;
        this.hostID = null;
        this.current_roster = "Players: <br>";
        this.ready_number = 0;

        this.seerID = null;
        this.wolfIDs = [];
    }
  
    addPlayer(socket, username) {
        this.sockets[socket.id] = socket;
        this.playerCount++;
        this.players[socket.id] = new Player(socket.id, username, this.playerCount);
        
        this.current_roster += `${this.playerCount}. ${username} <br>`;

        if (this.hostID == null){
            this.hostID = socket.id;
        }

        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.JOIN_LOBBY, this.current_roster);
        })

        if (this.playerCount >= PLAYERNUM){
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
        this.assignRoleNumber();
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.START_GAME, this.players[playerID].getRole());
        })

    }

    assignRoleNumber(){
        var array = [1,2,3,4,5,6,7,8,9];
        for (var i = array.length - 1; i > 0; i --){
            var rand = Math.floor(Math.random() * (i + 1));
            [array[i], array[rand]] = [array[rand], array[i]];
        }
        i = 0;
        Object.keys(this.players).forEach(playerID => {
            const player = this.players[playerID];
            player.setRole(array[i]);
            if (array[i] == 4){
                this.seerID = playerID;
            }
            if (array[i] >= 7){
                this.wolfIDs.push(playerID);
            }
            i++;
        })
    }

    playerReady(){
        this.ready_number++;
        if (this.ready_number >= PLAYERNUM){
            const seer_socket = this.sockets[this.seerID];
            seer_socket.emit(Constants.MSG_TYPES.SEER_NIGHT);
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.GO_TO_NIGHT);
            })
            console.log("night");
        }
    }

    check_player(num){
        var bad = false;
        this.wolfIDs.forEach(playerID => {
            const playerNum = this.players[playerID].getPlayerNum();
            if (playerNum == num){
                bad = true;
            }
        })
        const seer_socket = this.sockets[this.seerID];
        seer_socket.emit(Constants.MSG_TYPES.SEER_RESULT, bad);
    }


}

module.exports = Game;
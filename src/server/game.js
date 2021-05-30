const Player = require('./player');
const Constants = require('../shared/constants');
const socket = require('socket.io-client/lib/socket');

// Number of players in a game. Typically 9, for debugging purposes, you can set it to lower
const PLAYERNUM = 9;

class Game {

    constructor() {

        // Object that holds the sockets for each player
        this.sockets = {};

        // Object that holds Player objects for each player
        this.players = {};

        // Counts the number of players in the lobby
        this.playerInLobby = 0;

        // Stores the ID for the host (first person to join the game)
        this.hostID = null;

        // Holds a string to be displayed in the "lobby" div
        this.current_roster = {};

        // Counts the number of players that have hit the ready button after seeing their role
        this.ready_number = 0;

        // Stores the ID for the seer
        this.seerID = null;

        // Array that stores the IDs for wolves
        this.wolfIDs = [];

        // Holds a string to be displayed in werewolves' chat
        this.wolf_chat = "Chat: <br>";
        
        // People who have run for mayor
        this.mayorNominees = [];

        // People still in the election (excludes people who have dropped out during speeches)
        this.activeNominees = [];

        // Counts how many people have submitted whether to run for mayor
        this.mayorCount = 0;

        this.mayorVote = {};

        this.mayorVoteCount = 0;
    }
  
    // This function adds a player to the game; it is called when someone enters the lobby
    addPlayer(socket, username) {

        // Adds the new player to the list of sockets
        this.sockets[socket.id] = socket;

        this.playerInLobby++;

        // Creates new Player object and stores in this.players
        this.players[socket.id] = new Player(socket.id, username, this.playerInLobby);
        
        // Updates the string to be displayed in the "lobby" div 
        this.current_roster[this.playerInLobby] = username;

        // Sets this.hostID to be the first person to join the game
        if (this.hostID == null){
            this.hostID = socket.id;
        }

        socket = this.sockets[socket.id];
        socket.emit(Constants.MSG_TYPES.YOUR_NUMBER, this.playerInLobby);

        // Send a message to every player in the game so they can update their lobby display
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            Object.keys(this.current_roster).forEach(playerNum => {
                console.log(playerNum);
                console.log(this.current_roster[playerNum]);
                each_socket.emit(Constants.MSG_TYPES.JOIN_LOBBY, this.current_roster[playerNum], playerNum);
            });
            
        })

        // If we have enough players, we send a message to the host only
        if (this.playerInLobby >= PLAYERNUM){
            const host_socket = this.sockets[this.hostID];
            host_socket.emit(Constants.MSG_TYPES.ENOUGH_PEOPLE);
        }
    }

    // Removes a player from the game
    // TO DO: implement this function for when players drop out of the game
    removePlayer(socket) {
        delete this.sockets[socket.id];
        delete this.players[socket.id];
    }

    // Starts the game for all players
    startGame(){

        // Assigns roles to each player
        this.assignRoleNumber();

        // Sends a server message to everyone with their role in the form of a string
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            //each_socket.emit(Constants.MSG_TYPES.START_GAME, this.players[playerID].getRole());
            each_socket.emit(Constants.MSG_TYPES.ELECTION_START, this.players[playerID].getRole());
        })
    }

    // Assigns role numbers to every player
    assignRoleNumber(){

        // Roles 1 to 9, for debugging, you can alter this array
        // For example. if you just want to test werewolf functions, set this to
        // [7, 8, 9] and you will ensure that you will get the werewolf role
        var array = [1,2,3,4,5,6,7,8,9];

        // Shuffles the array
        for (var i = array.length - 1; i > 0; i --){
            var rand = Math.floor(Math.random() * (i + 1));
            [array[i], array[rand]] = [array[rand], array[i]];
        }

        // Goes through the now randomized array
        i = 0;
        Object.keys(this.players).forEach(playerID => {

            // Calls player.setRole with the randomized number
            const player = this.players[playerID];
            player.setRole(array[i]);

            // If this playerID's corresponding role is 4 (Seer), store in this.seerID
            if (array[i] == 4)
                this.seerID = playerID;
            
            // If this playerID's corresponding role is 7 or greater (Wolf), store in this.wolfIDs array
            if (array[i] >= 7)
                this.wolfIDs.push(playerID);
            
            i++;
        })
    }

    // Tallies the number of players that are ready after seeing their role
    playerReady(){

        this.ready_number++;

        // If we have enough players, send server messages indicating it is night
        if (this.ready_number >= PLAYERNUM){

            // We send different messages depending on the role

            // For the seer, we send SEER_NIGHT
            const seer_socket = this.sockets[this.seerID];
            seer_socket.emit(Constants.MSG_TYPES.SEER_NIGHT);

           // For werewolves, we send WOLF_NIGHT
            this.wolfIDs.forEach(playerID => {
                const wolf_socket = this.sockets[playerID];
                wolf_socket.emit(Constants.MSG_TYPES.WOLF_NIGHT);
            })


            // TO DO: Delete this loop, and replace with the appropriate messages
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.GO_TO_NIGHT);
            })
        }
    }

    // Takes a player number (1 to 9, not ID) as input, returns true/false depending whether they are good or bad
    check_player(num){

        var bad = false;

        // Iterates through the wolfIDs array
        this.wolfIDs.forEach(playerID => {

            // If the player num is equal to the passed in argument, they are bad
            const playerNum = this.players[playerID].getPlayerNum();
            if (playerNum == num){
                bad = true;
            }
        })

        // Send the result back to the seer with the result as an argument
        const seer_socket = this.sockets[this.seerID];
        seer_socket.emit(Constants.MSG_TYPES.SEER_RESULT, bad);
    }

    display_message(socket, message){
        var text = message;

        // Send the message in the format of "[NUMBER]. [USERNAME]: [CONTENT]"
        this.wolf_chat += `${this.players[socket.id].playerNum}. ${this.players[socket.id].username}:  ${text} <br>`;

        // Send it to only werewolves
        this.wolfIDs.forEach(playerID => {
            const wolf_socket = this.sockets[playerID];
            wolf_socket.emit(Constants.MSG_TYPES.CHAT_MESSAGE, this.wolf_chat);
        })
    }

    run_for_mayor(socket, run){
        if (run){
            this.mayorNominees.push(socket.id)
            this.activeNominees.push(socket.id)
        }
        this.mayorCount++;
        
        if (this.mayorCount >= PLAYERNUM){
            var array = this.mayorNominees;
            var rand = Math.floor(Math.random() * array.length);
            var direction = Math.round(Math.random());

            var speakingOrder = "";

            if (direction == 0){
                for (var i = 0; i < array.length; i ++){
                    var index = (rand + i) % array.length; 
                    var player = this.players[array[index]];
                    var playerNum = player.getPlayerNum();
                    speakingOrder += playerNum.toString() + " ";
                }
            } else {
                for (var i = array.length; i > 0; i --){
                    var index = (rand + i) % array.length; 
                    var player = this.players[array[index]];
                    var playerNum = player.getPlayerNum();
                    speakingOrder += playerNum.toString() + " ";
                }
            }
            
            
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.ELECTION_SPEECH_START, speakingOrder);
            })
            const host_socket = this.sockets[this.hostID];
            host_socket.emit(Constants.MSG_TYPES.SHOW_MAYOR_BUTTON);
            this.mayorNominees.forEach(playerID => {
                const nominee_socket = this.sockets[playerID];
                nominee_socket.emit(Constants.MSG_TYPES.SHOW_DROP_OUT_BUTTON);
            })
            var nomineeList = "";
            this.activeNominees.forEach(playerID => {
                nomineeList += `${this.players[playerID].playerNum}. ${this.players[playerID].username}<br>` ;
            }) 
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.UPDATE_CANDIDATES, nomineeList);
            })

        }

    }

    mayor_vote(){
        Object.keys(this.sockets).forEach(playerID => {
            if (this.mayorNominees.includes(playerID)){
                const nominee = this.sockets[playerID];
                nominee.emit(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE_CANDIDATE);
            } else {
                const voter = this.sockets[playerID];
                voter.emit(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE);
            }
            
        })
    }

    drop_out_election(socket){
        var nomineeList = "";
        for (var i = 0; i < this.activeNominees.length; i ++){
            if (this.activeNominees[i] == socket.id){
                this.activeNominees.splice(i, 1);
                i--;
            } else {
                nomineeList += `${this.players[this.activeNominees[i]].playerNum}. ${this.players[this.activeNominees[i]].username}<br>`;
            }
        }
        
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.UPDATE_CANDIDATES, nomineeList);
        })
    }

    tally_mayor_vote(socket, num){

        console.log("got a num" + num);
        if (Array.isArray(this.mayorVote[num])){
            this.mayorVote[num].push(socket.id);
        } else {
            this.mayorVote[num] = [socket.id];
        }
        this.mayorVoteCount++;
        if (this.mayorVoteCount >= (PLAYERNUM - this.mayorNominees.length)){
            var maxLength = 0;
            var mayor = 0;
            Object.keys(this.mayorVote).forEach(playerNum => {
                var length = this.mayorVote[playerNum].length;
                if (length > maxLength){
                    maxLength = length;
                    mayor = playerNum;
                }
            })
            console.log(`here is mayor ${mayor}`);
            var returnString = "No one (b/c most people voted 0)";
            Object.keys(this.players).forEach(playerID =>{
                if (this.players[playerID].getPlayerNum() == mayor){
                    returnString = `${mayor}. ${this.players[playerID].username}`
                }
            })
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.MAYOR_REVEAL, returnString);
            })
        }
        

        
    }
}

module.exports = Game;
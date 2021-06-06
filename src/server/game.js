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

        // Stores the ID for the witch
        this.witchID = null;

        // Stores the ID for the hunter
        this.hunterID = null;

        // Array that stores the IDs for wolves
        this.wolfIDs = [];

        // Holds a string to be displayed in werewolves' chat
        this.wolf_chat = "Chat: <br>";
        
        // Counts the number of villagers alive
        this.villagerCount = 3;

        // Counts the number of gods alive
        this.godCount = 3;
        
        // Counts the number of werewolves alive
        this.wolfCount = 3;

        // Stores the ID for the player got killed by werewolves
        this.victim = null;

        // Counts the number of players died
        this.deadCount = 0;

        // Array that stores the IDs for dead players
        this.deadIDs = [];

        // Holds an array of players died at night (0, 1, 2 players)
        this.deadAtNightPlayers = [];

        //Stores the amount of potions left for witch
        this.heal = 1;
        this.poison = 1;
        
        // Hunter is poisoned or not
        this.poisonedHunter = false;

        this.witchResponse = false;

        this.seerResponse = false;

        // Stores game over status
        //this.gameover = false;

        // People who have run for mayor
        this.mayorNominees = [];

        // People still in the election (excludes people who have dropped out during speeches)
        this.activeNominees = [];

        // Counts how many people have submitted whether to run for mayor
        this.mayorCount = 0;

        // Contains the mayor votes; structure like mayorVote[socket.id] = playerNum_they_voted_for
        this.mayorVote = {};

        // Counts how many mayor votes have been received
        this.mayorVoteCount = 0;

        // Contains the player votes; structure like vote[socket.id] = playerNum_they_voted_for
        this.vote = {};

        // Counts how many player votes have been received
        this.voteCount = 0;

        // Counts the amount of alive players in the game
        this.alivePlayers = 0;

        this.mayorID = null;
    }
  
    // This function adds a player to the game; it is called when someone enters the lobby
    addPlayer(socket, username) {

        // Adds the new player to the list of sockets
        this.sockets[socket.id] = socket;

        this.playerInLobby++;

        this.alivePlayers++;

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
            each_socket.emit(Constants.MSG_TYPES.START_GAME, this.players[playerID].getRole());
            //each_socket.emit(Constants.MSG_TYPES.ELECTION_START, this.players[playerID].getRole());
            //each_socket.emit(Constants.MSG_TYPES.START_VOTE);
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
            
            // If this playerID's corresponding role is 5 (Witch), store in this.witchID
            if (array[i] == 5)
                this.witchID = playerID;
            
            // If this playerID's corresponding role is 6 (hunter), store in this.witchID
            if (array[i] == 6)
                this.hunterID = playerID;

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

            

            // this is for testing purposes
            // const hunter_socket = this.sockets[this.hunterID];
            // hunter_socket.emit(Constants.MSG_TYPES.HUNTER_SHOOT, false);


            
            

            // TO DO: Delete this loop, and replace with the appropriate messages
            Object.keys(this.sockets).forEach(playerID => {

                if (playerID == this.seerID){
                    const seer_socket = this.sockets[this.seerID];
                    seer_socket.emit(Constants.MSG_TYPES.SEER_NIGHT);
                } else if (this.wolfIDs.includes(playerID)){
                    const wolf_socket = this.sockets[playerID];
                    wolf_socket.emit(Constants.MSG_TYPES.WOLF_NIGHT);
                } else {
                    const each_socket = this.sockets[playerID];
                    each_socket.emit(Constants.MSG_TYPES.GO_TO_NIGHT);
                }
                
            })


            /*
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.ELECTION_START);
            })
            */
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

        this.seerResponse = true;
        this.checkNightResponses();
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

    // checks if the game is over or not once a player is killed (including wolfkill, poison, exile, huntershoot, wolfselfexpose)
    check_game_over(){
        if(this.villagerCount == 0 || this.godCount == 0){
            // this.gameover = true;
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.GAME_OVER, 'Werewolves');
            })
        }else if(this.wolfCount == 0){
            // this.gameover = true;
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.GAME_OVER, 'Good people');
            })
        }
    }

    kill(numInput){
        Object.keys(this.players).forEach(playerID => {

            // If the player num is equal to the passed in argument, this player is killed
            const playerNum = this.players[playerID].getPlayerNum();
            const player = this.players[playerID];
            if(playerNum == numInput){
                player.dead();
                this.victim = player;
                this.deadAtNightPlayers[0] = player;
                this.deadCount++;
                this.deadIDs.push(playerID);
            }
        })  
        this.wolfIDs.forEach(playerID => {
            const wolf_socket = this.sockets[playerID];
            wolf_socket.emit(Constants.MSG_TYPES.WOLF_END);
        })
        this.check_game_over();
        this.kill_result_for_witch();
    }

    kill_result_for_witch(){
        var witch_socket = this.sockets[this.witchID];
        var resultToWitch = '';
        if(this.heal == 1){
            resultToWitch += `${this.victim.playerNum}. ${this.victim.username} was killed tonight, do you want to use the heal potion? <br>`;
        } else {
            resultToWitch += `You have already used your heal potion. <br>`;
        }

        if(this.poison == 1){
            resultToWitch += `Do you want to use the poison? <br>`;
        }else{
            resultToWitch += `You have already used your poison. <br>`;
        }


        witch_socket.emit(Constants.MSG_TYPES.KILL_RESULT, resultToWitch, this.heal, this.poison);
    }

    witch_heal(){
        this.victim.changeAliveStatus();
        this.victim = null;
        delete this.deadAtNightPlayers[0];
        this.deadCount--;
        this.heal--;
        this.check_hunter();
    }

    witch_poison(numInput){
        Object.keys(this.players).forEach(playerID => {

            // If the player num is equal to the passed in argument, this player is killed
            const playerNum = this.players[playerID].getPlayerNum();
            const player = this.players[playerID];
            if(playerNum == numInput){
                player.dead();
                this.deadAtNightPlayers[1] = player;
                this.deadCount++;
                this.deadIDs.push(playerID);
            }
        })

        var hunterNum = this.players[this.hunterID].getPlayerNum();
        if(hunterNum == numInput){
            this.poisonedHunter = true;
            // hunter gets notice about being poisoned by witch
        }

        this.poison--;
        this.check_hunter();
    }

    witch_skip(){
        this.check_hunter();
    }

    check_hunter(){

        if (this.deadIDs.includes(this.hunterID)){
            const hunter_socket = this.sockets[this.hunterID];
            hunter_socket.emit(Constants.MSG_TYPES.HUNTER_SHOOT, this.poisonedHunter);
            
        } else {
            this.witchResponse = true;
            this.checkNightResponses();
        }
    
        
    }

    hunter_skip(){

    }

    hunter_shoot(numInput){
        var shootResult = '';

        Object.keys(this.players).forEach(playerID => {

            // If the player num is equal to the passed in argument, this player is killed
            const playerNum = this.players[playerID].getPlayerNum();
            const player = this.players[playerID];
            if(playerNum == numInput){
                player.dead();
                this.deadCount++;
                this.deadIDs = playerID;
                shootResult += `${playerNum}. ${player.username} is shot by hunter.`;
            }
        })

        
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.SHOOT_RESULT, shootResult);
        })

    }

    checkNightResponses(){
        if (this.witchResponse && this.seerResponse){
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.ELECTION_START);
            })
        }
        this.witchResponse = false;
        this.seerResponse = true;
    }

    // Takes in the socket and whether this player is going to run for mayor
    run_for_mayor(socket, run){

        // If they are running, we add their IDs to both mayorNominees and activeNominees
        if (run){
            this.mayorNominees.push(socket.id)
            this.activeNominees.push(socket.id)
        }

        // Increment num of responses received
        this.mayorCount++;
        
        // Once we have everyone's responses
        if (this.mayorCount >= PLAYERNUM){
            var array = [];
            // Randomly assign speaking order
            this.mayorNominees.forEach( playerID => {
                array.push(this.players[playerID].playerNum);
            })
            array.sort();

            var rand = Math.floor(Math.random() * array.length);
            var direction = Math.round(Math.random());
            var speakingOrder = "";

            // Randomly assign speaking direction (1 -> 9 or 9 -> 1)
            if (direction == 0){
                for (var i = 0; i < array.length; i ++){
                    var index = (rand + i) % array.length; 
                    var playerNum = array[index]
                    speakingOrder += playerNum.toString() + " ";
                }
            } else {
                for (var i = array.length; i > 0; i --){
                    var index = (rand + i) % array.length; 
                    var playerNum = array[index]
                    speakingOrder += playerNum.toString() + " ";
                }
            }
            
            // Tell everyone election speeches have started
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.ELECTION_SPEECH_START, speakingOrder);
            })

            // For the host, they get an extra "MOVE TO VOTING" button
            const host_socket = this.sockets[this.hostID];
            host_socket.emit(Constants.MSG_TYPES.SHOW_MAYOR_BUTTON);

            // For mayor nominees, they have an extra "DROP OUT ELECTION" button
            this.mayorNominees.forEach(playerID => {
                const nominee_socket = this.sockets[playerID];
                nominee_socket.emit(Constants.MSG_TYPES.SHOW_DROP_OUT_BUTTON);
            })

            this.wolfIDs.forEach(playerID => {
                const wolf_socket = this.sockets[playerID];
                wolf_socket.emit(Constants.MSG_TYPES.WOLF_MAYOR_BUTTON);
            })

            // Show current nominee list 
            var nomineeList = "";

            array.forEach(playerNum => {
                Object.keys(this.players).forEach(playerID => {
                    if (this.players[playerID].getPlayerNum() == playerNum){
                        nomineeList += `${this.players[playerID].playerNum}. ${this.players[playerID].username}<br>` ;
                    }
                })
            })
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.UPDATE_CANDIDATES, nomineeList);
            })
        }
    }

    // Shows different screens during mayor voting phase
    mayor_vote(){
        Object.keys(this.sockets).forEach(playerID => {

            // If you had run (even if you then dropped out), you cannot vote
            if (this.mayorNominees.includes(playerID)){
                const nominee = this.sockets[playerID];
                nominee.emit(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE_CANDIDATE);
            } else {
                // All other players can vote
                const voter = this.sockets[playerID];
                voter.emit(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE);
            }
        })
    }

    // Handles situation when players drop out of election
    drop_out_election(socket){
        var nomineeList = "";

        var array = [];

        for (var i = 0; i < this.activeNominees.length; i ++){
            if (this.activeNominees[i] == socket.id){
                
                // Remove the player from this.activeNominees
                this.activeNominees.splice(i, 1);
                i--;
            } else {
                array.push(this.players[this.activeNominees[i]].playerNum);
            }
        }
        
        array.sort();


        array.forEach(playerNum => {
            Object.keys(this.players).forEach(playerID => {
                if (this.players[playerID].getPlayerNum() == playerNum){
                    nomineeList += `${this.players[playerID].playerNum}. ${this.players[playerID].username}<br>` ;
                }
            })
        })

        // Send nomineeList to everyone
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.UPDATE_CANDIDATES, nomineeList);
        })
    }

    // Tallies the mayor votes
    tally_mayor_vote(socket, num){

        // Pushes socket.id if array exists; if not, initialize it
        if (Array.isArray(this.mayorVote[num])){
            this.mayorVote[num].push(socket.id);
        } else {
            this.mayorVote[num] = [socket.id];
        }

        // Increment number of responses received
        this.mayorVoteCount++;

        // Once we get all responses
        if (this.mayorVoteCount >= (PLAYERNUM - this.mayorNominees.length)){
            
            var maxLength = 0;
            var mayor = 0;

            // Look at which player's array has the most elements (most votes)
            Object.keys(this.mayorVote).forEach(playerNum => {
                
                // Ignore if player voted for is 0
                if (playerNum != 0){
                    var length = this.mayorVote[playerNum].length;
                    if (length > maxLength){
                        maxLength = length;
                        mayor = playerNum;
                    }
                }
            })
            
            // Default is "no one", if there is even a single vote for a numbered player, the string will be overwritten
            var returnString = "No one (b/c most people voted 0)";

            // Find the player username associated with the number
            Object.keys(this.players).forEach(playerID =>{
                if (this.players[playerID].getPlayerNum() == mayor){
                    returnString = `${mayor}. ${this.players[playerID].username}`;
                    this.mayorID = playerID;
                }
            })

            // Send mayor reveal info to everyone
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.MAYOR_REVEAL, returnString, 0);
            })

            // Host gets additional MOVE TO DAY button
            const host_socket = this.sockets[this.hostID];
            host_socket.emit(Constants.MSG_TYPES.REVEAL_MOVE_TO_DAY_BUTTON);
        }
    }

    move_to_day(){
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.MOVE_TO_DAY);
        })

        if (this.mayorID == null){
            const host_socket = this.sockets[this.hostID];
            host_socket.emit(Constants.MSG_TYPES.REVEAL_MOVE_TO_VOTE_BUTTON);
        } else {
            const mayor_socket = this.sockets[this.mayorID];
            mayor_socket.emit(Constants.MSG_TYPES.REVEAL_MOVE_TO_VOTE_BUTTON);
        }
        

        this.wolfIDs.forEach(playerID => {
            const wolf_socket = this.sockets[playerID];
            wolf_socket.emit(Constants.MSG_TYPES.WOLF_VOTE_REVEAL);
        })

    }

    move_to_vote(){
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.MOVE_TO_VOTING);
        })
    }

    wolf_vote_reveal(socket){
        var message = `${this.players[socket.id].playerNum}. ${this.players[socket.id].username} `;
        message = message + "has revealed themselves!<br>" + message;
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.VOTE_REVEAL, message);
        })
    }

    // Same as mayor_tally_vote except we check for alivePlayers
    tally_vote(socket, num){
        if (Array.isArray(this.vote[num])){
            this.vote[num].push(socket.id);
        } else {
            this.vote[num] = [socket.id];
        }

        this.voteCount++;
        if (this.voteCount >= (this.alivePlayers)){
            var maxLength = 0;
            var dead = 0;
            Object.keys(this.vote).forEach(playerNum => {
                if (playerNum != 0){
                    var length = this.vote[playerNum].length;
                    if (length > maxLength){
                        maxLength = length;
                        dead = playerNum;
                    }
                }
            })
            var returnString = "No one (b/c most people voted 0)";
            Object.keys(this.players).forEach(playerID =>{
                if (this.players[playerID].getPlayerNum() == dead){
                    returnString = `${dead}. ${this.players[playerID].username}`
                }
            })
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.VOTE_REVEAL, returnString);
            })
        }
    }

    wolf_mayor_reveal(socket){
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.MAYOR_REVEAL, `${this.players[socket.id].playerNum}. ${this.players[socket.id].username} just revealed themselves! <br>No one (b/c wolf reveal)`, this.players[socket.id].playerNum);
        })

        // Host gets additional MOVE TO DAY button
        const host_socket = this.sockets[this.hostID];
        host_socket.emit(Constants.MSG_TYPES.REVEAL_MOVE_TO_DAY_BUTTON);
    }
}

module.exports = Game;
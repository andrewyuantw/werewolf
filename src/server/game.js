const Player = require('./player');
const Constants = require('../shared/constants');
const socket = require('socket.io-client/lib/socket');
const { findLastKey } = require('lodash');
const { RuleTester } = require('eslint');

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
        this.current_roster = [];

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

        // Hunter shot or not
        this.hunterShotOrNot = false;

        // Coordinates the timing of when to move to day
        // Server needs to receive witchResponse AND seerResponse to move onto day
        this.witchResponse = false;

        this.seerResponse = false;

        // Stores game over status
        this.gameover = false;
        this.winner = '';

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

        this.moveToDay = true;

        this.firstNight = true;

        this.firstMayorTie = true;

        this.firstVoteTie = true;

        this.voteTied = [];

        this.gameStarted = false;
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
        this.current_roster.push(username);

        // Sets this.hostID to be the first person to join the game
        if (this.hostID == null){
            this.hostID = socket.id;
        }

        socket = this.sockets[socket.id];
        socket.emit(Constants.MSG_TYPES.YOUR_NUMBER, this.playerInLobby);

        // Send a message to every player in the game so they can update their lobby display
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];

            for (var i = 0; i < this.current_roster.length ; i ++){
                each_socket.emit(Constants.MSG_TYPES.JOIN_LOBBY, this.current_roster[i], i + 1);
            }
        })

        // If we have enough players, we send a message to the host only
        if (this.playerInLobby >= PLAYERNUM){
            const host_socket = this.sockets[this.hostID];
            host_socket.emit(Constants.MSG_TYPES.ENOUGH_PEOPLE);
        }
    }

    // Removes a player from the game
    removePlayer(socket) {

        if (!Object.keys(this.players).includes(socket.id)){
            return;
        }

        var disconnectedPlayerNum = this.players[socket.id].playerNum;
        console.log(disconnectedPlayerNum);
        delete this.sockets[socket.id];
        delete this.players[socket.id];
        console.log(`player ${socket.id} disconnected`)

        this.playerInLobby--;
        this.alivePlayers--;

        this.current_roster.splice(disconnectedPlayerNum - 1, 1);

        if (this.gameStarted){

            this.deadIDs.push(socket.id);
            this.decrement_role_num(socket.id);
            this.remove_dead_player_ID(socket.id);

            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.PLAYER_DISCONNECTED, disconnectedPlayerNum);
            })
        } else {
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                for (var i = 0; i < this.current_roster.length ; i ++){
                    console.log(i);
                    each_socket.emit(Constants.MSG_TYPES.JOIN_LOBBY, this.current_roster[i], i + 1);
                }
                each_socket.emit(Constants.MSG_TYPES.JOIN_LOBBY, "", this.current_roster.length + 1);
                if (this.players[playerID].playerNum > disconnectedPlayerNum){
                    each_socket.emit(Constants.MSG_TYPES.YOUR_NUMBER, this.players[playerID].playerNum - 1);
                    this.players[playerID].playerNum = this.players[playerID].playerNum - 1;
                }
            })
        }
    }

    // Starts the game for all players
    startGame(){

        // Assigns roles to each player
        this.assignRoleNumber();

        // Sends a server message to everyone with their role in the form of a string
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.START_GAME, this.players[playerID].getRole());
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

        this.gameStarted = true;

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
                //this.mayorID = playerID; // for testing purposes

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
            
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.GO_TO_NIGHT);
                if (playerID == this.seerID){
                    const seer_socket = this.sockets[this.seerID];
                    seer_socket.emit(Constants.MSG_TYPES.SEER_NIGHT);
                } else if (this.wolfIDs.includes(playerID)){
                    const wolf_socket = this.sockets[playerID];
                    wolf_socket.emit(Constants.MSG_TYPES.WOLF_NIGHT);
                }
                
                
                
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
        if (!this.gameover){
            if (this.villagerCount == 0 || this.godCount == 0) {
                this.gameover = true;
                this.winner = 'Werewolves ';
            } else if (this.wolfCount == 0) {
                this.gameover = true;
                this.winner = 'Good people ';
            }
        }
    }

    game_over(){

        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.GAME_OVER, this.winner);
        })
    }

    decrement_role_num(playerID){

        if (playerID == this.seerID || playerID == this.witchID || playerID == this.hunterID)
            this.godCount--;
        else if (this.wolfIDs.includes(playerID)){
            this.wolfCount--;
        }
        else
            this.villagerCount--;
    }

    remove_dead_player_ID(playerID){
        if (playerID == this.seerID){
            this.seerID = null;
        } else if (playerID == this.witchID){
            this.witchID = null;
        } else if (playerID == this.hunterID){
            this.hunterID = null;
        } else if (this.wolfIDs.includes(playerID)){
            this.wolfIDs.splice(this.wolfIDs.indexOf(playerID), 1);
        }
        if (playerID == this.hostID){
            this.hostID = Object.keys(this.players)[Math.floor(Math.random()*Object.keys(this.players).length)];
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
                this.deadAtNightPlayers.push(playerID);
                this.deadCount++;
                this.deadIDs.push(playerID);
                
                this.decrement_role_num(playerID);


                //this.mayorID = playerID; // for testing purposes
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
        if (this.witchID == null){
            this.witchResponse = true;
            this.checkNightResponses();
            return;
        }
        var resultToWitch = '';
        var ableToHeal = true;
        if(this.heal == 1){
            resultToWitch += `${this.victim.playerNum}. ${this.victim.username} was killed tonight, do you want to use the heal potion? <br>`;
            if (this.victim.getSocketID() == this.witchID && !this.firstNight) {
                ableToHeal = false;
                resultToWitch += `You cannot use heal potion on yourself after first night. :( <br>`
            }
        } else {
            resultToWitch += `You have already used your heal potion. <br>`;
        }

        if(this.poison == 1){
            resultToWitch += `Do you want to use the poison? <br>`;
        }else{
            resultToWitch += `You have already used your poison. <br>`;
        }

        witch_socket.emit(Constants.MSG_TYPES.KILL_RESULT, resultToWitch, this.heal, this.poison, ableToHeal);
    }

    witch_heal(){
        this.victim.changeAliveStatus();
        var victimNum = this.victim.getPlayerNum();
        this.deadIDs.forEach(playerID => {
            const playerNum = this.players[playerID].getPlayerNum();
            if(playerNum == victimNum){
                this.deadIDs.splice(this.deadIDs.indexOf(playerID), 1);
                if(playerID == this.seerID || playerID == this.witchID || playerID == this.hunterID)
                    this.godCount++;
                else if(this.wolfIDs.includes(playerID))
                    this.wolfCount++;
                else
                    this.villagerCount++;
                
                this.deadAtNightPlayers.splice(this.deadAtNightPlayers.indexOf(playerID), 1);
            }
        })
        this.victim = null;
        
        this.deadCount--;
        this.heal--;
        this.witchResponse = true;
        
        if (this.gameover) {
            this.gameover = false;
            this.winner = '';
        }
        this.checkNightResponses();
    }

    witch_poison(numInput){
        Object.keys(this.players).forEach(playerID => {

            // If the player num is equal to the passed in argument, this player is killed
            const playerNum = this.players[playerID].getPlayerNum();
            const player = this.players[playerID];
            
            if(playerNum == numInput){
                if(playerID == this.hunterID){
                    this.poisonedHunter = true;
                    // hunter gets notice about being poisoned by witch
                }
                if (this.deadAtNightPlayers.indexOf(playerID) == -1){
                    player.dead();
                    this.deadAtNightPlayers.push(playerID);
                    this.deadCount++;
                    this.deadIDs.push(playerID);

                    this.decrement_role_num(playerID);
                }
                
                this.check_game_over();
            }
        })


        this.poison--;
        this.witchResponse = true;
        this.checkNightResponses();
    }

    witch_skip(){
        this.witchResponse = true;
        this.checkNightResponses();
    }

    check_hunter(){

        if (!this.hunterShotOrNot && this.deadIDs.includes(this.hunterID) ){
            const hunter_socket = this.sockets[this.hunterID];
            hunter_socket.emit(Constants.MSG_TYPES.HUNTER_SHOOT, this.poisonedHunter);
            
        } else {
            this.check_mayor();
        }
    
        
    }

    hunter_skip(){
        this.hunterShotOrNot = true;
        this.check_mayor();
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
                this.deadIDs.push(playerID);

                this.decrement_role_num(playerID);
                this.remove_dead_player_ID(playerID);
                this.check_game_over();

                shootResult += `${playerNum}. ${player.username} is shot by hunter.`;
            }
        })
        this.hunterShotOrNot = true;
        
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.SHOOT_RESULT, shootResult);
        })

        
        if (this.mayorID == null){
            const host_socket = this.sockets[this.hostID];
            host_socket.emit(Constants.MSG_TYPES.REVEAL_CONFIRM_SHOT_BUTTON);
        } else {
            const mayor_socket = this.sockets[this.mayorID];
            mayor_socket.emit(Constants.MSG_TYPES.REVEAL_CONFIRM_SHOT_BUTTON);
        }
        
    }

    confirm_shot(){
        this.check_mayor();
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.SHOT_END);
        })

    }

    check_mayor(){
        if (this.gameover) {
            this.game_over();
        } else {
            this.deadAtNightPlayers.forEach(playerID => {
                this.remove_dead_player_ID(playerID);
                this.deadAtNightPlayers.splice(this.deadAtNightPlayers.indexOf(playerID), 1);
            })
            if (this.deadIDs.includes(this.mayorID)) {
                const mayor_socket = this.sockets[this.mayorID];
                mayor_socket.emit(Constants.MSG_TYPES.MAYOR_SUCCESSOR);
            
            } else {
                if (this.moveToDay)
                    this.move_to_day();
                else
                    this.move_to_night();
            }
        }
        
    
        
    }

    new_mayor(numInput){

        var result = '';
        if (numInput == 0){
            this.mayorId == null;
            result += 'The mayor destroyed the badge, there will be no mayor this game.';
        } else {
            
            Object.keys(this.players).forEach(playerID => {
                const playerNum = this.players[playerID].getPlayerNum();
                if(playerNum == numInput){
                    this.mayorID = playerID;
                }
            })
            result += `${this.players[this.mayorID].playerNum}. ${this.players[this.mayorID].username} is the new mayor.`;
        }
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.NEW_MAYOR, result);
        })

        if (this.mayorID == null){
            const host_socket = this.sockets[this.hostID];
            host_socket.emit(Constants.MSG_TYPES.REVEAL_CONFIRM_NEW_MAYOR_BUTTON);
        } else {
            const mayor_socket = this.sockets[this.mayorID];
            mayor_socket.emit(Constants.MSG_TYPES.REVEAL_CONFIRM_NEW_MAYOR_BUTTON);
        }
    }

    confirm_new_mayor(){
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.SUCCESSOR_END);
        })

        if (this.moveToDay)
            this.move_to_day();
        else
            this.move_to_night();
    }

    dead_reveal(){
        if (this.gameover) {
            this.game_over();
        } else {
            var result = '';
            var deadNums = [];
            if (this.deadAtNightPlayers.length == 0) {
                result += 'No one died last night.';
            } else {
                result += 'Player died last night: '

                var tempArray = [];

                this.deadAtNightPlayers.forEach(playerID =>{
                    tempArray.push(this.players[playerID].getPlayerNum());
                })

                tempArray.sort();

                tempArray.forEach(playerNum => {

                    Object.keys(this.players).forEach(playerID =>{
                        if (this.players[playerID].getPlayerNum() == playerNum){
                            const player = this.players[playerID];
                            deadNums.push(playerNum);
                            result += `${playerNum}. ${player.username} `;
                        }
                    })
                    
                })
            }

            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.REVEAL_DEAD_LAST_NIGHT, result, deadNums);
            })

            if (this.mayorID == null){
                const host_socket = this.sockets[this.hostID];
                host_socket.emit(Constants.MSG_TYPES.REVEAL_CONFIRM_DEATH_BUTTON);
            } else {
                const mayor_socket = this.sockets[this.mayorID];
                mayor_socket.emit(Constants.MSG_TYPES.REVEAL_CONFIRM_DEATH_BUTTON);
            }
        }
    }

    confirm_death(){
        this.check_hunter();
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.DEATH_END);
        })

    }

    move_to_night(){
        Object.keys(this.sockets).forEach(playerID => {

            if (playerID == this.seerID){
                const seer_socket = this.sockets[this.seerID];
                seer_socket.emit(Constants.MSG_TYPES.SEER_NIGHT);
            } else if (this.wolfIDs.includes(playerID)){
                const wolf_socket = this.sockets[playerID];
                wolf_socket.emit(Constants.MSG_TYPES.WOLF_NIGHT);
            }
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.GO_TO_NIGHT);
            
            
        })
        this.moveToDay = true;
    }

    checkNightResponses(){
        
        if (this.witchResponse && this.seerResponse){


            const seer_socket = this.sockets[this.seerID];
            seer_socket.emit(Constants.MSG_TYPES.SEER_END);
            if (this.firstNight){
                Object.keys(this.sockets).forEach(playerID => {
                    const each_socket = this.sockets[playerID];
                    each_socket.emit(Constants.MSG_TYPES.ELECTION_START);
                })
            } else {
                this.dead_reveal();
            }
            
            this.witchResponse = false;
            this.seerResponse = false;

            
        }
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
            var activeNomineeListToSend = [];

            array.forEach(playerNum => {
                Object.keys(this.players).forEach(playerID => {
                    if (this.players[playerID].getPlayerNum() == playerNum){
                        nomineeList += `${this.players[playerID].playerNum}. ${this.players[playerID].username}<br>` ;
                        activeNomineeListToSend.push(this.players[playerID].playerNum);
                    }
                })
            })

            
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.UPDATE_CANDIDATES, nomineeList, activeNomineeListToSend);
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


        var activeNomineeListToSend = [];
        array.forEach(playerNum => {
            Object.keys(this.players).forEach(playerID => {
                if (this.players[playerID].getPlayerNum() == playerNum){
                    nomineeList += `${this.players[playerID].playerNum}. ${this.players[playerID].username}<br>` ;
                    activeNomineeListToSend.push(this.players[playerID].playerNum);
                }
            })
        })

        // Send nomineeList to everyone
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.UPDATE_CANDIDATES, nomineeList, activeNomineeListToSend);
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

            var votingHistory = "";

            var tie = false;

            // Look at which player's array has the most elements (most votes)
            Object.keys(this.mayorVote).forEach(playerNum => {
                
                // Ignore if player voted for is 0
                if (playerNum != 0){
                    var length = this.mayorVote[playerNum].length;
                    if (length > maxLength){
                        maxLength = length;
                        mayor = playerNum;
                        tie = false;
                    } else if (length == maxLength) {
                        tie = true;
                    }
                }
                if (playerNum != 0)
                    votingHistory += `Voted for ${playerNum}: `;
                else
                    votingHistory += `Abstained: `;

                var tempVote = [];
                this.mayorVote[playerNum].forEach(playerWhoVoted =>{

                    Object.keys(this.players).forEach(playerID =>{
                        if (playerID == playerWhoVoted){
                            tempVote.push(this.players[playerID].playerNum);
                            
                        }
                    })

                })

                tempVote.sort();

                tempVote.forEach(playerNum =>{
                    votingHistory += playerNum + " ";
                })


                votingHistory += "<br>";
            })
            
            // Default is "no one", if there is even a single vote for a numbered player, the string will be overwritten
            var returnString = "Everyone abstained!";

            // Find the player username associated with the number
            Object.keys(this.players).forEach(playerID =>{
                if (this.players[playerID].getPlayerNum() == mayor){
                    returnString = `${mayor}. ${this.players[playerID].username} is now your mayor!`;
                    this.mayorID = playerID;
                }
            })

            if (tie && this.firstMayorTie){
                returnString = "It's a tie!";
                this.mayorNominees = [];
                this.activeNominees = [];
                Object.keys(this.mayorVote).forEach(playerNum => {
                    var length = this.mayorVote[playerNum].length;
                    if (length == maxLength){
                        // We've found the playerNum of someone in the second election
                        Object.keys(this.players).forEach(playerID =>{
                            if (this.players[playerID].getPlayerNum() == playerNum){
                                this.mayorNominees.push(playerID);
                                this.activeNominees.push(playerID);
                            }
                        })
                    }

                });
                this.mayorVote = {};
                this.mayorVoteCount = 0;
                
            } else if (tie){
                returnString = "It's a tie!";
                
            }

            // Send mayor reveal info to everyone
            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.MAYOR_REVEAL, returnString, 0, votingHistory);
            })

            // Host gets additional MOVE TO DAY button
            const host_socket = this.sockets[this.hostID];
            if (tie && this.firstMayorTie){
                host_socket.emit(Constants.MSG_TYPES.REVEAL_MAYOR_TIE_BUTTON);
                this.firstMayorTie = false;
            } else {
                host_socket.emit(Constants.MSG_TYPES.REVEAL_MOVE_TO_DAY_BUTTON);
                
            }
        }
    }

    move_to_day(){
        if (this.firstNight){
            this.dead_reveal();
            this.firstNight = false;
        } else {
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

            this.moveToDay = false;
        }
    }

    move_to_vote(){
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];

            if (this.deadIDs.includes(playerID)){
                console.log("dead person detected");
                each_socket.emit(Constants.MSG_TYPES.MOVE_TO_MAYOR_VOTE_CANDIDATE);
            } else {
                each_socket.emit(Constants.MSG_TYPES.MOVE_TO_VOTING);
            }
        })
    }

    wolf_vote_reveal(socket){
        var message = `${this.players[socket.id].playerNum}. ${this.players[socket.id].username} `;
        message = message + "has revealed themselves!<br>";

        this.deadIDs.push(socket.id);
        this.decrement_role_num(socket.id);
        this.remove_dead_player_ID(socket);

        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.VOTE_REVEAL, message, "");
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
        if (this.voteCount >= (PLAYERNUM - this.deadIDs.length)){
            var maxLength = 0;
            var dead = 0;

            var votingHistory = "";

            var tie = false;

            Object.keys(this.vote).forEach(playerNum => {

                if (playerNum != 0){
                    var length = this.vote[playerNum].length;
                    if (this.vote[playerNum].includes(this.mayorID)){
                        length += 0.5;
                    }
                    if (length > maxLength){
                        maxLength = length;
                        dead = playerNum;
                        tie = false;
                        this.voteTied = [playerNum];
                    } else if (length == maxLength){
                        tie = true;
                        this.voteTied.push(playerNum);
                    }
                }
                if (playerNum != 0)
                    votingHistory += `Voted for ${playerNum}: `;
                else
                    votingHistory += `Abstained: `;

                var tempVote = [];
                
                this.vote[playerNum].forEach(playerWhoVoted =>{

                    Object.keys(this.players).forEach(playerID =>{
                        if (playerID == playerWhoVoted){
                            tempVote.push(this.players[playerID].playerNum);
                        }
                    })
                })

                tempVote.sort();

                tempVote.forEach(playerNum =>{
                    votingHistory += playerNum + " "; 
                })

                votingHistory += "<br>";

            })

            var returnString = "Everyone abstained!";


            Object.keys(this.players).forEach(playerID =>{
                if (this.players[playerID].getPlayerNum() == dead){
                    returnString = `${dead}. ${this.players[playerID].username} is now DEAD...`
                    this.deadIDs.push(playerID);
                    this.decrement_role_num(playerID);
                    this.remove_dead_player_ID(playerID);
                }
            })


            if (tie && this.firstVoteTie){
                returnString = "It's a tie!";
                this.vote = [];
            } else if (tie){
                returnString = "It's a tie!";
            }

            Object.keys(this.sockets).forEach(playerID => {
                const each_socket = this.sockets[playerID];
                each_socket.emit(Constants.MSG_TYPES.VOTE_REVEAL, returnString, votingHistory);
            })

            const host_socket = (this.mayorID == null) ? this.sockets[this.hostID] : this.sockets[this.mayorID]
            
            if (tie && this.firstVoteTie){
                host_socket.emit(Constants.MSG_TYPES.REVEAL_VOTE_TIE_BUTTON);
                this.firstVoteTie = false;
            } else {
                host_socket.emit(Constants.MSG_TYPES.REVEAL_MOVE_TO_AFTER_VOTE_BUTTON);
                this.firstVoteTie = true;
            }

            this.voteCount = 0;

        }
    }

    wolf_mayor_reveal(socket){
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.MAYOR_REVEAL, `${this.players[socket.id].playerNum}. ${this.players[socket.id].username} just revealed themselves!`, this.players[socket.id].playerNum, "");
        })
        this.deadIDs.push(socket.id);
        this.decrement_role_num(socket.id);
        this.remove_dead_player_ID(socket);

        // Host gets additional MOVE TO DAY button
        const host_socket = this.sockets[this.hostID];
        host_socket.emit(Constants.MSG_TYPES.REVEAL_MOVE_TO_DAY_BUTTON);
    }

    mayorTie(){
        
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

    voteTie(){
        Object.keys(this.sockets).forEach(playerID => {
            const each_socket = this.sockets[playerID];
            each_socket.emit(Constants.MSG_TYPES.MOVE_TO_VOTING, this.voteTied);
        })
    }

    afterVote(){
        this.check_game_over();
        if (this.gameover){
            this.game_over();
        } else {
            this.check_hunter();
        }
    }
}

module.exports = Game;
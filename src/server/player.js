class Player {

    constructor(id, username, playerNum) {

        // Stores their socket ID, can be used to dereference the game.players and game.sockets objects
        this.socketID = id;

        // Stores their displayed username
        this.username = username;

        // Stores their player number (1 to 9)
        // Other players will use this number when voting / killing
        this.playerNum = playerNum;

        // Stores a role number, that way we can work with numbers instead of strings
        this.roleNumber = 0;

        // Stores string value of their role
        this.role = "";

        // Stores alive status of the player
        this.alive = true;
    }

    // Sets the role with the passed in randomized integer value
    setRole(num){

        this.roleNumber = num;
        switch(num){
            case 1:
                
            case 2:
                
            case 3:
                this.role = "Villager";
                break
            case 4: 
                this.role = "Seer";
                break;
            case 5:
                this.role = "Witch";
                break;
            case 6:
                this.role = "Hunter";
                break;
            case 7:

            case 8:

            case 9:
                this.role = "Wolf";
                break;
        }
    }

    // Get functions

    getSocketID(){
        return this.socketID;
    }

    getRole(){
        return this.role;
    }

    getRoleNumber(){
        return this.roleNumber;
    }

    getPlayerNum(){
        return this.playerNum;
    }

    getAliveStatus(){
        return this.alive;
    }

    dead(){
        this.alive = false;
    }
    changeAliveStatus(){
        this.alive = !this.alive;
    }
}

module.exports = Player;
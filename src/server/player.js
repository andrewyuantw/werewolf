class Player {
    constructor(id, username) {
        this.username = username;
        this.roleNumber = 0;
        this.role = "";
    }

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

    getRole(){
        return this.role;
    }
}

module.exports = Player;
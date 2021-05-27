const Player = require("./player");

class Wolf extends Player {
    
    getWolfOrNot(){
        return true;
    }
}

module.exports = Wolf;
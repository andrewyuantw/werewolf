const God = require("./god");

class Seer extends God {
    checkPlayer(target){
        return target.getWolfOrNot();
    }
}

module.exports = Seer;
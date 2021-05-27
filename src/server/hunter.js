const God = require("./god");


class Hunter extends God {
    
    shoot(target){
        target.dead();
    }
}

module.exports = Hunter;
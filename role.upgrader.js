var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // if (creep.room.name !== creep.memory.home) {
        //     var exit = creep.room.findExitTo(creep.memory.home);
        //     // and move to exit
        //     creep.moveTo(creep.pos.findClosestByRange(exit));
        //     creep.say("back back");
        //     return;
        // }

        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.working) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            creep.getEnergy(true, true);
        }
    }
};

module.exports = roleUpgrader;
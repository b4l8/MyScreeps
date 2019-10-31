var roleUpgrader = require('role.upgrader');
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy === 0){
            creep.memory.working = false;
        } else if (creep.memory.working === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            // if (creep.room.name !== creep.memory.home) {
            //     var exit = creep.room.findExitTo(creep.memory.home);
            //     // and move to exit
            //     creep.moveTo(creep.pos.findClosestByRange(exit));
            //     creep.say("back back");
            //     return;
            // }
            var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) &&
                        structure.energy < structure.energyCapacity;
                }
            });

            if(!target) {
                target = creep.room.storage;
                // target = creep.pos.findClosestByPath(STRUCTURE_STORAGE);
            }

            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                roleUpgrader.run(creep);
            }
        }
        else {
            creep.getEnergy(true, true);
        }
    }
};

module.exports = roleHarvester;
var roleLorry = {
    run: function(creep) {
        // state shift
        if(creep.memory.working && creep.carry.energy === 0){
            creep.memory.working = false;
        } else if (!creep.memory.working && creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }
        if(creep.memory.working) {
            // search
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) &&
                        structure.energy < structure.energyCapacity;
                }
            });

            if (!target) {
                target = creep.room.storage;
                // target = creep.pos.findClosestByPath(STRUCTURE_STORAGE);
            }

            if(target) {
                creep.say("transfer")
                if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        else {
            // getEnergy
            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
            });

            if(!container) {
                container = creep.room.storage;
            }

            if(container) {
                if(creep.withdraw(container,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                    creep.moveTo(container);
                }
            }
        }
    }
};
module.exports = roleLorry;
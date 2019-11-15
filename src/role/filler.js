var filler = {
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
                        structure.structureType === STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
            });

            if (!target) {
                target = creep.room.storage;
            }

            if(target) {
                creep.say("transfer");
                if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'},reusePath:50});
                }
            }
        }
        else {
            // getEnergy
            let link_receiver = Game.getObjectById('5dbfc25b4f6cbc4090af17bb');

            if(link_receiver) {
                if(creep.withdraw(link_receiver,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                    creep.moveTo(link_receiver,{reusePath:50});
                }
            }
        }
    }
};


module.exports = filler;
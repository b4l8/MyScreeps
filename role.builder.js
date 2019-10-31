var roleUpgrader = require('role.upgrader');
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // if target is defined and creep is not in target room
        // if (creep.memory.target !== undefined && creep.room.name !== creep.memory.target) {
        //     // find exit to target room
        //     var exit = creep.room.findExitTo(creep.memory.target);
        //     // move to exit
        //     creep.moveTo(creep.pos.findClosestByRange(exit));
        //     // return the function to not do anything else
        //     return;
        // }


        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
            creep.memory.working = true;
            creep.say('🚧 build');
        }

        if(creep.memory.working) {
            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES,{
                filter: (s) => {
                    return  s.structureType !== STRUCTURE_WALL
                        && s.structureType !== STRUCTURE_ROAD;
                }
            });
            //var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            }
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
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
module.exports = roleBuilder;
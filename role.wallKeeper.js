var roleBuilder = require('role.builder');

var roleWallKeeper = {
    /** @param {creep} creep */
    run: function(creep) {
        if(creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = true;
            creep.say('🚧 keeper!');
        }

        if(creep.memory.working) {

            var walls = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_WALL ||
                    s.structureType === STRUCTURE_RAMPART
            });
            var target = undefined;
            if(walls.length > 0){
                //console.log('wall : '+walls[0].pos + walls[0].hits + '/'+ walls[0].hitsMax);
                if(!creep.memory.current_objective){
                    creep.memory.current_objective = walls[0].hits+ 0.0001 * walls[0].hitsMax;
                }

                for(const wall of walls){
                    if(wall.hits < creep.memory.current_objective){
                        target = wall;
                        break;
                    }
                }
            }

            // if we find a wall that has to be repaired
            if (target) {
                if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target,{reusePath: 10});
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                roleBuilder.run(creep);
            }

        }
        else {
            creep.getEnergy(true,true);
        }
    }
};

module.exports = roleWallKeeper;
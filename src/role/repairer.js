var roleBuilder = require('Scripts/src/role/builder');

var repairer = {
    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        else if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('🚧 repair');
        }

        if(creep.memory.working) {
            var structure = creep.pos.findClosestByPath(FIND_STRUCTURES,{
                filter: (s)=> (s.hits < s.hitsMax &&
                    s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_ROAD
                    && s.structureType !== STRUCTURE_RAMPART)
            });

            if(!structure){
                structure = creep.pos.findClosestByPath(FIND_STRUCTURES,{
                    filter: (s) => {
                        return  s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART;
                    }
                });
            }

            if(structure) {
                if( creep.repair(structure) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 10});
                }
            } else {
                roleBuilder.run(creep);
            }
        }
        else {
            creep.getEnergy(true, true);
        }
    }
};

module.exports = repairer;
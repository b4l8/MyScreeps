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


        if(creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.working = true;
            creep.say('🚧 build');
        }

        if(creep.memory.working) {
            // var sup_builders = Game.rooms['E25S8'].find(FIND_MY_CREEPS,{
            // filter: s=>{return s.memory.role === 'builder';} });

            // if(sup_builders.length ===0&&creep.room.name!=='E25S8'){
            //   let exit=creep.room.findExitTo('E25S8');
            //  creep.moveTo(creep.pos.findClosestByPath(exit));
            //   creep.say('sup,sup');
            //  console.log('suppoting neighbor');
            // return;
            // }

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
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 10 });
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
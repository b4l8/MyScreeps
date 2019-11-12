var roleLorry = {
    run: function(creep) {
        // state shift
        //console.log(creep.name +' free cap: '+creep.store.getUsedCapacity() );
        if(creep.memory.working && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0){
            creep.memory.working = false;
        } else if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {

            creep.memory.working = true;
        }
        if(creep.memory.working) {
            // search
            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) &&
                        (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            });

            if(creep.store.getUsedCapacity(RESOURCE_ENERGY) !== creep.store.getUsedCapacity(RESOURCE_ENERGY)){
                target = creep.room.storage;
            }

            if (!target) {
                // let container_target = creep.room.controller.pos.findInRange(FIND_STRUCTURES,5, {
                //         filter:(s) =>{
                //             return s.structureType === STRUCTURE_CONTAINER &&
                //                 s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                //         }
                //     }
                // );
                // //console.log('find around ctrl container!'+container_target.length );
                // if(container_target.length > 0) {
                //     target = container_target[0];
                // }
                // else
                    if(creep.room.storage){
                    target = creep.room.storage;
                }
            }

            if(target) {
                creep.say(target.structureType);
                if(target.structureType === STRUCTURE_STORAGE) {
                    for(var res in creep.store){
                        if(creep.transfer(target, res) === ERR_NOT_IN_RANGE){
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 10});
                        }
                    }
                }
                else if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 10});
                }
            }
        }
        else {
            // getEnergy
            let dropps = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (d) => d.amount >= 50
            });
            if(dropps.length){
                if(creep.pickup(dropps[0])=== ERR_NOT_IN_RANGE){
                    creep.moveTo(dropps[0],{reusePath: 5});
                }
                return;
            }

            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) =>{
                    return s.structureType === STRUCTURE_CONTAINER &&
                        s.pos.findInRange(FIND_SOURCES, 2).length > 0
                        &&(s.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity(RESOURCE_ENERGY)/2) ;
                }
            });

            if(!container) {
                container = creep.room.storage;
            } else {
                creep.say('go mine');
            }

            if(container) {
                if(creep.withdraw(container,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                    creep.moveTo(container,{reusePath: 5});
                }
            }
        }
    }
};
module.exports = roleLorry;
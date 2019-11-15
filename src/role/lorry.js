/*
 * carry gets energy and brings it to the storage
 *
 * Moves to the 'targetId', picks up energy from container or dropped,
 * move back to storage, on meeting other creeps the energy is transferred,
 * energy is transferred to other structures, too.
 */

roles.carry = {};

roles.carry.buildRoad = true;
roles.carry.flee = true;
// TODO 6: boost creep
//roles.carry.boostActions = ['capacity'];

roles.carry.settings = {
    param: ['energyCapacityAvailable'],
    prefixString: {
        300: '',
        550: 'W',
    },
    layoutString: 'CM',
    amount: config.carry.sizes,
    maxLayoutAmount: 1,
};

// no need implement this for now
// roles.carry.updateSettings = function(room, creep) {
//     // TODO 4:helper not implement
//     if (creep.helper) {
//         return {
//             prefixString: config.buildRoad.buildToOtherMyRoom ? 'W' : '',
//             layoutString: 'MC',
//             amount: {
//                 0: [3, 3], // RCL 1
//                 550: [4, 4], // RCL 2
//                 800: [6, 6], // RCL 3
//                 1300: [11, 11], // RCL 4
//                 1800: [15, 15], // RCL 5
//                 2300: [21, 21], // RCL 6
//             },
//         };
//     }
// };


roles.carry.action = function(creep) {
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
            let container_target = creep.room.controller.pos.findInRange(FIND_STRUCTURES,5, {
                    filter:(s) =>{
                        return s.structureType === STRUCTURE_CONTAINER &&
                            s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                }
            );
            //console.log('find around ctrl container!'+container_target.length );
            if(container_target.length > 0) {
                target = container_target[0];
            }
            else if(creep.room.storage){
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
};
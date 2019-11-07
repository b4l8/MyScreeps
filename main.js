require('prototype.creep');
require('prototype.tower');
require('spawn_control');
//const profiler = require('screeps-profiler');

// This line monkey patches the global prototypes.
//profiler.enable()
module.exports.loop = function () {
    //profiler.wrap(
        // cpu debug start
    //    function() {
            //Game.creeps['Eella'].memory.role = 'builder';

    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        } else {
            //Game.creeps[name].memory.home = 'E25S7';
            //let subTimeStart=Game.cpu.getUsed();
            Game.creeps[name].runRole();
            //let subTimeEnd=Game.cpu.getUsed();
           // console.log(name+'('+Game.creeps[name].memory.role+'): '+(subTimeEnd-subTimeStart).toFixed(2));
        }
    }


    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        tower.defend();
    }

    var link_mine  = Game.getObjectById('5dbfc4283dd92f665a2443c2');
    var link_spawn = Game.getObjectById('5dbfc25b4f6cbc4090af17bb');
    var link_rc = Game.getObjectById('5dc2a2fc5241c1c1c4c6c200');
    if(link_mine.store.getUsedCapacity(RESOURCE_ENERGY) > link_mine.store.getFreeCapacity(RESOURCE_ENERGY) &&link_mine.cooldown === 0 ){
        if(link_rc.store.getFreeCapacity(RESOURCE_ENERGY)> link_mine.store.getUsedCapacity(RESOURCE_ENERGY)){
            link_mine.transferEnergy(link_rc);
        } else if(link_spawn.store.getFreeCapacity(RESOURCE_ENERGY)> link_mine.store.getUsedCapacity(RESOURCE_ENERGY)){
            link_mine.transferEnergy(link_spawn);
        }

    }

    // for each spawn
    for (let spawnName in Game.spawns) {
        Game.spawns[spawnName].spawnControl();
    }
       // }
    //);


};

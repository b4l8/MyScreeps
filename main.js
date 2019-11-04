require('prototype.creep');
require('prototype.tower');
require('spawn_control');

module.exports.loop = function () {
    //Game.creeps['Eella'].memory.role = 'builder';
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        } else {
            Game.creeps[name].memory.home = 'E25S7';
            Game.creeps[name].runRole();
        }
    }

    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        tower.defend();
    }

    var link_sender  = Game.getObjectById('5dbfc4283dd92f665a2443c2');
    var link_receiver = Game.getObjectById('5dbfc25b4f6cbc4090af17bb');
    if(link_sender.cooldown === 0 && link_receiver.energy < link_receiver.energyCapacity){
        link_sender.transferEnergy(link_receiver);
    }
    // spawn control !
    Game.spawns['Spawn1'].spawnControl();

};

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

    // spawn control !
    Game.spawns['Spawn1'].spawnControl();

};

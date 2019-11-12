var roleMiner = {
    run: function(creep) {
        var source = Game.getObjectById(creep.memory.sourceId);
        let linker = source.pos.findInRange(FIND_STRUCTURES,2,{
            filter: s => s.structureType === STRUCTURE_LINK
        })[0];
        let fill_linker = false;

        if(linker && linker.store.getFreeCapacity(RESOURCE_ENERGY)>0){
            fill_linker = true;
        }

        if(fill_linker && creep.carry.energy === creep.carryCapacity){
            creep.transfer(linker, RESOURCE_ENERGY);
        } else {
            let container = source.pos.findInRange(FIND_STRUCTURES,1,{
                filter: s => s.structureType == STRUCTURE_CONTAINER
            })[0];
            if(!container) {
                creep.say('no container');
                return;
            }
            // same position
            if(creep.pos.isEqualTo(container.pos)){
                creep.harvest(source);
            }
            else {
                creep.say('Container!');
                creep.moveTo(container,{reusePath:50});
            }
        }
    }
};

module.exports = roleMiner;
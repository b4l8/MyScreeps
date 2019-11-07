var roles = {
    harvester:require('role.harvester'),
    upgrader:require('role.upgrader'),
    builder:require('role.builder'),
    repairer:require('role.repairer'),
    lorry:require('role.lorry'),
    miner:require('role.miner'),
    wallkeeper: require('role.wallKeeper'),
    traveler: require('role.traveler'),
    archer:require('role.archer'),
    filler:require('role.filler'),
    claimer:require('role.claimer')
};

Creep.prototype.runRole = function() {
    roles[this.memory.role].run(this);
};
/**
 * @function
 * @param {boolean}useContainer
 * @param {boolean}useSource
 */
Creep.prototype.getEnergy = function(useContainer,useSource) {
    /** @type {StructureContainer} **/
    let container;
    // if(this.getActiveBodyparts(CARRY)){
    //     let dropps = this.room.find(FIND_DROPPED_RESOURCES, {
    //                 filter: (d) => d.amount >= 50 && d.resourceType === RESOURCE_ENERGY
    //             });
    //     if(dropps.length){
    //         if(this.pickup(dropps[0])=== ERR_NOT_IN_RANGE){
    //             this.moveTo(dropps[0]);
    //         }
    //         return;
    //     }
    // }

    if(useContainer) {
        container = this.pos.findClosestByPath(FIND_STRUCTURES,{
            filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ||
            s.structureType === STRUCTURE_LINK) && s.store[RESOURCE_ENERGY] > this.store.getFreeCapacity(RESOURCE_ENERGY)/2
        });

        if(container !== undefined) {
            if(this.withdraw(container,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                this.moveTo(container,{reusePath:10});
            }
        }
    }

    if(container == undefined && useSource) {
        var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if(this.harvest(source) == ERR_NOT_IN_RANGE) {
            this.moveTo(source,{reusePath:10});
        }
    }
};
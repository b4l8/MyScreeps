StructureTower.prototype.defend
 = function () {
    var target = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if(target){
        this.attack(target);
    } else {
        target = this.pos.findClosestByRange(FIND_MY_STRUCTURES,{
            filter: (structure)=> structure.hits < structure.hitsMax &&
                !(structure.structureType === STRUCTURE_RAMPART &&
                    structure.hits/ structure.hitsMax> 0.05)
        });
        if(target) {
            this.repair(target);
        }
    }
};
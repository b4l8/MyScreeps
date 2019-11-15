Room.prototype.handleTower = function() {
    const towers = this.findPropertyFilter(FIND_MY_STRUCTURES, 'structureType', [STRUCTURE_TOWER]);
    if (towers.length === 0) {
        return false;
    }

    const hostileCreeps = this.find(FIND_HOSTILE_CREEPS);
    // TODO 5: after friend list
    // const hostileCreeps = this.find(FIND_HOSTILE_CREEPS, {
    //     filter: (object) => !brain.isFriend(object.owner.username),
    // });
    if (hostileCreeps.length > 0) {
        let tower;
        const hostileOffset = {};
        const sortHostiles = function(object) {
            return tower.pos.getRangeTo(object) + (hostileOffset[object.id] || 0);
        };

        // is that attack queue: tower has a closer creep
        const towersAttacking = _.sortBy(towers, (object) => {
            const hostile = object.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            return object.pos.getRangeTo(hostile);
        });

        // TODO 8: this is an algorithm that use tower attack different target , NOT beautiful
        for (tower of towersAttacking) {
            const hostilesSorted = _.sortBy(hostileCreeps, sortHostiles);
            tower.attack(hostilesSorted[0]);
            hostileOffset[hostilesSorted[0].id] = 100;
        }
        return true;
    }

    if (config.tower.healCreeps) {
        const myCreeps = this.find(FIND_MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax;
            },
        });
        if (myCreeps.length > 0) {
            for (const tower of towers) {
                tower.heal(myCreeps[0]);
            }
            return true;
        }
    }

    if (this.controller.level < 4) {
        return false;
    }

    if (!config.tower.repairStructures) {
        return true;
    }

    if (!this.memory.repair_min) {
        this.memory.repair_min = 0;
    }

    // TODO 7: remember to get it full hp when i became rich
    const repairableStructures = (object) => object.hits < object.hitsMax / 2;

    for (const tower of towers) {
        if (tower.energy === 0) {
            continue;
        }
        if (!this.exectueEveryTicks(10)) {
            if (tower.energy < tower.energyCapacity / 2 || this.memory.repair_min > 1000000) {
                continue;
            }
        }

        // TODO 3: find out how it works
        const lowRampart = tower.pos.findClosestByRangePropertyFilter(FIND_STRUCTURES, 'structureType', [STRUCTURE_RAMPART], {
            filter: (rampart) => rampart.hits < 10000,
        });

        let repair = lowRampart;
        if (lowRampart === null) {
            repair = tower.pos.findClosestByRangePropertyFilter(FIND_STRUCTURES, 'structureType', [STRUCTURE_WALL, STRUCTURE_RAMPART], {
                inverse: true,
                filter: repairableStructures,
            });
            tower.repair(repair);
        }
    }
    return true;
};
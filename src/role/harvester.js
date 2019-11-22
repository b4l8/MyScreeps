'use strict';

/*
 * harvester makes sure that extensions are filled
 *
 * Before storage or certains store threshold:
 *  - get dropped energy or from source
 *  - fill extensions
 *  - build constructionSites
 *  - upgrade Controller
 *
 * Proper storage store level:
 *  - Move along the harvester path
 *  - pathPos === 0 get energy from storage
 *  - transfer energy to extensions in range
 */

roles.harvester = {};

roles.harvester.settings = {
    param: ['controller.level', 'energyAvailable'],
    layoutString: 'MWC',
    amount: {
        1: [2, 1, 1],
    },
    maxLayoutAmount: 6,
};
roles.harvester.updateSettings = function(room, creep) {
    if (room.storage && room.storage.my && room.storage.store.energy > config.creep.energyFromStorageThreshold && room.energyAvailable > 350 && !room.memory.misplacedSpawn) {
        return {
            prefixString: 'WMC',
            layoutString: 'MC',
            amount: [1, 2],
            maxLayoutAmount: 12,
        };
    } else if (room.storage && !room.storage.my) {
        return {
            maxLayoutAmount: 999,
        };
    }
};

roles.harvester.buildRoad = true;
// roles.harvester.boostActions = ['capacity'];
roles.harvester.action = function(creep) {
    if (!creep.memory.routing.targetId) {
        creep.memory.routing.targetId = 'harvester';
    }

    if (!creep.room.storage || !creep.room.storage.my || (creep.room.storage.store.energy + creep.carry.energy) < config.creep.energyFromStorageThreshold) {
        creep.harvesterBeforeStorage();
        creep.memory.routing.reached = false;
        return true;
    }

    creep.memory.move_forward_direction = false;
    creep.memory.routing.reverse = true;
    delete creep.memory.routing.reached;
    return true;
};
'use strict';

/*
 * upgrader upgrades the controller
 *
 * Gets the energy from the storage
 * Shouts out the player idiot values
 */

roles.upgrader = {};
roles.upgrader.settings = {
    param: ['controller.level'],
    prefixString: {
        1: 'MCW',
    },
    layoutString: {
        1: 'MW',
    },
    amount: {
        4: [1, 2],
    },
    maxLayoutAmount: {
        1: 10,
        8: 1,
    },
};

roles.upgrader.updateSettings = function(room, creep) {
    if (!room.storage) {
        return false;
    }
    // One work part one energy per tick multiplied by config value with  lifetime
    // So have at least a specific amount of energy in storage that the upgrader
    // can use.
    // Example with upgraderStorageFactor 2:
    // 6453 energy in storage are 2 workParts
    // 3000 energy will be put in the controller

    const maxWorkingParts = _.random(36, 48);
    let workParts = Math.floor((room.storage.store.energy + 1) / (CREEP_LIFE_TIME * config.room.upgraderStorageFactor));
    workParts = Math.min(workParts, maxWorkingParts - 1);
    if (room.controller.level === 8) {
        workParts = Math.min(workParts, 15);
    }
    const maxLayoutAmount = Math.max(0, Math.floor((workParts - 1) / 2));
    if (config.debug.upgrader) {
        room.log(`upgrader updateSettings - storage.energy: ${room.storage.store.energy} upgraderStorageFactor: ${config.room.upgraderStorageFactor} workParts: ${workParts} maxLayoutAmount: ${maxLayoutAmount}`);
    }
    return {
        maxLayoutAmount: maxLayoutAmount,
    };
};
let CONTROLLER_MESSAGE;

class Upgrader extends MetaRole {
    getBuild(room, options) {
        this.setBuildDefaults(room, options);
        return Creep.buildFromTemplate([MOVE, CARRY, WORK], options.energy)
    }

    getPriority(creep) {
        return PRIORITIES_CREEP_UPGRADER
    }

    /** @param {Creep} creep **/
    run(creep) {
        const link = creep.room.controller.getLink();
        if (creep.carry[RESOURCE_ENERGY] / creep.carryCapacity < 0.5) {
            if (link && link.energy > 0) {
                if (creep.pos.isNearTo(link)) {
                    creep.withdraw(link, RESOURCE_ENERGY)
                } else {
                    creep.travelTo(link)
                }
            }
        }// TODO: here link / recharge logic need optimise

        if (creep.recharge()) {
            return
        }

        if (!creep.room.controller.sign || creep.room.controller.sign.text !== CONTROLLER_MESSAGE) {
            if (!creep.pos.isNearTo(creep.room.controller)) {
                creep.travelTo(creep.room.controller)
            } else {
                creep.signController(creep.room.controller, CONTROLLER_MESSAGE)
            }
        } else {
            if (!creep.pos.inRangeTo(creep.room.controller, 2)) {
                creep.travelTo(creep.room.controller)
            }
        }

        if (creep.pos.inRangeTo(creep.room.controller, 3)) {
            creep.upgradeController(creep.room.controller)
        }
    }
}

module.exports = Upgrader;
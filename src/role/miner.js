'use strict';

/*
 * Harvesting sources is done by sourcer
 *
 * Moves to the source and gets energy
 * In external rooms builds a container
 * In internal rooms transfers to the link
 *
 * If 'threshold' energy is in the container or on the ground
 * a carry is called
 */

roles.miner = {};

roles.miner.settings = {
    param: ['energyCapacityAvailable'],
    prefixString: {
        300: 'MW',
        600: 'MWC',
    },
    layoutString: {
        300: 'W',
        650: 'MW',
    },
    amount: {
        300: [1],
        350: [2],
        450: [3],
        550: [4],
        650: [1, 4],
        700: [2, 4],
    },
    maxLayoutAmount: {
        300: 1,
    },
};

roles.miner.buildRoad = true;
roles.miner.killPrevious = true;

// TODO should be true, but flee must be fixed before 2016-10-13
roles.miner.flee = false;

roles.miner.updateSettings = function(room, creep) {
    if (!room.storage) {
        return false;
    }
    const target = creep.routing && creep.routing.targetRoom ? creep.routing.targetRoom : room.name;
    const inBase = (target === room.name);
    if (!inBase && Memory.rooms[target].sourceKeeperRoom) {
        return {
            prefixString: 'MC',
            layoutString: 'MW',
            sufixString: 'MH',
            amount: [5, 10],
            maxLayoutAmount: 1,
        };
    }
    return false;
};

roles.miner.died = function(name, memory) {
    // console.log(name, 'died', JSON.stringify(memory));
    delete Memory.creeps[name];
};

roles.miner.action = function(creep) {
    creep.pickupEnergy();
    // TODO 7: harvest with source keeper
    //creep.checkForSourceKeeper();
    creep.handleMiner();
    return true;
};

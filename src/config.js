'use strict';

global.brain = {
    stats: {},
    main: {},
};
global.roles = {};
global.cache = {
    rooms: {},
    segments: {},
};

global.config = {
    stats:{
        enbaled: true,
        summary: false,
    },

    // what is this?
    //
    // memory: {
    //     segments: 20,
    //     segmentsEnabled: false,
    // },

    profiler: {
        enabled : false
    },

    tower:{
        healCreeps: true,
        repairStructures:false,
    },

    carry:{
        sizes: {
            0: [3, 3], // RCL 1
            550: [4, 4], // RCL 2
            800: [6, 6], // RCL 3
            1300: [6, 11], // RCL 4
            1800: [8, 15], // RCL 5
            2300: [11, 21], // RCL 6
        },
        minSpawnRate: 50,
        // Percentage should increase from base to target room. Decrease may cause stack on border
        carryPercentageBase: 0.1,
        carryPercentageHighway: 0.2,
        carryPercentageExtern: 0.5,
        callHarvesterPerResources: 1000,
    },

    room:{
        reservedRCL: {
            0: 1,
            1: 1,
            2: 1,
            3: 1,
            4: 1,
            5: 1,
            6: 1,
            7: 1,
            8: 1,
        },
    },

    creep: {
        //renewOffset: 0,
        //queueTtl: 100,
        //structurer: true,
        //structurerInterval: 1500,
        //structurerMinEnergy: 1300,
        //reserverDefender: true,
        energyFromStorageThreshold: 2000,
        sortParts: true,
        swarmSourceHarvestingMaxParts: 10,
    },

    terminal: {
        // terminals should not have to much enrgy, but not to less
        minEnergyAmount: 40000,
        maxEnergyAmount: 50000,
        storageMinEnergyAmount: 20000,
    },

    priorityQueue: {
        sameRoom: {
            harvester: 1,
            sourcer: 2,
            storagefiller: 3,
            defendranged: 4,
            carry: 5,
        },
        otherRoom: {
            harvester: 11,
            defender: 12,
            defendranged: 13,
            nextroomer: 15,
            carry: 16,
            watcher: 17,
            atkeeper: 18,
            atkeepermelee: 18,
            sourcer: 19,
            reserver: 20,
        },
    },

    main: {
        enabled: true,
        // see roomExecution for detail
        randomExecution: false,
        executeAll: 10,
        lowExecution: 0.5,
    },

    cpuStats: {
        enabled: false,
    },
};


brain.prepareMemory = function() {
    Memory.username = Memory.username || _.chain(Game.rooms).map('controller').flatten().filter('my').map('owner.username').first().value();
    Memory.myRooms = Memory.myRooms || [];
    // TODO 4: Implement this later after fight roles
    //Memory.squads = Memory.squads || {};
    Memory.skippedRooms = [];
    // TODO 3: Market after terminal and mineral
    //brain.setMarketOrders();
    // TODO 5： auto construction after a stable version
    //brain.setConstructionSites();
    brain.cleanCreeps();
    // TODO 4: Implement this with squads
    //brain.cleanSquads();
    // TODO 6: When I need scout - reserver?
    // brain.cleanRooms();
    if (config.stats.summary) {
        brain.printSummary();
    }
};

brain.addToStats = function(name) {
    const role = Memory.creeps[name].role;
    brain.stats.modifyRoleAmount(role, -1);
};

brain.cleanCreeps = function() {
    // Cleanup memory
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            brain.addToStats(name);
            // TODO 2: is it supposed to reuse these data instead of just delete them? Now I delete all
            delete Memory.creeps[name];

            /*
            if ((name.startsWith('reserver') && Memory.creeps[name].born < (Game.time - CREEP_CLAIM_LIFE_TIME)) || Memory.creeps[name].born < (Game.time - CREEP_LIFE_TIME)) {
                delete Memory.creeps[name];
                continue;
            }

            const creepMemory = Memory.creeps[name];
            if (creepMemory.killed) {
                delete Memory.creeps[name];
                continue;
            }

            if (creepMemory.recycle) {
                delete Memory.creeps[name];
                continue;
            }

            brain.handleUnexpectedDeadCreeps(name, creepMemory);
            */
        }
    }
};


//////////////////// for summary
brain.printSummary = function() {
    // change summary duration
    const interval = 100;
    if (Game.time % interval !== 0) {
        return;
    }
    const diff = Game.gcl.progress - Memory.progress;
    Memory.progress = Game.gcl.progress;

    const strings = {
        storageNoString: '',
        storageLowString: '',
        storageMiddleString: '',
        storageHighString: '',
        storagePower: '',
        upgradeLess: '',
    };
    for (const name of Memory.myRooms) {
        const room = Game.rooms[name];
        if (!room || !room.storage) {
            strings.storageNoString += name + ' ';
            if (room) {
                room.memory.upgraderUpgrade = 0;
            }
            continue;
        }
        brain.getStorageStringForRoom(strings, room, interval);
    }
    Memory.summary = strings;

    console.log(`=========================
Progress: ${diff / interval}/${Memory.myRooms.length * 15}
ConstructionSites: ${Object.keys(Memory.constructionSites).length}
-------------------------
No storage: ${strings.storageNoString}
Low storage: ${strings.storageLowString}
Middle storage: ${strings.storageMiddleString}
High storage: ${strings.storageHighString}
-------------------------
Power storage: ${strings.storagePower}
-------------------------
Upgrade less: ${strings.upgradeLess}
=========================`);
};

brain.getStorageStringForRoom = function(strings, room, interval) {
    const addToString = function(variable, name, value) {
        strings[variable] += name + ':' + value + ' ';
    };

    if (room.storage.store[RESOURCE_ENERGY] < 200000) {
        addToString('storageLowString', room.name, room.storage.store[RESOURCE_ENERGY]);
    } else if (room.storage.store[RESOURCE_ENERGY] > 800000) {
        addToString('storageHighString', room.name, room.storage.store[RESOURCE_ENERGY]);
    } else {
        addToString('storageMiddleString', room.name, room.storage.store[RESOURCE_ENERGY]);
    }
    if (room.storage.store[RESOURCE_POWER] && room.storage.store[RESOURCE_POWER] > 0) {
        addToString('storagePower', room.name, room.storage.store[RESOURCE_POWER]);
    }
    // TODO 15 it should be
    if (Math.ceil(room.memory.upgraderUpgrade / interval) < 15) {
        addToString('upgradeLess', room.name, room.memory.upgraderUpgrade / interval);
    }
    room.memory.upgraderUpgrade = 0;
};
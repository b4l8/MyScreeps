brain.main.execute = function() {
    if (Game.time > 1000 && Game.cpu.bucket < 2 * Game.cpu.tickLimit && Game.cpu.bucket < Game.cpu.limit * 10) {
        console.log(`${Game.time} Skipping tick CPU Bucket too low. bucket: ${Game.cpu.bucket} tickLimit: ${Game.cpu.tickLimit} limit: ${Game.cpu.limit}`);
        return;
    }

    Memory.time = Game.time;
    try {
        brain.prepareMemory();
        // TODO 5: buy power after market
        // brain.buyPower();
        // TODO 6: after scout
        // brain.handleNextroom();
        // TODO 4: handle squad
        // brain.handleSquadmanager();
        // TODO 5: handle market
        //brain.handleIncomingTransactions();
        // TODO 10: Consider quest system?
        // brain.handleQuests();
    } catch (e) {
        console.log('Brain Exception', e.stack);
    }

    brain.stats.addRoot();
    brain.main.roomExecution();
    //if (config.memory.segmentsEnabled) {
        // TODO 1: find out what is this !
        //brain.saveMemorySegments();
    //}
    // TODO 1: find out its priority
    //brain.main.visualizeRooms();
    // TODO 1: not difficult. but not so necessary for now
    // brain.main.updateSkippedRoomsLog();
    brain.stats.add(['cpu'], {
        used: Game.cpu.getUsed(),
    });
};

// room execution via sigmoid function
// all rooms execute every config.main.executeAll ticks
brain.main.roomExecution = function() {
    if (Game.time % config.main.executeAll === 0) {
        Memory.myRooms = _(Game.rooms).filter((r) => r.execute()).map((r) => r.name).value();
    } else {
        /** @see https://github.com/TooAngel/screeps/pull/498#discussion-diff-165847270R92 */
        const roomList = config.main.randomExecution ? _.shuffle(Game.rooms) : Game.rooms;
        global.cpuUsed = Game.cpu.getUsed();
        Memory.myRooms = _(roomList).filter(brain.main.roomFilter).map((r) => r.name).value();
    }
};

brain.main.roomFilter = (r) => {
    global.tickLimit = global.cpuLimit();
    if (Game.cpu.getUsed() < Game.cpu.limit) {
        r.execute();
        // TODO 1: implement Debug module
        // if (config.debug.cpu) {
        //     r.log(`Before: ${global.cpuUsed} After: ${Game.cpu.getUsed()} Diff: ${Game.cpu.getUsed() - global.cpuUsed} limit: ${Game.cpu.limit} tickLimit: ${Game.cpu.tickLimit}`);
        // }
    } else {
        Memory.skippedRooms.push(r.name);
    }
    global.cpuUsed = Game.cpu.getUsed();
    return Memory.myRooms.indexOf(r.name) !== -1;
};
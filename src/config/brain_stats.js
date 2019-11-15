'use_strict';

brain.stats.init = function() {
  const userName = Memory.username;
    if (!config.stats.enabled || !userName) {
        return false;
    }
    Memory.stats = {[userName]: {roles: {}, room: {}}};
    // The _ creates a lodash object which allows for implicit method chaining.
    // Implicit method chaining means that in certain circumstances it may return a primitive value,
    // in others it may return a lodash object that you need to unwrap by calling .value() on it.
    // If you'd use _.chain(...), you'd be creating a lodash object with explicit method chaining.
    // The result is always a wrapped value and always needs to be unwrapped by calling .value() on it.
    Memory.stats[userName].roles = _(Game.creeps).map((c) => c.memory.role).countBy().value();

    if (config.cpuStats.enable) {
        const startCpuWith = {load: global.load, time: Game.time, bucket: Game.cpu.bucket, tickLimit: global.tickLimit};
        Memory.cpuStats = {
            start: startCpuWith,
            last: startCpuWith,
            summary: {maxBucket: Game.cpu.bucket, maxLoad: global.load, minBucket: Game.cpu.bucket, runTime: 0},
        };
    }
};

brain.stats.updateCpuStats = function() {
    if (config.cpuStats.enable) {
        Memory.cpuStats.last = {
            load: _.round(Game.cpu.getUsed()),
            time: Game.time,
            bucket: Game.cpu.bucket,
            tickLimit: global.cpuLimit(),
        };
        Memory.cpuStats.summary = {
            maxBucket: Math.max(Memory.cpuStats.summary.maxBucket, Memory.cpuStats.last.bucket),
            maxLoad: Math.max(Memory.cpuStats.summary.maxLoad, Memory.cpuStats.last.load),
            minBucket: Math.min(Memory.cpuStats.summary.minBucket, Memory.cpuStats.last.bucket),
            runTime: Memory.cpuStats.last.time - Memory.cpuStats.start.time,
        };
    }
};

/**
 * stats.add use for push anything into Memory.stats at a given place.
 *
 * @param {Array} path Sub stats path.
 * @param {Any} newContent The value to push into stats.
 * @return {boolean}
 */
brain.stats.add = function(path, newContent) {
    // add has a rate
    if (!config.stats.enabled || Game.time % 3) {
        return false;
    }

    const userName = Memory.username;
    Memory.stats = Memory.stats || {};
    Memory.stats[userName] = Memory.stats[userName] || {};

    let current = Memory.stats[userName];
    for (const item of path) {
        if (!current[item]) {
            current[item] = {};
        }
        current = current[item];
    }

    current = _.merge(current, newContent);
    return true;
};

/**
 * stats.addRoot sets the root values, cpu, exec, gcl
 *
 * @return {boolean}
 */
brain.stats.addRoot = function() {
    if (!config.stats.enabled || Game.time % 3) {
        return false;
    }
    brain.stats.add([], {
        cpu: {
            limit: Game.cpu.limit,
            tickLimit: Game.cpu.tickLimit,
            bucket: Game.cpu.bucket,
        },
        exec: {
            halt: Game.cpu.bucket < Game.cpu.tickLimit * 2,
        },
        gcl: {
            level: Game.gcl.level,
            progress: Game.gcl.progress,
            progressTotal: Game.gcl.progressTotal,
        },
    });
    return true;
};

brain.stats.modifyRoleAmount = function(role, diff) {
    const userName = Memory.username;
    if (!config.stats.enabled || !userName) {
        return false;
    }
    if (Memory.stats && Memory.stats[userName] && Memory.stats[userName].roles) {
        const roleStat = Memory.stats[userName].roles[role];
        const previousAmount = roleStat ? roleStat : 0;
        const amount = (diff < 0 && previousAmount < -diff) ? 0 : previousAmount + diff;
        brain.stats.add(['roles', role], amount);
    } else {
        brain.stats.init();
    }
};
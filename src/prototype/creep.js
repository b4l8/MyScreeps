
/**
 * checkForHandle - Checks if the creep can be handled with the usual workflow
 * - spawning creeps are skipped
 * - recycling is handled here
 * - Check if the role is valid
 *
 * @return {boolean} - Creep is ready for handling
 **/
Creep.prototype.checkForHandle = function() {
    if (this.spawning) {
        return false;
    }

    // TODO 4: recycle creep
    // if (this.memory.recycle) {
    //     Creep.recycleCreep(this);
    //     return false;
    // }

    const role = this.memory.role;
    if (!role) {
        this.log('Creep role not defined for: ' + this.id + ' ' + this.name.split('-')[0].replace(/[0-9]/g, ''));
        this.memory.killed = true;
        this.suicide();
        return false;
    }
    return true;
};

/**
 * unit - return the unit configuration for this creep
 *
 * @return {object} - The generic configuration for this creep role
 **/
Creep.prototype.unit = function() {
    return roles[this.memory.role];
};

Creep.prototype.handle = function() {
    if (!this.checkForHandle()) {
        return;
    }

    try {
        if (this.unit().setup) {
            this.unit().setup(this);
        }

        // TODO 4: boost creep after basic fight module
        // if (!this.memory.boosted && this.boost()) {
        //     return true;
        // }

        // TODO 2: path finder
        //if (this.memory.routing && this.memory.routing.reached) {
            return this.unit().action(this);
        //}

        // TODO 2: path finder
        // if (this.followPath(this.unit().action)) {
        //     return true;
        // }
        // TODO 2: log sys
        //this.log('Reached end of handling() why?', JSON.stringify(this.memory));
    } catch (err) {
        let message = 'Executing creep role failed: ' +
            this.room.name + ' ' +
            this.name + ' ' +
            this.id + ' ' +
            JSON.stringify(this.pos) + ' ' +
            err;
        if (err !== null) {
            message += '\n' + err.stack;
        }

        this.log(message);
        Game.notify(message, 30);
    } finally {
        if (this.fatigue === 0) {
            if (this.memory.last === undefined) {
                this.memory.last = {};
            }
            const last = this.memory.last;
            this.memory.last = {
                pos1: this.pos,
                pos2: last.pos1,
                pos3: last.pos2,
            };
        }
    }
};

Creep.prototype.setNextSpawn = function() {
    if (!this.memory.nextSpawn) {
        this.memory.nextSpawn = Game.time - this.memory.born - config.creep.renewOffset;

        if (this.ticksToLive < this.memory.nextSpawn) {
            this.respawnMe();
        }
    }
};

/**
 * inBase - Checks if the creep is in its base
 *
 * @return {boolean} If creep is in its base
 **/
Creep.prototype.inBase = function() {
    return this.room.name === this.memory.base;
};
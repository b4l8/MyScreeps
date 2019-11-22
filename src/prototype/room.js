Room.prototype.execute = function() {
    this.memory.lastSeen = Game.time;
    try {
        const returnCode = this.handle();
        // TODO 10: maybe use a list of creeps?
        for (const creep of this.find(FIND_MY_CREEPS)) {
            creep.handle();
        }
        return returnCode;
    } catch (err) {
        // this.log('Executing room failed: ' + this.name + ' ' + err + ' ' + err.stack);
        Game.notify('Executing room failed: ' + this.name + ' ' + err + ' ' + err.stack, 30);
        return false;
    }
};

Room.prototype.handle = function() {
    if (this.controller && this.controller.my) {
        return this.myHandleRoom();
    }
    // TODO 4 : after nextroomer, external room handler
    //return this.externalHandleRoom();
};

Room.prototype.exectueEveryTicks = function(ticks) {
    const timer = (ticks > 3000) ? Game.time - Memory.time + 1 : 0;
    let exectue = false;
    // Guess this is to avoid all room tick at same time ?
    // TODO 10: got better idea? such as sos lib
    if (this.controller) {
        exectue = (timer > 1) ? (Game.time + this.controller.pos.x + this.controller.pos.y) % ticks < timer : (Game.time + this.controller.pos.x + this.controller.pos.y) % ticks === 0;
    } else {
        exectue = (timer > 1) ? (Game.time % ticks) < timer : (Game.time % ticks) === 0;
    }
    return exectue;
};

Room.structureHasEnergy = (structure) => structure.store && structure.store.energy || structure.energy;
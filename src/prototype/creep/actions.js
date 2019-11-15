'use strict'

Creep.prototype.recharge = function () {
    // Check to see if creep needs to recharge

    if (this.carry[RESOURCE_ENERGY] <= 0) {
        this.memory.recharge = true
    }

    // * 0.75 will call stop charging without full. NG
    // TODO: Consider reduce capacity if * 0.75 really necessary
    if (this.carry[RESOURCE_ENERGY] >= (this.carryCapacity)) {
        delete this.memory.recharge
    }
    if (!this.memory.recharge) {
        return false
    }
    let energy_demands = 0.75 * this.store.getFreeCapacity(RESOURCE_ENERGY);
    // See if creep can get energy from storage, or as a fallback from terminal.
    let storage = false;

    if (this.room.storage) {
        // if can harvest link beside storage, use that link
        const storageLink = this.room.storage.getLink();
        if (storageLink && (storageLink.energy > energy_demands)) {
            storage = storageLink
        } // if can't check that storage
        else if (this.room.storage.store[RESOURCE_ENERGY] > energy_demands){
            storage = this.room.storage
        }
    }

    // TODO: optimise for terminal
    // if (!storage) {
    //     if (this.room.terminal && this.room.terminal.store[RESOURCE_ENERGY]) {
    //         storage = this.room.terminal
    //     }
    // }

    if (storage) {
        if (!this.pos.isNearTo(storage)) {
            this.travelTo(storage)
        } else {
            this.withdraw(storage, RESOURCE_ENERGY)
        }
        return true
    }

    // Create a bigger scope for this variable ( used here and in the filter in containers )
    // let carryCap = this.carryCapacity;

    // Check for qualifying dropped energy.
    // TODO: drop energy search with structure????  I'm angry
    const resources = this.room.find(FIND_DROPPED_RESOURCES, {filter: function (resource) {
            if (resource.resourceType !== RESOURCE_ENERGY || resource.amount < carryCap) {
                return false
            }

            // Is resource on top of container?
            const structures = resource.pos.lookFor(LOOK_STRUCTURES);
            for (let structure of structures) {
                if (structure.structureType === STRUCTURE_CONTAINER) {
                    return true
                }
            }

            // Is the resource near the room storage?
            if (resource.room.storage && resource.room.storage.pos.getRangeTo(resource) <= 2) {
                return true
            }

            // // Is the resource on top of the suicide booth?
            // const suicideBooth = resource.room.getSuicideBooth();
            // if (suicideBooth && resource.pos.getRangeTo(suicideBooth) === 0) {
            //     return true
            // }

            return false
        }});

    if (resources.length > 0) {
        const resource = this.pos.findClosestByRange(resources)
        if (!this.pos.isNearTo(resource)) {
            this.travelTo(resource)
        }
        if (this.pos.isNearTo(resource)) {
            this.pickup(resource)
        }
        return true
    }

    // If there is no storage check for containers.
    const containers = _.filter(this.room.structures[STRUCTURE_CONTAINER], (a) => a.store[RESOURCE_ENERGY] > Math.min(a.storeCapacity, carryCap))
    if (containers.length > 0) {
        const container = this.pos.findClosestByRange(containers)
        if (!this.pos.isNearTo(container)) {
            this.travelTo(container)
        }
        if (this.pos.isNearTo(container)) {
            this.withdraw(container, RESOURCE_ENERGY)
        }
        return true
    }

    // As a last resort harvest energy from the active sources.
    if (this.getActiveBodyparts(WORK) <= 0) {
        // Still returning true because the creep still does need to recharge.
        return true
    }
    const sources = this.room.find(FIND_SOURCES_ACTIVE);
    if (sources.length <= 0) {
        // Still returning true since energy is still needed
        return true
    }

    // least choice:  harvest to familiar one
    // TODO : Not very good solution to avoid focusing on same source
    sources.sort((a, b) => a.pos.getRangeTo(a.room.controller) - b.pos.getRangeTo(b.room.controller))
    const idx = parseInt(this.name[this.name.length - 1], 36);
    const source = sources[idx % sources.length];
    if (!this.pos.isNearTo(source)) {
        this.travelTo(source)
    } else {
        this.harvest(source)
    }
    return true
};

Creep.prototype.recycle = function () {
    let storage = this.room.storage
    if (!storage && this.room.terminal) {
        storage = this.room.terminal
    }

    // Empty creep of all resources, dump them in storage.
    if (this.getCarryPercentage() > 0) {
        if (storage) {
            if (this.pos.isNearTo(storage)) {
                this.transferAll(storage)
            } else {
                this.travelTo(storage)
            }
            return
        }
    }

    // No spawn - time to suicide.
    if (!this.room.structures[STRUCTURE_SPAWN]) {
        this.suicide()
        return
    }

    // Pick the location immediately above the spawn and recycle there.
    const suicideBooth = this.room.getSuicideBooth()
    if (this.pos.getRangeTo(suicideBooth) > 0) {
        this.travelTo(suicideBooth)
    } else {
        let spawn = this.pos.findClosestByRange(this.room.structures[STRUCTURE_SPAWN])
        spawn.recycleCreep(this)
    }
};

Creep.prototype.transferAll = function (target) {
    if (this.getCarryPercentage() <= 0) {
        return ERR_NOT_ENOUGH_RESOURCES
    }
    if (!this.pos.isNearTo(target)) {
        return ERR_NOT_IN_RANGE
    }
    const resources = Object.keys(this.carry)
    let resource
    for (resource of resources) {
        if (this.carry[resource] > 0) {
            return this.transfer(target, resource)
        }
    }
    // this line should never get reached
    return false
};

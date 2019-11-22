Creep.prototype.harvesterBeforeStorage = function() {
    const methods = [];

    methods.push(Creep.getEnergy);

    if (this.room.controller && (this.room.controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[this.room.controller.level] / 10 || this.room.controller.level === 1)) {
        methods.push(Creep.upgradeControllerTask);
    }

    methods.push(Creep.transferEnergy);
    const structures = this.room.findPropertyFilter(FIND_MY_CONSTRUCTION_SITES, 'structureType', [STRUCTURE_RAMPART, STRUCTURE_WALL, STRUCTURE_CONTROLLER], {inverse: true});
    if (structures.length > 0) {
        methods.push(Creep.constructTask);
    }

    if (this.room.controller && this.room.controller.level < 9) {
        methods.push(Creep.upgradeControllerTask);
    } else {
        methods.push(Creep.repairStructure);
    }
    // this.say('startup', true);
    Creep.execute(this, methods);
    return true;
};

Creep.prototype.upgraderUpdateStats = function() {
    if (!this.room.memory.upgraderUpgrade) {
        this.room.memory.upgraderUpgrade = 0;
    }
    let workParts = 0;
    for (const partI in this.body) {
        if (this.body[partI].type === 'work') {
            workParts++;
        }
    }
    this.room.memory.upgraderUpgrade += Math.min(workParts, this.carry.energy);
};

Creep.prototype.getEnergy = function() {
    /* State machine:
     * No energy, goes to collect energy until full.
     * Full energy, uses energy until empty.
     */
    this.pickupEnergy();
    this.setHasEnergy();

    if (this.memory.hasEnergy) {
        return false;
    }
    if (this.getDroppedEnergy()) {
        // TODO 0 : LOG
        //this.creepLog(`getEnergy.getDroppedEnergy`);
        return true;
    }
    if (this.getEnergyFromStorage()) {
        //this.creepLog(`getEnergy.getEnergyFromStorage`);
        return true;
    }
    if (this.getEnergyFromHostileStructures()) {
        //this.creepLog(`getEnergy.getEnergyFromHostileStructures`);
        return true;
    }

    //this.creepLog(`getEnergy.getEnergyFromSource`);
    return this.getEnergyFromSource();
};

Creep.pickableResources = function(creep) {
    return (object) => creep.pos.isNearTo(object);
};

Creep.prototype.withdrawEnergyFromTarget = function(target) {
    let returnValue = false;
    const returnCode = this.withdraw(target, RESOURCE_ENERGY);
    if (returnCode === OK) {
        returnValue = true;
    }
    return returnValue;
};

Creep.prototype.withdrawResourcesFromTarget = function(target) {
    let returnValue = false;
    const resosurces = Object.keys(target.store) || Object.keys(target.carry);
    for (const resosurce of resosurces) {
        if (!returnValue) {
            returnValue = this.withdraw(target, resosurce) === OK;
        }
    }
    return returnValue;
};

Creep.prototype.withdrawResourcesFromTargets = function(targets, onlyEnergy) {
    let returnValue = false;
    for (const target of targets) {
        if (!returnValue) {
            returnValue = onlyEnergy ? this.withdrawEnergyFromTarget(target) : this.withdrawResourcesFromTarget(target);
        }
    }
    return returnValue;
};

Creep.prototype.withdrawContainers = function() {
    let returnValue = false;
    const containers = this.pos.findInRangeStructures(FIND_STRUCTURES, 1, [STRUCTURE_CONTAINER]);
    if (containers.length > 0) {
        const returnCode = this.withdraw(containers[0], RESOURCE_ENERGY);
        if (returnCode === OK) {
            returnValue = true;
        }
    }
    return returnValue;
};

Creep.prototype.withdrawTombstone = function(onlyEnergy) {
    onlyEnergy = onlyEnergy || false;
    let returnValue = false;
    // FIND_TOMBSTONES and get them empty first
    const tombstones = this.pos.findInRange(FIND_TOMBSTONES, 1);
    if (tombstones.length > 0) {
        if (onlyEnergy) {
            returnValue = this.withdrawResourcesFromTargets(tombstones, true);
        } else {
            returnValue = this.withdrawResourcesFromTargets(tombstones);
        }
    }
    return returnValue;
};

Creep.prototype.pickupEnergy = function() {
    const resources = this.room.findPropertyFilter(FIND_DROPPED_RESOURCES, 'resourceType', [RESOURCE_ENERGY], {
        filter: Creep.pickableResources(this),
    });
    if (resources.length > 0) {
        const resource = resources[0];
        const returnCode = this.pickup(resource);
        return returnCode === OK;
    }
    if (this.withdrawContainers()) {
        return true;
    }

    if (this.withdrawTombstone()) {
        return true;
    }

    // TODO -1: This logic , what for?
    return this.giveMinerEnergy();
};

Creep.prototype.giveMinerEnergy = function() {
    let returnValue = false;
    const sourcers = this.pos.findInRangePropertyFilter(FIND_MY_CREEPS, 1, 'memory.role', ['miner']);
    if (sourcers.length > 0) {
        const returnCode = sourcers[0].transfer(this, RESOURCE_ENERGY);
        if (returnCode === OK) {
            returnValue = true;
        }
    }
    return returnValue;
};

Creep.prototype.getSourceToHarvest = function(swarmSourcesFilter) {
    let source;
    if (this.memory.source) {
        source = Game.getObjectById(this.memory.source);
        if (source === null || source.energy === 0) {
            source = this.pos.getClosestSource(swarmSourcesFilter);
        }
    } else {
        source = this.pos.getClosestSource(swarmSourcesFilter);
    }
    return source;
};


Creep.prototype.getEnergyFromSource = function() {
    let swarm = false;
    let swarmSourcesFilter;
    if (config.swarmSourceHarvestingMaxParts < this.body.filter((b) => b.type === WORK).length) {
        swarm = true;
        swarmSourcesFilter = (source) => source.pos.hasNonObstacleAdjacentPosition() || this.pos.isNearTo(source);
    }
    const source = this.getSourceToHarvest(swarmSourcesFilter);

    this.memory.source = source.id;
    const range = this.pos.getRangeTo(source);
    if (this.carry.energy > 0 && range > 1) {
        this.memory.hasEnergy = true; // Stop looking and spend the energy.
        return false;
    }

    if (range <= 2 && this.getEnergyFromMiner()) {
        return true;
    }

    if (range === 1) {
        return this.harvestSource(source);
    } else {
        if (range > 1 && range < 4) {
            this.moveTo(source);
            return true;
        }
        // TODO 4: logging
        //this.creepLog(`getEnergy.moveToSource`);
        // TODO 2: path finder!

        return this.moveTo(source.pos) === OK
        //return this.moveToSource(source, swarm);
    }
};

Creep.prototype.moveToSource = function(source, swarm = false) {
    this.memory.routing.reverse = false;
    if (swarm && this.pos.inRangeTo(source, 3)) {
        // should not be `moveToMy` unless it will start to handle creeps
        this.moveTo(source.pos);
    } else if (this.room.memory.misplacedSpawn || (this.room.controller && this.room.controller.level < 2)) {
        // TODO should be `moveToMy`, but that hangs in W5N1 spawn (10,9)
        this.moveTo(source.pos);
    } else {
        const route = [{'name': this.room.name}];
        const routePos = 0;
        const start = 'pathStart';
        const target = source.id;
        const path = this.room.getPath(route, routePos, start, target);
        this.memory.routing.pathPos = this.getPathPos(path);
        const directions = this.getDirections(path);
        this.moveByPathMy(path, this.memory.routing.pathPos, directions);
    }
    return true;
};

Creep.prototype.getEnergyFromStorage = function() {
    if (!this.room.storage || !this.room.storage.my || this.room.storage.store.energy < config.creep.energyFromStorageThreshold) {
        return false;
    }

    if (this.carry.energy) {
        return false;
    }

    const range = this.pos.getRangeTo(this.room.storage);
    if (range === 1) {
        this.withdraw(this.room.storage, RESOURCE_ENERGY);
    } else {
        this.moveTo(this.room.storage)
        // TODO 4: Path finder
        //this.moveToMy(this.room.storage.pos, 1);
    }
    return true;
};

Creep.prototype.getEnergyFromHostileStructures = function() {
    let hostileStructures = this.room.findPropertyFilter(FIND_HOSTILE_STRUCTURES, 'structureType', [STRUCTURE_CONTROLLER, STRUCTURE_RAMPART, STRUCTURE_EXTRACTOR, STRUCTURE_OBSERVER], {
        inverse: true,
        filter: Room.structureHasEnergy,
    });
    if (this.carry.energy || !hostileStructures.length) {
        return false;
    }
    // Get energy from the structure with lowest amount first, so we can safely remove it
    const getEnergy = (object) => object.energy || object.store.energy;
    hostileStructures = _.sortBy(hostileStructures, [getEnergy, (object) => object.pos.getRangeTo(this)]);

    const structure = hostileStructures[0];
    const range = this.pos.getRangeTo(structure);
    if (range > 1) {
        //TODO 4: path finder
        this.moveTo(structure)
        //this.moveToMy(structure.pos);
    } else {
        const resCode = this.withdraw(structure, RESOURCE_ENERGY);
        if (resCode === OK && getEnergy(structure) <= this.carryCapacity) {
            structure.destroy();
        } else {
            // TODO 1: logger
            //this.log(Game.time, 'withdraw from hostile ' + resCode);
        }
    }
    return true;
};

Creep.prototype.getEnergyFromMiner= function() {
    const sourcers = this.pos.findInRangePropertyFilter(FIND_MY_CREEPS, 1, 'memory.role', ['miner'], {
        filter: (creep) => creep.carry.energy > 0,
    });
    if (sourcers.length > 0) {
        const returnCode = sourcers[0].transfer(this, RESOURCE_ENERGY);
        this.say('rr:' + returnCode);
        if (returnCode === OK) {
            return true;
        }
    }
    return false;
};

Creep.prototype.setHasEnergy = function() {
    if (this.memory.hasEnergy === undefined) {
        this.memory.hasEnergy = (this.carry.energy === this.carryCapacity);
    } else if (this.memory.hasEnergy && this.carry.energy === 0) {
        this.memory.hasEnergy = false;
    } else if (!this.memory.hasEnergy &&
        this.carry.energy === this.carryCapacity) {
        this.memory.hasEnergy = true;
    }
};

Creep.prototype.getDroppedEnergy = function() {
    const target = this.pos.findClosestByRangePropertyFilter(FIND_DROPPED_RESOURCES, 'resourceType', [RESOURCE_ENERGY], {
        filter: (object) => object.amount > 0,
    });
    if (target === null) {
        return false;
    }
    const energyRange = this.pos.getRangeTo(target.pos);
    if (energyRange <= 1) {
        this.pickupOrWithdrawFromSourcer(target);
        return true;
    }
    if (target.energy > (energyRange * 10) * (this.carry.energy + 1)) {
        this.say('dropped');
        // TODO 4: path finder
        this.moveTo(target.pos)
        //this.moveToMy(target.pos, 1);
        return true;
    }
    return false;
};

Creep.prototype.harvestSource = function(source) {
    this.harvest(source);
    if (this.carry.energy === this.carryCapacity && this.carryCapacity > 0) {
        const creepsWithoutEnergy = this.pos.findInRangePropertyFilter(FIND_MY_CREEPS, 1, 'carry.energy', [0]);
        if (creepsWithoutEnergy.length > 0) {
            this.transfer(creepsWithoutEnergy[0], RESOURCE_ENERGY);
        }
    }

    // TODO Somehow we move before preMove, canceling here
    this.cancelOrder('move');
    this.cancelOrder('moveTo');
    return true;
};

Creep.prototype.getTransferTargetStructure = function() {
    const structure = this.pos.findClosestByRangePropertyFilter(FIND_MY_STRUCTURES, 'structureType', [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER], {
        filter: (structure) => structure.energy < structure.energyCapacity,
    });
    if (structure === null) {
        if (this.room.storage && this.room.storage.my && this.memory.role !== 'planer') {
            this.memory.target = this.room.storage.id;
        } else {
            return false;
        }
    } else {
        this.memory.targetEnergyMy = structure.id;
    }
};

Creep.prototype.getTransferTarget = function() {
    if (!this.memory.targetEnergyMy) {
        this.getTransferTargetStructure();
        if (!this.memory.targetEnergyMy) {
            return false;
        }
    }

    const target = Game.getObjectById(this.memory.targetEnergyMy);
    if (!target || (target.structureType !== STRUCTURE_STORAGE && target.energy === target.energyCapacity)) {
        // this.log(`transferEnergyMy: Can not find target ${this.memory.targetEnergyMy}`);
        delete this.memory.targetEnergyMy;
        return false;
    }
    return target;
};

Creep.prototype.transferEnergyMy = function() {
    const target = this.getTransferTarget();
    if (!target) {
        return false;
    }
    const range = this.pos.getRangeTo(target);
    if (range === 1) {
        const returnCode = this.transfer(target, RESOURCE_ENERGY);
        if (returnCode !== OK && returnCode !== ERR_FULL) {
            this.log('transferEnergyMy: ' + returnCode + ' ' +
                target.structureType + ' ' + target.pos);
        }
        delete this.memory.targetEnergyMy;
    } else {
        // TODO 4: path finder
        this.moveTo(target.pos)
        //this.moveToMy(target.pos, 1);
    }
    return true;
};

Creep.prototype.construct = function() {
    let target;
    if (this.memory.routing.targetId) {
        target = Game.getObjectById(this.memory.routing.targetId);
        // TODO 1: logger
        //this.creepLog('Use memory target', target);
    }
    if (!target || target === null) {
        delete this.memory.routing.targetId;
        if (this.memory.role === 'nextroomer') {
            // TODO 4: implement nextroomer
           // target = this.pos.findClosestByRangePropertyFilter(FIND_CONSTRUCTION_SITES, 'structureType', [STRUCTURE_RAMPART], {inverse: true});
        } else {
            target = this.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        }
    }

    if (target === null) {
        return false;
    }

    const range = this.pos.getRangeTo(target);
    if (range <= 3) {
        return this.buildConstructionSite(target);
    }

    this.memory.routing.targetId = target.id;
    // TODO 4: path finder
    this.moveTo(target.pos)
    //this.moveToMy(target.pos, 3);
    return true;
};

Creep.prototype.buildConstructionSite = function(target) {
    const returnCode = this.build(target);
    if (returnCode === OK) {
        // TODO 3: path finder : random move
        //this.moveRandomWithin(target.pos);
        return true;
    } else if (returnCode === ERR_NOT_ENOUGH_RESOURCES) {
        return true;
    } else if (returnCode === ERR_INVALID_TARGET) {
        // TODO 1 : logger
        //this.log('config_creep_resource construct: ' + returnCode + ' ' + JSON.stringify(target.pos));
        //this.moveRandom();
        // TODO 4: checkout when will this error code happen
        target.pos.clearPosition(target);
        return true;
    }
    // TODO 1:logger
    //this.log('config_creep_resource construct: ' + returnCode + ' ' + JSON.stringify(target.pos));
    return false;
};


RoomPosition.wrapFindMethod = (methodName, extraParamsCount) => function(findTarget, ...propertyFilterParams) {
    /* eslint-disable no-invalid-this */
    const extraParams = propertyFilterParams.splice(0, extraParamsCount);
    if (_.isNumber(findTarget)) {
        const objects = this.getRoom().findPropertyFilter(findTarget, ...propertyFilterParams);
        return this[methodName](objects, ...extraParams);
    }
    /* eslint-enable no-invalid-this */
};

RoomPosition.prototype.getRoom = function() {
    const room = Game.rooms[this.roomName];
    if (!room) {
        throw new Error(`Could not access room ${this.roomName}`);
    }
    return room;
};


/**
 *
 * @param {Number}  findTarget One of the FIND constant. e.g. [FIND_MY_STRUCTURES] or array of RoomObject to apply filters
 * @param {String}  property The property to filter on. e.g. 'structureType' or 'memory.role'
 * @param {Array}  properties The properties to filter. e.g. [STRUCTURE_ROAD, STRUCTURE_RAMPART]
 * @param {Boolean} [without=false] Exclude or include the properties to find.
 * @param {object} [opts={}] Additional options.
 * @param {function} [opts.filter] Additional filter that wil be applied after cache.
 * @return {Array} the objects returned in an array.
 */
RoomPosition.prototype.findClosestByRangePropertyFilter = RoomPosition.wrapFindMethod('findClosestByRange', 0);

/**
 *
 * @param {Number}  findTarget One of the FIND constant. e.g. [FIND_MY_STRUCTURES] or array of RoomObject to apply filters
 * @param range
 * @param {String}  property The property to filter on. e.g. 'structureType' or 'memory.role'
 * @param {Array}  properties The properties to filter. e.g. [STRUCTURE_ROAD, STRUCTURE_RAMPART]
 * @param {Boolean} [without=false] Exclude or include the properties to find.
 * @param {object} [opts={}] Additional options.
 * @param {function} [opts.filter] Additional filter that wil be applied after cache.
 * @return {Array} the objects returned in an array.
 */
RoomPosition.prototype.findInRangePropertyFilter = RoomPosition.wrapFindMethod('findInRange', 1);

RoomPosition.prototype.findInRangeStructures = function(objects, range, structureTypes) {
    return this.findInRangePropertyFilter(objects, range, 'structureType', structureTypes);
};


RoomPosition.prototype.getAllPositionsInRange = function* (range) {
    for (let x = -range; x <= range; ++x) {
        for (let y = -range; y <= range; ++y) {
            if (this.x + x >= 0 && this.y + y >= 0 && this.x + x < 50 && this.y + y < 50) {
                yield new RoomPosition(this.x + x, this.y + y, this.roomName);
            }
        }
    }
};

RoomPosition.prototype.checkForCreep = function() {
    return this.lookFor(LOOK_CREEPS).length > 0;
};

RoomPosition.prototype.checkForWall = function() {
    return this.lookFor(LOOK_TERRAIN)[0] === 'wall';
};

RoomPosition.prototype.checkForObstacleStructure = function() {
    return this.lookFor(LOOK_STRUCTURES).some((s) => OBSTACLE_OBJECT_TYPES.includes(s.structureType));
};
RoomPosition.prototype.hasNonObstacleAdjacentPosition = function() {
    for (const pos of this.getAllPositionsInRange(1)) {
        if (!pos.checkForWall() && !pos.checkForObstacleStructure() && !pos.checkForCreep()) {
            return true;
        }
    }
    return false;
};

RoomPosition.prototype.getClosestSource = function(filter) {
    let source = this.findClosestByPath(FIND_SOURCES_ACTIVE, {
        filter,
    });
    if (source === null) {
        source = this.findClosestByRange(FIND_SOURCES_ACTIVE);
    }
    if (source === null) {
        source = this.findClosestByRange(FIND_SOURCES);
    }
    return source;
};

RoomPosition.prototype.clearPosition = function(target) {
    const structures = this.lookFor('structure');
    for (const structureId of Object.keys(structures)) {
        const structure = structures[structureId];
        if (structure.structureType === STRUCTURE_SPAWN) {
            const spawns = this.getRoom().findPropertyFilter(FIND_STRUCTURES, 'structureType', [STRUCTURE_SPAWN]);
            if (spawns.length <= 1) {
                target.remove();
                return true;
            }
        }
        console.log('Destroying: ' + structure.structureType);
        structure.destroy();
    }
};
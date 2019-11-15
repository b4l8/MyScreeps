
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
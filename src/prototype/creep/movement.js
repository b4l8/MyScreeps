Creep.prototype.moveMy = function(target) {
    const moveResponse = this.move(this.pos.getDirectionTo(target));
    if (moveResponse !== OK && moveResponse !== ERR_NO_BODYPART) {
        this.log(`pos: ${this.pos} target ${target}`);
        throw new Error(`moveToMy this.move(${this.pos.getDirectionTo(target)}); => ${moveResponse}`);
    }
    return moveResponse === OK;
};

/**
 * searchPath uses PathFinder and the room costMatrix to search for a path
 *
 *
 * @param {object} target - The target to move to
 * @param {number} range - How close to get to the target
 * @return {object} - Response from PathFinder.search
 **/
Creep.prototype.searchPath = function(target, range=1) {
    let costMatrixCallback;
    if (this.room.memory.misplacedSpawn) {
        costMatrixCallback = this.room.getBasicCostMatrixCallback();
    } else {
        costMatrixCallback = this.room.getCostMatrixCallback(target, true, this.pos.roomName === (target.pos || target).roomName);
    }
    const search = PathFinder.search(
        this.pos, {
            pos: target,
            range: range,
        }, {
            roomCallback: costMatrixCallback,
            maxRooms: 0,
            swampCost: config.layout.swampCost,
            plainCost: config.layout.plainCost,
        }
    );

    // TODO 8: visualizer
    // if (config.visualizer.enabled && config.visualizer.showPathSearches) {
    //     visualizer.showSearch(search);
    // }
    return search;
};

/**
 * moveToMy replaces the moveTo method and tries to include the costmatrixes
 *
 * @param {object} target - The target to move to
 * @param {number} range - How close to get to the target
 * @return {boolean} - Success of the execution
 **/
Creep.prototype.moveToMy = function(target, range=1) {
    // TODO 0 : log
    //this.creepLog(`moveToMy(${target}, ${range}) pos: ${this.pos}`);
    if (this.fatigue > 0) {
        return true;
    }

    const search = this.searchPath(target, range);

    // Fallback to moveTo when the path is incomplete and the creep is only switching positions
    if (search.path.length < 2 && search.incomplete) {
        this.room.debugLog('routing', `moveToMy fallback target: ${JSON.stringify(target)} range: ${range} search: ${JSON.stringify(search)}`);
        return this.moveTo(target, {range: range});
    }

    target = search.path[0] || target.pos || target;

    return this.moveMy(target, search);
};
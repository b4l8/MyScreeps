/**
 * followPath follows that path for the creep and executes `action` when target
 * is reached
 *
 * @param {function} action - Action function to execute when target is reached
 * @return {boolean} - If the execution is successful
 */
Creep.prototype.followPath = function(action) {
    if (this.followPathWithoutTargetId()) {
        return action(this);
    }
    const path = this.prepareRoutingMemory();
    const directions = this.getDirections(path);
    if (this.unit().preMove && this.unit().preMove(this, directions)) {
        return true;
    }
    // Recalculate the directions, if `preMove` changed `memory.routing.reversed`
    this.getDirections(path);
    this.getPathPos(path);
    this.killPrevious(path);
    if (this.followPathWithTargetId(path)) {
        return action(this);
    }
    return this.moveByPathMy(path);
};
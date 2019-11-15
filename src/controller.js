StructureController.prototype.getLink = function () {
    if (!this.__link) {
        this.__link = this.pos.getLink()
    }
    return this.__link
};

StructureController.prototype.isTimingOut = function () {
    if (!this.level || !CONTROLLER_DOWNGRADE[this.level]) {
        return false
    }
    return (CONTROLLER_DOWNGRADE[this.level] - this.ticksToDowngrade > 4000) || this.ticksToDowngrade < 4000
};
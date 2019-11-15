'use strict';

StructureStorage.prototype.getLink = function () {
    if (!this.__link) {
        this.__link = this.pos.getLink()
    }
    return this.__link
};
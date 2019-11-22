Creep.prototype.selfHeal = function() {
    if (!this.memory.canHeal) {
        this.memory.canHeal = this.getActiveBodyparts(HEAL) > 0;
    }
    if (this.memory.canHeal && this.isDamaged() < 1) {
        this.heal(this);
    }
};

Creep.prototype.isDamaged = function() {
    return this.hits / this.hitsMax;
};
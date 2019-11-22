/* TODO 10 : this is reall good idea . can use?
RoomPosition.prototype.getLink = function (range = 2) {
    if (this.__link) {
        return this.__link
    }
    const room = Game.rooms[this.roomName];
    if (!room || !room.structures[STRUCTURE_LINK]) {
        return false
    }
    const pos = this;
    const links = _.filter(room.structures[STRUCTURE_LINK], a => pos.getRangeTo(a) <= range)
    if (links.length < 1) {
        return false
    }
    this.__link = links[0];
    return this.__link
};
*/
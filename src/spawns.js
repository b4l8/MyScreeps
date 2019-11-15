require('room_spawnControl');
class Spawns {
    main() {
        this.room = Game.rooms[this.data.room]
        // TODO: USE Game.Spawns['name'] instead?
        const spawns = this.room.find(FIND_MY_SPAWNS, {filter: (s, i, c) => ( (s.isActive()))})
        for (let spawn of spawns) {
            if (spawn.spawning) {
                continue
            }
            const creep = this.room.getQueuedCreep()
            if (!creep) {
                console.log('no creeps in queue');
                break
            }
            const ret = spawn.createCreep(creep.build, creep.name, creep.memory)
            if (Number.isInteger(ret)) {
                console.log(`Error ${ret} while spawning creep ${creep.name} in room ${this.data.room}`, LOG_ERROR)
            } else {
                console.log(`Spawning creep ${creep.name} from ${this.data.room}`)
            }
        }

    }
}

module.exports = Spawns;
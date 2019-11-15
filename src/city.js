'use strict'
require('prototype.creep');
require('constants');
require('control')
var Spawns = require('spawns')
const roomPrograms = {
    'spawns': 'spawns',
    'defense': 'city_defense',
    'reboot': 'city_reboot',
    'works': 'city_publicworks'
};
var my_rooms = ['sim'];
class City {
    constructor () {
        this.priority = PRIORITIES_CITY;
        console.log("info : " + Game.time);
        this.name = 'sim';
        if(!Memory.city){
            Memory.city = {}
        }
        if(!Memory.city[this.name]){
            Memory.city[this.name] = {};
        }
        Memory.city[this.name].room =this.name;
        Memory.city[this.name].lastrun = Game.time;
    }

    getDescriptor () {
        return Memory.city[this.name].room
    }

    main() {
        this.room = Game.rooms.sim;
        console.log('this is room: '+ this.room.name+' spawn queue: ');
            //Memory.spawnqueue[Memory.city[this.name].room].length)
        //this.room.clearSpawnQueue();

        // pulse duration 10
        if (Memory.city[this.name].lastrun && Game.time - Memory.city[this.name].lastrun < 2) {
            return
        } else {
            Memory.city[this.name].lastrun = Game.time
        }

        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            } else {
                //Game.creeps[name].memory.home = 'E25S7';
                //let subTimeStart=Game.cpu.getUsed();
                Game.creeps[name].runRole();
                //let subTimeEnd=Game.cpu.getUsed();
                // console.log(name+'('+Game.creeps[name].memory.role+'): '+(subTimeEnd-subTimeStart).toFixed(2));
            }
        }
        // TODO: MORE Implementations here!!!
        //this.manageLevelChanges();
        // TODO: after wall down or WAR module!
        //this.remoteMines();
        //this.launchBasicPrograms();
        //if (!this.requestAid()) {
            //this.launchCorePrograms()
        this.launchCreeps();
        for(let room_name of my_rooms){
            let new_spawns = new Spawns();
            new_spawns.data = {};
            new_spawns.data.room = room_name;
            new_spawns.main()
        }
        // for (let spawnName in Game.spawns) {
        //     Game.spawns[spawnName].spawnControl();
        // }
        //}
    }

    // manageLevelChanges () {
    //     // Detect when room level changes and clear spawnqueue.
    //     if (!Memory.city[this.name].prl) {
    //         Memory.city[this.name].prl = this.room.getPracticalRoomLevel()
    //     }
    //     const roomLevel = this.room.getPracticalRoomLevel();
    //     if (Memory.city[this.name].prl !== roomLevel) {
    //         console.log(`${Memory.city[this.name].room} has changed from PRL${Memory.city[this.name].prl} to PRL${roomLevel}`);
    //         // TODO: get familiar with qlib
    //         //qlib.notify.send(`${Memory.city[this.name].room} has changed from PRL${Memory.city[this.name].prl} to PRL${roomLevel}`)
    //         Memory.city[this.name].prl = roomLevel;
    //         this.room.clearSpawnQueue()
    //     }
    //
    //     // Notify of room level changes
    //     if (!Memory.city[this.name].level) {
    //         Memory.city[this.name].level = this.room.controller.level
    //     }
    //     if (Memory.city[this.name].level !== this.room.controller.level) {
    //         // qlib.notify.send(`${Memory.city[this.name].room} has changed from level ${Memory.city[this.name].level} to level ${this.room.controller.level}`)
    //         Memory.city[this.name].level = this.room.controller.level
    //     }
    // }

    // launchBasicPrograms () {
    //     // Launch children programs
    //     for (const label in roomPrograms) {
    //         this.launchChildProcess(label, roomPrograms[label], {
    //             'room': Memory.city[this.name].room
    //         })
    //     }
    //
    //     // Launch mining if all level 2 extensions are build.
    //     if (this.room.energyCapacityAvailable > 500) {
    //         this.launchChildProcess('mining', 'city_mine', {
    //             'room': Memory.city[this.name].room
    //         })
    //     }
    //
    //     // If the room isn't planned launch the room layout program, otherwise launch construction program
    //     // TODO: get familiar with it before use!!!!
    //     // const layout = this.room.getLayout()
    //     // if (!layout.isPlanned()) {
    //     //     this.launchChildProcess('layout', 'city_layout', {
    //     //         'room': Memory.city[this.name].room
    //     //     })
    //     // } else {
    //     //     if (Memory.userConfig && Memory.userConfig.visualizeLayout) {
    //     //         layout.visualize()
    //     //     }
    //     //     this.launchChildProcess('construct', 'city_construct', {
    //     //         'room': Memory.city[this.name].room
    //     //     })
    //     //     this.launchChildProcess('fortify', 'city_fortify', {
    //     //         'room': Memory.city[this.name].room
    //     //     })
    //     // }
    //
    //     // Launch mineral extraction
    //     // TODO: HIGH PRIORITY MUST DO!
    //     // if (this.room.isEconomyCapable('EXTRACT_MINERALS') && this.room.getRoomSetting('EXTRACT_MINERALS')) {
    //     //     // Note that once the program starts it won't stop until the minerals are mined out regardless of economic
    //     //     // conditions.
    //     //     const mineral = this.room.find(FIND_MINERALS)[0]
    //     //     if (mineral.mineralAmount > 0 && !mineral.ticksToRegeneration) {
    //     //         this.launchChildProcess('extraction', 'city_extract', {
    //     //             'room': Memory.city[this.name].room
    //     //         })
    //     //     }
    //     // }
    // }

    launchCreepProcess(label, role, roomname, quantity = 1, options = {}){
        const room = Game.rooms[roomname];
        if (!room) {
            return false
        }
        if (!Memory.city[this.name].children) {
            console.log('this val is earased!!!!')
            Memory.city[this.name].children = {}
        }
        console.log('launching :'+ label + ' in '+ roomname + ' with ' + quantity)
        let x;
        for (x = 0; x < quantity; x++) {
            const specificLabel = label + x;
            if (Memory.city[this.name].children[specificLabel]) {
                continue
            }
            const creepName = room.queueCreep(x,role, options);
            console.log('queued new creep spawn: '+ creepName)
            Memory.city[this.name].children[specificLabel] = creepName;
        }
    }

    launchCreeps () {
        // queue upgrader
        let upgraderQuantity = this.room.getRoomSetting('UPGRADERS_QUANTITY')
        this.launchCreepProcess('upgraders', 'upgrader', Memory.city[this.name].room, upgraderQuantity, {
            'priority': 5
        })

    }
}

module.exports = City;
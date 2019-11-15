Room.prototype.myHandleRoom = function() {
    if (!Memory.username) {
        Memory.username = this.controller.owner.username;
    }
    this.memory.lastSeen = Game.time;
    this.memory.constructionSites = this.find(FIND_CONSTRUCTION_SITES);

    // TODO Fix for after `delete Memory.rooms`
    // TODO 5: remember structure pos for path finder and auto construction?
    // if (!this.memory.position || !this.memory.position.structure) {
    //     this.setup();
    // }

    if (!this.memory.queue) {
        this.memory.queue = [];
    }

    // TODO 0 : fight system plz!! quickly!!
    // const hostiles = this.getEnemys();
    // if (hostiles.length === 0) {
    //     delete this.memory.hostile;
    // } else {
    //     if (this.memory.hostile) {
    //         this.memory.hostile.lastUpdate = Game.time;
    //         this.memory.hostile.hostiles = hostiles;
    //     } else {
    //         // this.log('Hostile creeps: ' + hostiles[0].owner.username);
    //         this.memory.hostile = {
    //             lastUpdate: Game.time,
    //             hostiles: hostiles,
    //         };
    //     }
    // }
    // TODO 10 : WON'T do, will done manually
    // if (this.memory.unclaim) {
    //     return this.unclaimRoom();
    // }
    return this.executeRoom();
};

Room.prototype.executeRoom = function() {
    const cpuUsed = Game.cpu.getUsed();
    // TODO 5: auto construction
    //this.buildBase();
    // TODO 1: handle attack
    // this.memory.attackTimer = this.memory.attackTimer || 0;
    const spawns = this.findPropertyFilter(FIND_MY_STRUCTURES, 'structureType', [STRUCTURE_SPAWN]);
    // TODO 1: handle attack
    // const hostiles = this.find(FIND_HOSTILE_CREEPS, {
    //     filter: this.findAttackCreeps,
    // });
    // if (hostiles.length === 0) {
    //     this.memory.attackTimer = Math.max(this.memory.attackTimer - 5, 0);
    //     // Make sure we don't spawn towerFiller on reducing again
    //     if (this.memory.attackTimer % 5 === 0) {
    //         this.memory.attackTimer--;
    //     }
    // }
    // TODO 6: respawn spawns if spawn destoried
    // if (spawns.length === 0) {
    //     this.reviveRoom();
    // } else if (this.energyCapacityAvailable < config.room.reviveEnergyCapacity) {
    //     this.reviveRoom();
    //     if (hostiles.length > 0) {
    //         this.controller.activateSafeMode();
    //     }
    // } else {
        this.memory.active = true;
    // }

    // spawn harvester
    // TODO 1: not difficult : implement nextroomer
    // const nextroomers = this.findPropertyFilter(FIND_MY_CREEPS, 'memory.role', ['nextroomer'], {
    //     filter: (object) => object.memory.base !== this.name,
    // });
    // Room is build up while nextroomers are in the room and sourcerers are too small
    //const building = nextroomers.length > 0 && this.energyCapacityAvailable <= 600;
    const building = this.energyCapacityAvailable <= 600;
    // harvester spawn logic
    if (!building) {
        // TODO 0: check this logic
        const amount = this.getHarvesterAmount();
        this.checkRoleToSpawn('harvester', amount);
    }

    // TODO 4: fight mode
    // if (this.memory.attackTimer > 100) {
    //     // TODO better metric for SafeMode
    //     const enemies = this.findPropertyFilter(FIND_HOSTILE_CREEPS, 'owner.username', ['Invader'], {inverse: true});
    //     if (enemies > 0) {
    //         this.controller.activateSafeMode();
    //     }
    // }
    // TODO 0: temporary get filler without fight mode
    // if (this.memory.attackTimer >= 50 && this.controller.level > 6) {
    //     const towers = this.findPropertyFilter(FIND_STRUCTURES, 'structureType', [STRUCTURE_TOWER]);
    //     if (towers.length === 0) {
    //         this.memory.attackTimer = 47;
    //     } else {
    //         if (this.memory.attackTimer === 50 && this.memory.position.creep.towerFiller) {
    //             for (const towerFillerPos of this.memory.position.creep.towerFiller) {
    //                 this.log('Spawning towerfiller: ' + this.memory.attackTimer);
    //                 this.memory.queue.push({
    //                     role: 'towerfiller',
    //                     target_id: towerFillerPos,
    //                 });
    //             }
    //         }
    //     }
    // }

    // TODO 10: idiot list?
    //const idiotCreeps = this.findPropertyFilter(FIND_HOSTILE_CREEPS, 'owner.username', ['Invader'], {inverse: true});
    // if (idiotCreeps.length > 0) {
    //     for (const idiotCreep of idiotCreeps) {
    //         brain.increaseIdiot(idiotCreep.owner.username);
    //     }
    // }

    // TODO 4: fight mode defense quickly!!
    // if (hostiles.length > 0) {
    //     this.memory.attackTimer++;
    //
    //     if (this.memory.attackTimer > 15) {
    //         let role = 'defendranged';
    //         if (this.memory.attackTimer > 300) {
    //             role = 'defendmelee';
    //         }
    //         if (this.exectueEveryTicks(250)) {
    //             this.checkRoleToSpawn(role, 1, undefined, this.name, 1, this.name);
    //         }
    //     }
    //
    //     if (this.exectueEveryTicks(10)) {
    //         if (hostiles[0].owner.username !== 'Invader' || config.debug.invader) {
    //             this.log('Under attack from ' + hostiles[0].owner.username);
    //         }
    //     }
    //     if (hostiles[0].owner.username !== 'Invader' && !brain.isFriend(hostiles[0].owner.username)) {
    //         Game.notify(this.name + ' Under attack from ' + hostiles[0].owner.username + ' at ' + Game.time);
    //     }
    // }
    // TODO 1: stat for new spawn room
    // if (Memory.myRooms && (Memory.myRooms.length < 5) && building) {
    //     brain.stats.addRoom(this.name, cpuUsed);
    //     return true;
    // }

    // TODO 5: this is transfer between rooms, implement after nextroomer.
    //this.checkForEnergyTransfer();

    // spawn miner
    this.checkAndSpawnMiner();

    // spawn filler
    if (this.controller.level >= 4 && this.storage && this.storage.my && !this.memory.misplacedSpawn) {
        this.checkRoleToSpawn('storagefiller', 1, 'filler');
    }

    // spawn upgrader
    if (this.storage && this.storage.my && this.storage.store.energy > config.room.upgraderMinStorage && !this.memory.misplacedSpawn) {
        this.checkRoleToSpawn('upgrader', 1, this.controller.id);
    }

    // TODO -1: in replace use my builder instead
    // TODO 6: auto construction
    // const constructionSites = this.findPropertyFilter(FIND_MY_CONSTRUCTION_SITES, 'structureType', [STRUCTURE_ROAD, STRUCTURE_WALL, STRUCTURE_RAMPART], {inverse: true});
    // if (constructionSites.length > 0) {
    //     let amount = 1;
    //     for (const cs of constructionSites) {
    //         if (cs.structureType === STRUCTURE_STORAGE) {
    //             amount = 6;
    //         }
    //     }
    //     if (this.controller.level === 4 && this.memory.misplacedSpawn) {
    //         amount = 3;
    //     }
    //     this.checkRoleToSpawn('planer', amount);
    // } else if (this.memory.misplacedSpawn && this.storage && this.storage.store.energy > 20000 && this.energyAvailable >= this.energyCapacityAvailable - 300) {
    //     this.checkRoleToSpawn('planer', 4);
    // }

    // TODO 2: handle mineral and terminals
    // const extractors = this.findPropertyFilter(FIND_STRUCTURES, 'structureType', [STRUCTURE_EXTRACTOR]);
    // if (this.terminal && extractors.length > 0) {
    //     const minerals = this.find(FIND_MINERALS);
    //     if (minerals.length > 0 && minerals[0].mineralAmount > 0) {
    //         const amount = this.terminal.store[minerals[0].mineralType] || 0;
    //         if (amount < config.mineral.storage) {
    //             this.checkRoleToSpawn('extractor');
    //         }
    //     }
    // }
    // if (config.mineral.enabled && this.terminal && this.storage) {
    //     const labs = this.findPropertyFilter(FIND_MY_STRUCTURES, 'structureType', [STRUCTURE_LAB]);
    //     if ((!this.memory.cleanup || this.memory.cleanup <= 10) && (_.size(labs) > 2)) {
    //         this.checkRoleToSpawn('mineral');
    //     }
    //     if ((Game.time + this.controller.pos.x + this.controller.pos.y) % 10000 < 10) {
    //         this.memory.cleanup = 0;
    //     }
    // }

    // TODO 3: prepare nextroomer
    // if (!building && nextroomers.length === 0) {
    //     this.handleScout();
    // }
    this.handleTower();
   // if (this.controller.level > 1 && this.memory.walls && this.memory.walls.finished) {
    if (this.controller.level > 1) {
        this.checkRoleToSpawn('repairer');
    }

    this.handleLinks();
    // TODO 3: finish these structures!!
    //this.handleObserver();
    //this.handlePowerSpawn();
    //this.handleTerminal();
    //this.handleNukeAttack();
    this.spawnCheckForCreate();
    // TODO 4: finish market
    // this.handleMarket();
    // TODO 1: stat room
    //brain.stats.addRoom(this.name, cpuUsed);
    return true;
};

Room.prototype.getHarvesterAmount = function() {
    let amount = 1;
    if (!this.storage) {
        amount = 2;
    } else {
        if (this.storage.store.energy < config.creep.energyFromStorageThreshold && this.controller.level < 5) {
            amount = 3;
        }
        if (this.storage.store.energy > 2 * config.creep.energyFromStorageThreshold && this.controller.level > 6 && this.energyAvailable > 2000 && this.memory.queue.length > 4) {
            amount = 2;
        }
        if (!this.storage.my) {
            amount = 10;
        }
    }
    return amount;
};

Room.prototype.checkAndSpawnMiner = function() {
    const sources = this.find(FIND_SOURCES);

    let source;
    const isMiner = (object) => object.memory.routing.targetId === source.id && object.memory.routing.targetRoom === source.pos.roomName;
    for (source of sources) {
        const sourcers = this.findPropertyFilter(FIND_MY_CREEPS, 'memory.role', ['miner'], {
            filter: isMiner,
        });
        if (sourcers.length === 0) {
            //      this.log(source.id);
            this.checkRoleToSpawn('miner', 1, source.id, this.name);
        }
    }
};

Room.prototype.getLinkStorage = function() {
    this.memory.constants = this.memory.constants || {};
    if (this.memory.constants.linkStorage) {
        const link = Game.getObjectById(this.memory.constants.linkStorage);
        if (link && link !== null) {
            return link;
        }
    }
    // TODO 0:BUG: use fixed before I expend ,I'm afraid that may not work
    const linkPos = this.memory.position.structure.link[0];
    const linkPosObject = new RoomPosition(linkPos.x, linkPos.y, this.name);
    const structures = linkPosObject.lookFor(LOOK_STRUCTURES);
    for (const structure of structures) {
        if (structure.structureType === STRUCTURE_LINK) {
            this.memory.constants.linkStorage = structure.id;
            return structure;
        }
    }
};

Room.prototype.handleLinks = function() {
    // TODO 4: fight module DEFENSE
    // if (this.memory.attackTimer <= 0) {
    //     this.memory.underSiege = false;
    // }

    const linkStorage = this.getLinkStorage();
    if (!linkStorage) {
        return;
    }

    const links = this.findPropertyFilter(FIND_MY_STRUCTURES, 'structureType', [STRUCTURE_LINK], {
        filter: (link) => link.id !== linkStorage.id,
    });

    // TODO: 0 this may not work , use my fixed solution
    // if (links.length > 0) {
    //     const time = Game.time % (links.length * 12);
    //     const link = (time / 12);
    //     if (time % 12 === 0 && links.length - 1 >= link) {
    //         if (this.memory.attackTimer > 50 && this.controller.level > 6) {
    //             for (let i = 1; i < 3; i++) {
    //                 const linkSourcer = this.memory.position.structure.link[i];
    //                 if (links[link].pos.isEqualTo(linkSourcer.x, linkSourcer.y)) {
    //                     links[link].transferEnergy(linkStorage);
    //                     return true;
    //                 }
    //             }
    //             linkStorage.transferEnergy(links[link]);
    //         } else {
    //             const returnCode = links[link].transferEnergy(linkStorage);
    //             if (returnCode !== OK &&
    //                 returnCode !== ERR_NOT_ENOUGH_RESOURCES &&
    //                 returnCode !== ERR_TIRED &&
    //                 returnCode !== ERR_RCL_NOT_ENOUGH) {
    //                 links[link].log('handleLinks.transferEnergy returnCode: ' + returnCode + ' targetPos: ' + linkStorage.pos);
    //             }
    //         }
    //     }
    // }
};

Room.prototype.spawnCheckForCreate = function() {
    if (this.memory.queue.length === 0) {
        return false;
    }
    this.memory.queue = _.sortBy(this.memory.queue, (c) => this.getPriority(c));

    const creep = this.memory.queue[0];
    if (this.spawnCreateCreep(creep)) {
        this.memory.queue.shift();
        return true;
    }
    // TODO 2: figure out what it mean
    // if (creep.ttl === 0) {
    //     this.log('TTL reached, skipping: ' + JSON.stringify(_.omit(creep, ['level'])));
    //     this.memory.queue.shift();
    //     return false;
    // }
    // creep.ttl = creep.ttl || config.creep.queueTtl;
    // if (this.getSpawnableSpawns().length === 0) {
    //     creep.ttl--;
    // }
    return false;
};
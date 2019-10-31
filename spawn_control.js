var list_of_roles = ['harvester','upgrader','repairer','builder','miner','lorry','wallkeeper','traveler','archer'];
var min_role_list = {
    'harvester':0,
    'upgrader':2,
    'builder':2,
    'repairer':2,
    'miner' : 0,
    'lorry' : 0,
    'wallkeeper':1,
    'traveler':0,
    'archer':0
};

StructureSpawn.prototype.spawnControl =
    function() {
        /** @type {room} **/
        let room = this.room;
        /** @type {Array.<creep>} **/
        let creeps_in_room = room.find(FIND_MY_CREEPS);

        /** @type {Object.<string,number>}**/
        let num_of_creeps = {};

        for (let role of list_of_roles) {
            num_of_creeps[role] = _.sum(creeps_in_room, (c) => c.memory.role === role);
        }

        let max_energy = room.energyCapacityAvailable;
        let name = undefined;
        // basic harvester are backups
        if (num_of_creeps['harvester'] < 2 && (num_of_creeps['lorry'] <num_of_creeps['miner']
            || num_of_creeps['lorry'] === 0)) {
            // miner exists or storage big -> create lorry
            if(num_of_creeps['miner'] > 0 || (
                room.storage !== undefined && room.storage.store[RESOURCE_ENERGY] >= 150 +550
            )){
                let lorry_size = max_energy;
                if(num_of_creeps['harvester'] === 0) {
                    lorry_size = room.energyAvailable;
                }
                name = this.createLorry(lorry_size);
            }
            else {
                name = this.createMyCreep(room.energyAvailable, 'harvester');
            }
        } else {
            let sources = room.find(FIND_SOURCES);
            for(let s of sources) {
                // no miner for this source
                if(!_.some(creeps_in_room,c => c.memory.role === 'miner' && c.memory.sourceId === s.id)){
                    /** @type {Array.StructureContainer} */
                    let containers = s.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType === STRUCTURE_CONTAINER
                    });
                    // if there is a container next to the source
                    if (containers.length > 0) {
                        // spawn a miner
                        name = this.createMiner(s.id);
                        break;
                    }
                }
            }

            if (!name) {
                for (let role of list_of_roles) {
                    if (num_of_creeps[role] < min_role_list[role]) {
                        if(role === 'traveler'){
                            name = this.createTraveler(max_energy,4,'E25S7','E25S8','5bbcae649099fc012e638ef3');
                        } else if(role === 'archer'){
                            name = this.createArcher(max_energy, role);
                        }
                        else{
                            name = this.createMyCreep(max_energy, role);
                        }
                        break;
                    }
                }
            }
        }
        if (name != undefined && _.isString(name)) {
            console.log(this.name + " spawned new creep: " + name + " (" + Game.creeps[name].memory.role + ")");
            for (let role of list_of_roles) {
                console.log(role + ": " + num_of_creeps[role]);
            }
        }
    };

StructureSpawn.prototype.createMyCreep =
    function(energy,roleName) {
        var num_of_parts = Math.floor(energy /200);

        num_of_parts = Math.min(num_of_parts,Math.floor(50/3));
        var body  = [];
        for(let i = 0;i< num_of_parts; ++i) {
            body.push(WORK);
        }
        for(let i = 0;i< num_of_parts; ++i) {
            body.push(CARRY);
        }
        for(let i = 0;i< num_of_parts; ++i) {
            body.push(MOVE);
        }

        // create creep with the created body and the given role
        return this.createCreep(body, undefined, { role: roleName, working: false,
            home: 'E25S7'});
    };

StructureSpawn.prototype.createMiner =
    function(sourceId) {
        // create creep with the created body and the given role
        return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], undefined, { role: 'miner', sourceId:sourceId,
            home: this.room.name});
    };

StructureSpawn.prototype.createLorry =
    function(energy) {
        // create a body with twice as many CARRY as MOVE parts
        var numberOfParts = Math.floor(energy / 150);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts * 2; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the role 'lorry'
        return this.createCreep(body, undefined, { role: 'lorry', working: false });
    };

StructureSpawn.prototype.createTraveler =
    function (energy, numberOfWorkParts, home, target, sourceIndex) {
        // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
        var body = [];
        for (let i = 0; i < numberOfWorkParts; i++) {
            body.push(WORK);
        }

        // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
        energy -= 150 * numberOfWorkParts;

        var numberOfParts = Math.floor(energy / 100);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor((50 - numberOfWorkParts * 2) / 2));
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body
        return this.createCreep(body, undefined, {
            role: 'traveler',
            home: home,
            target: target,
            sourceIndex: sourceIndex,
            working: false
        });
    };

StructureSpawn.prototype.createArcher =
    function(energy) {
        // create a body with twice as many CARRY as MOVE parts
        var numberOfParts = Math.floor(energy / 150);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        var body = [];
        for (let i = 0; i < numberOfParts; i++) {
            body.push(RANGED_ATTACK);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the role 'lorry'
        return this.createCreep(body, undefined, { role: 'archer', working: false });
    };
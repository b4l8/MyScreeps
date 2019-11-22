Creep.getEnergy = function(creep) {
    return creep.getEnergy();
};

Creep.constructTask = function(creep) {
    //creep.creepLog('construct');
    return creep.construct();
};

Creep.repairStructure = function(creep) {
    return creep.repairStructure();
};

Creep.transferEnergy = function(creep) {
    //  creep.say('transferEnergy', true);
    return creep.transferEnergyMy();
};

Creep.execute = function(creep, methods) {
    for (const method of methods) {
        if (method(creep)) {
            return true;
        }
    }
};

Creep.upgradeControllerTask = function(creep) {
    // TODO 0: screeps log
    //creep.creepLog('upgradeControllerTask');
    if (creep.carry.energy === 0) {
        return false;
    }

    const range = creep.pos.getRangeTo(creep.room.controller);
    if (range <= 3) {
        const resources = creep.pos.findInRangePropertyFilter(FIND_DROPPED_RESOURCES, 10, 'resourceType', [RESOURCE_ENERGY]);
        let resource = false;
        if (resources.length > 0) {
            resource = resources[0];
            creep.pickup(resource);
        }
        const returnCode = creep.upgradeController(creep.room.controller);
        if (returnCode !== OK) {
            //creep.log('upgradeController: ' + returnCode);
        } else {
            // TODO 6: better way to update this state?
            creep.upgraderUpdateStats();
        }
        // TODO 5: path finder
        if (resource) {
            creep.moveTo(resource)
            //creep.moveRandomWithin(creep.room.controller.pos, 3, resource);
        } else {
            creep.moveTo(creep.room.controller)
            //creep.moveRandomWithin(creep.room.controller.pos);
        }


        return true;
    } else {
        creep.moveTo(creep.room.controller)
        // TODO 5: path finder
        //creep.moveToMy(creep.room.controller.pos, 3);
    }
    return true;
};
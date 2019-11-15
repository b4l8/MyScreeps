'use strict';

const MetaRole = require('Scripts/src/role/meta');

class Builder extends MetaRole {
    getBuild(room, options){
        this.setBuildDefaults(room, options)
        return Creep.buildFromTemplate([MOVE, CARRY, WORK], options.energy)
    }

    run(creep) {
        // implement it later
        // if (creep.ticksToLive < 50) {
        //     return creep.recycle()
        // }
        if (creep.recharge()) {
            return
        }

        // Find and build any construction sites
        //const construction = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);


        var construction = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES,{
            filter: (s) => {
                return  s.structureType !== STRUCTURE_WALL
                    && s.structureType !== STRUCTURE_ROAD;
            }
        });
        //var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if(!construction) {
            construction = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        }

        if (construction) {
            // TODO : TEST it: is that pattern waste of range?
            if (creep.pos.getRangeTo(construction) > 2) {
                creep.travelTo(construction)
            }
            if (creep.pos.getRangeTo(construction) <= 3) {
                creep.build(construction)
            }
            return
        }

        // TODO : run a upgrader instance?
        // Upgrade controller if there isn't anything to build
        const controller = creep.room.controller;
        if (creep.pos.getRangeTo(controller) > 2) {
            creep.travelTo(controller)
        }
        if (creep.pos.getRangeTo(controller) <= 3) {
            creep.upgradeController(controller)
        }
    }
}



var roleUpgrader = require('Scripts/src/role/upgrader');
var builder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // if target is defined and creep is not in target room
        // if (creep.memory.target !== undefined && creep.room.name !== creep.memory.target) {
        //     // find exit to target room
        //     var exit = creep.room.findExitTo(creep.memory.target);
        //     // move to exit
        //     creep.moveTo(creep.pos.findClosestByRange(exit));
        //     // return the function to not do anything else
        //     return;
        // }


        if(creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.working = true;
            creep.say('🚧 build');
        }

        if(creep.memory.working) {
            // var sup_builders = Game.rooms['E25S8'].find(FIND_MY_CREEPS,{
            // filter: s=>{return s.memory.role === 'builder';} });

            // if(sup_builders.length ===0&&creep.room.name!=='E25S8'){
            //   let exit=creep.room.findExitTo('E25S8');
            //  creep.moveTo(creep.pos.findClosestByPath(exit));
            //   creep.say('sup,sup');
            //  console.log('suppoting neighbor');
            // return;
            // }

            var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES,{
                filter: (s) => {
                    return  s.structureType !== STRUCTURE_WALL
                        && s.structureType !== STRUCTURE_ROAD;
                }
            });
            //var target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            }
            if(target) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'},reusePath: 10 });
                }
            }
            else {
                roleUpgrader.run(creep);
            }
        }
        else {
            creep.getEnergy(true, true);
        }
    }
};
module.exports = builder;
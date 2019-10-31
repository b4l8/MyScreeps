var roleBuilder = require('role.builder');

var roleWallKeeper = {
  /** @param {creep} creep */
  run: function(creep) {
      if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
          creep.memory.working = false;
          creep.say('🔄 harvest');
      }
      if(!creep.memory.working && creep.store.getFreeCapacity() == 0) {
          creep.memory.working = true;
          creep.say('🚧 keeper!');
      }

      if(creep.memory.working) {
          var walls = creep.room.find(FIND_STRUCTURES, {
              filter: (s) => s.structureType === STRUCTURE_WALL ||
                  s.structureType === STRUCTURE_RAMPART
          });

          var target = undefined;
          // loop with increasing percentages
          for (let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001){
              // find a wall with less than percentage hits
              for (let wall of walls) {
                  if (wall.hits / wall.hitsMax < percentage) {
                      target = wall;
                      break;
                  }
              }
              if (target) break;
          }

          // if we find a wall that has to be repaired
          if (target) {
              if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(target);
              }
          }
          // if we can't fine one
          else {
              // look for construction sites
              roleBuilder.run(creep);
          }

      }
      else {
          creep.getEnergy(true,true);
      }
  }
};

module.exports = roleWallKeeper;
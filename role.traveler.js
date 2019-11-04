var roleTraveler = {
  run:function(creep) {
      if (creep.memory.working && creep.carry.energy === 0) {
          creep.memory.working = false;
          creep.say('🔄 harvest');
      } else if (!creep.memory.working && creep.carry.energy === creep.carryCapacity) {
          creep.memory.working = true;
          creep.say('🚧 traveler!');
      }
      if (creep.memory.working) {
          if (creep.room.name === creep.memory.home) {
              // find closest spawn, extension or tower which is not full
              var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                  // the second argument for findClosestByPath is an object which takes
                  // a property called filter which can be a function
                  // we use the arrow operator to define it
                  filter: (s) => (s.structureType === STRUCTURE_SPAWN
                      || s.structureType === STRUCTURE_EXTENSION
                      || s.structureType === STRUCTURE_TOWER)
                      && s.energy < s.energyCapacity
              });

              if (structure === undefined && creep.room.storage) {
                  structure = creep.room.storage;
              }

              // if we found one
              if (structure !== undefined) {
                  // try to transfer energy, if it is not in range
                  if (creep.transfer(structure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                      // move towards it
                      creep.moveTo(structure);
                  }
              }
          } else {
              let exit = creep.room.findExitTo(creep.memory.home);
              creep.moveTo(creep.pos.findClosestByRange(exit));
          }
      } else {
          // harvest source
          if (creep.room.name === creep.memory.target) {

              var source = Game.getObjectById(creep.memory.sourceIndex);
              // try to harvest energy, if the source is not in range
              if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                  creep.moveTo(source);
              }
          }
          else {
              // move to target room
              let exit = creep.room.findExitTo(creep.memory.target);
              creep.moveTo(creep.pos.findClosestByRange(exit));
          }
      }
  }
};

module.exports = roleTraveler;
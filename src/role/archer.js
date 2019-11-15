roleLorry = require('Scripts/src/role/lorry')
var archer = {
  run:function(creep){
      if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
          creep.memory.working = false;
          creep.say('🔄 harvest');
      }
      if(!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
          creep.memory.working = true;
      }

      if(creep.memory.working) {
          var target = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
          if(target){
              creep.say('🔄 biu!!!');
              this.rangedAttack(target);
          } else {
              roleLorry.run(creep);
          }
      }
      else {
          creep.getEnergy(true,true);
      }
  }
};

module.exports = archer;
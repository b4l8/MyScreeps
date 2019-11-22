//
// Creep.getRole = function (roleName) {
//     let Role = require('roles_' + roleName)
//     return new Role()
// };
//
// Creep.prototype.getRole = function () {
//     // If the creep role isn't in memory grab it based off of the name
//     let roleType = this.memory.role ? this.memory.role : this.name.split('_', 1)[0]
//     return Creep.getRole(roleType)
// };
//
// Creep.prototype.runRole = function() {
//     const role = this.getRole();
//     role.run(this);
//     //roles[this.memory.role].run(this);
// };
// /**
//  * @function
//  * @param {boolean}useContainer
//  * @param {boolean}useSource
//  */
// Creep.prototype.getEnergy = function(useContainer,useSource) {
//     /** @type {StructureContainer} **/
//     let container;
//     // if(this.getActiveBodyparts(CARRY)){
//     //     let dropps = this.room.find(FIND_DROPPED_RESOURCES, {
//     //                 filter: (d) => d.amount >= 50 && d.resourceType === RESOURCE_ENERGY
//     //             });
//     //     if(dropps.length){
//     //         if(this.pickup(dropps[0])=== ERR_NOT_IN_RANGE){
//     //             this.moveTo(dropps[0]);
//     //         }
//     //         return;
//     //     }
//     // }
//
//     if(useContainer) {
//         container = this.pos.findClosestByPath(FIND_STRUCTURES,{
//             filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE ||
//             s.structureType === STRUCTURE_LINK) && s.store[RESOURCE_ENERGY] > this.store.getFreeCapacity(RESOURCE_ENERGY)/2
//         });
//
//         if(container !== undefined) {
//             if(this.withdraw(container,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
//                 this.moveTo(container,{reusePath:10});
//             }
//         }
//     }
//
//     if(container == undefined && useSource) {
//         var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
//
//         if(this.harvest(source) == ERR_NOT_IN_RANGE) {
//             this.moveTo(source,{reusePath:10});
//         }
//     }
// };
//
// Creep.buildFromTemplate = function (template, energy) {
//     let parts = []
//     while (energy > 0 && parts.length < 50) {
//         let next = template[parts.length % template.length]
//         if (BODYPART_COST[next] > energy) {
//             break
//         }
//         energy -= BODYPART_COST[next]
//         parts.push(next)
//     }
//     return parts
// };
//
// Creep.prototype.getCarryPercentage = function () {
//     if (this.carryCapacity <= 0) {
//         return 0
//     }
//     return _.sum(this.carry) / this.carryCapacity
// };
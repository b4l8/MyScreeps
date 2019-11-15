var City = require('city');

global.tickLimit = global.cpuLimit();
global.load = _.round(Game.cpu.getUsed());
console.log(Game.time, 'Script reload', 'Load: ' + global.load, 'Bucket: ' + Game.cpu.bucket);
brain.stats.init();

module.exports.loop = function () {
    brain.main.execute();
    brain.stats.updateCpuStats();
};

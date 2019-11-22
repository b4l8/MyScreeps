// https://en.wikipedia.org/wiki/Sigmoid_function
global.sigmoid = (x) => 1 + Math.tanh((2 * x) - 1);
// sigmoid on Game.cpu.limit + Game.cpu.bucket
global.cpuLimit = () => _.ceil(Game.cpu.limit * global.sigmoid(Game.cpu.bucket / 10000));


/**
 * this should be a collection of useful functions,
 * they should be as general as they can be, so we can use them as often as possible
 **/
global.utils = {
    /**
     * return object.length if exist else return _.size
     *
     * @param {Array} object
     * @return {Number}
     */
    returnLength: function returnLength(object) {
        return (object && object.length) ? object.length : _.size(object);
    },

    stringToParts: function(stringParts) {
        if (!stringParts || typeof(stringParts) !== 'string') {
            return;
        }
        const partsConversion = {
            M: MOVE,
            C: CARRY,
            A: ATTACK,
            W: WORK,
            R: RANGED_ATTACK,
            T: TOUGH,
            H: HEAL,
            K: CLAIM,
        };
        const arrayParts = [];
        for (let i = 0; i < stringParts.length; i++) {
            arrayParts.push(partsConversion[stringParts.charAt(i)]);
        }
        return arrayParts;
    },

    splitRoomName: function(name) {
        const patt = /([A-Z]+)(\d+)([A-Z]+)(\d+)/;
        return patt.exec(name);
    },

    // unclaim functions
    killCreeps: function(room) {
        const creepsToKill = _.filter(Game.creeps, (c) => c.memory.base === room.name);
        room.log('creepsToKill', _.size(creepsToKill), _.map(creepsToKill, (c) => c.suicide()));
    },
    levelToSendNext: function(baseRoom, parts) {
        let factor = 0;
        if (baseRoom.controller.level === 3) {
            factor = 10;
        }
        if (baseRoom.controller.level === 4) {
            factor = 5;
        }
        if (baseRoom.controller.level === 5) {
            factor = 4;
        }
        if (baseRoom.controller.level === 6 || baseRoom.controller.level === 7) {
            factor = 3;
        }
        if (baseRoom.controller.level === 8) {
            factor = 1;
        }
        return factor * parts.carryParts.carry * CARRY_CAPACITY;
    },
};

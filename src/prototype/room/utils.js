/**
 * use a static array for filter a find.
 *
 * @param  {Number}  findTarget      one of the FIND constant. e.g. [FIND_MY_STRUCTURES]
 * @param  {String}  property        the property to filter on. e.g. 'structureType' or 'memory.role'
 * @param  {Array}  properties      the properties to filter. e.g. [STRUCTURE_ROAD, STRUCTURE_RAMPART]
 * @param  {object} [opts={}] Additional options.
 * @param  {function} [opts.filter] Additional filter that wil be applied after cache.
 * @param  {Boolean} [opts.inverse=false] Exclude or include the properties to find.
 * @param  {Number} [opts.timeSpan=0] Return cached data even if it is outdated by `timeSpan` ticks.
 * @return {Array}                  the objects returned in an array.
 */
Room.prototype.findPropertyFilter = function(findTarget, property, properties, opts = {}) {
    const {filter, timeSpan = 0, inverse = false} = opts;
    const cache = this._findPropertyFilterCacheOne(findTarget, property, properties, timeSpan, inverse);
    if (cache.resolveTime !== Game.time) {
        this._findPropertyFilterResolveOutdatedCacheOne(cache);
    }
    if (filter) {
        return _.filter(cache.result, filter);
    } else {
        return cache.result;
    }
};
const localFindCache = {};
Room.prototype._findPropertyFilterCacheTwo = function(findTarget, property, timeSpan) {
    const key = `${this.name} ${findTarget} ${property}`;
    if (!localFindCache[key] || localFindCache[key].time < Game.time + timeSpan) {
        localFindCache[key] = {
            time: Game.time,
            // NOTE : great job to map item by property. TODO 10: stat can use this replace that chain search?
            result: _.groupBy(this.find(findTarget), property),
        };
    }
    return localFindCache[key];
};

Room.prototype._findPropertyFilterCacheOne = function(findTarget, property, properties, timeSpan, inverse) {
    const key = `${this.name} ${findTarget} ${property} ${properties} ${inverse}`;
    if (!localFindCache[key] || localFindCache[key].time < Game.time + timeSpan) {
        const cacheTwoItem = this._findPropertyFilterCacheTwo(findTarget, property, timeSpan);
        const cacheOneItem = localFindCache[key] = {
            resolveTime: Game.time,
            time: Game.time,
            result: [],
        };
        for (const propertyValue of Object.keys(cacheTwoItem.result)) {
            if (properties.includes(propertyValue) !== inverse) {
                Array.prototype.push.apply(cacheOneItem.result, cacheTwoItem.result[propertyValue]);
            }
        }
    }
    return localFindCache[key];
};

Room.prototype._findPropertyFilterResolveOutdatedCacheOne = function(cache) {
    // TODO 10: is there any better way?
    cache.result = cache.result.map((o) => Game.getObjectById(o.id)).filter((o) => o);
    cache.resolveTime = Game.time;
};
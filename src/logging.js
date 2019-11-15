
String.prototype.rpad = function(padString, length) {
    let str = this;
    while (str.length < length) {
        str = str + padString;
    }
    return str;
};

Room.prototype.log = function(...messages) {
    console.log(`${Game.time} ${this.name.rpad(' ', 27)} ${messages.join(' ')}`);
};
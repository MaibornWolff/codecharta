const { Dice } = require("../../domain/model/Dice.js");

function openGate(sides) {
    if (sides > 20) {
        return 20;
    }
    return new Dice(sides).roll().value;
}

module.exports = { openGate };

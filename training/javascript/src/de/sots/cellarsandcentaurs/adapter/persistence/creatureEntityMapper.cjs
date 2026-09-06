const { CreatureEntity } = require("./CreatureEntity.js");
const winston = require("winston");
const REPOSITORY_MODULE = "Repository";
const { Repository } = require(`./${REPOSITORY_MODULE}.js`);
const { xpForCreature } = require("./mapping");

function toEntity(creature) {
    winston.info("mapping creature to entity");
    return new CreatureEntity(creature.getId().id, xpForCreature(creature));
}

function createRepository() {
    return new Repository();
}

module.exports = { toEntity, createRepository };

import { createLogger } from "winston";
import { Creatures } from "./Creatures.js";
import { Creature } from "../model/Creature.js";

const logger = createLogger();

export class CreatureService {
    /**
     * @param {Creatures} creatures
     */
    constructor(creatures) {
        this.creatures = creatures;
    }

    /**
     * @param {Creature} creature
     */
    save(creature) {
        if (!(creature instanceof Creature)) {
            throw new TypeError("not a creature");
        }
        logger.info("saving creature");
        this.creatures.save(creature);
    }
}

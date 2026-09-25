import { CreatureFacade } from "./index.js";
import { rollD20 } from "../domain/model/Dice.js";
import { Centaur } from "../domain/model/Centaur.js";

export class EncounterRunner {
    constructor(creatureFacade) {
        this.creatureFacade = creatureFacade;
    }

    start(creatures) {
        const stable = CreatureFacade.STABLE_NAME;
        const initiative = creatures.map((creature) => [rollD20(), creature]);
        initiative.sort((left, right) => right[0] - left[0]);
        return initiative.map(([, creature]) => (creature instanceof Centaur ? creature.gallop() : 0));
    }
}

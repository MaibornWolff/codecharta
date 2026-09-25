import { CreatureId } from "./CreatureId.js";
import CreatureType from "./CreatureType.js";
import { ArmorClass } from "./ArmorClass.js";
import { SpeedType } from "./SpeedType.js";
import { Speed } from "./Speed.js";
import { HitPoints } from "./HitPoints.js";
import { Fightable } from "./Fightable.js";
import { CreatureFacade } from "../../application/index.js";

/**
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 * @implements {Fightable}
 */
export class Creature {
    /** @type {Map<SpeedType, Speed>} */
    speeds = new Map();

    /** @type {ArmorClass | undefined} */
    armorClass;

    /** @type {HitPoints | undefined} */
    hitPoints;

    constructor(id, type = CreatureFacade.STANDARD_CREATURE_TYPE) {
        this.id = id;
        this.type = type;
    }

    getId() {
        return this.id;
    }

    getType() {
        return this.type;
    }

    setType(type) {
        this.type = type;
    }

    getArmorClass() {
        return this.armorClass;
    }

    setArmorClass(armorClass) {
        this.armorClass = armorClass;
    }

    getSpeeds() {
        return this.speeds;
    }

    setSpeeds(speeds) {
        this.speeds = speeds;
    }

    getHitPoints() {
        return this.hitPoints;
    }

    setHitPoints(hitPoints) {
        this.hitPoints = hitPoints;
    }

    attack(target) {
        target.takeDamage(1);
    }

    takeDamage(amount) {
        this.hitPoints.takeDamage(amount);
    }
}

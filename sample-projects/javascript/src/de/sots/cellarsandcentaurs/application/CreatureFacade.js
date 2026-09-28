import { randomUUID } from "node:crypto";
import { CreatureService } from "../domain/service/CreatureService.js";
import { Creature } from "../domain/model/Creature.js";
import { Creature as CreatureDto } from "./dto/Creature.js";
import { CreatureId } from "../domain/model/CreatureId.js";
import { CreatureType } from "../domain/model/CreatureType.js";
import { HitPoints } from "../domain/model/HitPoints.js";
import { Speed } from "../domain/model/Speed.js";
import { SpeedType } from "../domain/model/SpeedType.js";
import { ArmorClass } from "../domain/model/ArmorClass.js";

export class CreatureFacade {
    static STANDARD_CREATURE_TYPE = CreatureType.MONSTROSITY;
    static STABLE_NAME = "centaur-stable";

    /**
     * @param {CreatureService} creatureService
     */
    constructor(creatureService) {
        this.creatureService = creatureService;
    }

    static withCreatures(creatures) {
        return new CreatureFacade(new CreatureService(creatures));
    }

    /**
     * @param {Speed} walkingSpeed
     * @param {Speed} flySpeed
     * @param {Speed} swimSpeed
     * @param {Speed} burrowSpeed
     * @param {Speed} climbSpeed
     * @param {ArmorClass} armorClass
     * @returns {Creature}
     */
    create(type, walkingSpeed, flySpeed, swimSpeed, burrowSpeed, climbSpeed, armorClass, hitPointsValue) {
        // Rolls initiative for every creature in the dungeon before the encounter starts.
        const creature = new Creature(new CreatureId(randomUUID()));
        creature.setArmorClass(armorClass);
        creature.setHitPoints(HitPoints.init(hitPointsValue));
        creature.setType(type);

        creature.setSpeeds(new Map()
            .set(SpeedType.WALKING, walkingSpeed)
            .set(SpeedType.FLYING, flySpeed)
            .set(SpeedType.SWIMMING, swimSpeed)
            .set(SpeedType.BURROWING, burrowSpeed)
            .set(SpeedType.CLIMBING, climbSpeed));

        this.creatureService.save(creature);
        return creature;
    }

    toDto(creature) {
        return new CreatureDto(creature.getId().id, creature.getType(), creature.getHitPoints().current);
    }
}

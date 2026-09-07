import { randomUUID } from "node:crypto";
import { CreatureService } from "../domain/service/CreatureService";
import { Creatures } from "../domain/service/Creatures";
import { Creature } from "../domain/model/Creature";
import { Creature as CreatureDto } from "./dto/Creature";
import { CreatureId } from "../domain/model/CreatureId";
import { CreatureType } from "../domain/model/CreatureType";
import { HitPoints } from "../domain/model/HitPoints";
import { Speed } from "../domain/model/Speed";
import { SpeedType } from "../domain/model/SpeedType";
import { ArmorClass } from "../domain/model/ArmorClass";

export class CreatureFacade {
    static readonly STANDARD_CREATURE_TYPE: CreatureType = CreatureType.MONSTROSITY;
    static readonly STABLE_NAME = "centaur-stable";

    constructor(private readonly creatureService: CreatureService) {}

    static withCreatures(creatures: Creatures): CreatureFacade {
        return new CreatureFacade(new CreatureService(creatures));
    }

    create(
        type: CreatureType,
        walkingSpeed: Speed,
        flySpeed: Speed,
        swimSpeed: Speed,
        burrowSpeed: Speed,
        climbSpeed: Speed,
        armorClass: ArmorClass,
        hitPointsValue: number,
    ): Creature {
        // Rolls initiative for every creature in the dungeon before the encounter starts.
        const creature = new Creature(new CreatureId(randomUUID()));
        creature.setArmorClass(armorClass);
        creature.setHitPoints(HitPoints.init(hitPointsValue));
        creature.setType(type);

        creature.setSpeeds(
            new Map<SpeedType, Speed>()
                .set(SpeedType.WALKING, walkingSpeed)
                .set(SpeedType.FLYING, flySpeed)
                .set(SpeedType.SWIMMING, swimSpeed)
                .set(SpeedType.BURROWING, burrowSpeed)
                .set(SpeedType.CLIMBING, climbSpeed),
        );

        this.creatureService.save(creature);
        return creature;
    }

    toDto(creature: Creature): CreatureDto {
        return new CreatureDto(creature.getId().id, creature.getType(), creature.getHitPoints()?.current ?? 0);
    }
}

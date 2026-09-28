import { CreatureId } from "./CreatureId";
import CreatureType from "./CreatureType";
import { ArmorClass } from "./ArmorClass";
import { SpeedType } from "./SpeedType";
import { Speed } from "./Speed";
import { HitPoints } from "./HitPoints";
import { Fightable } from "./Fightable";
import { CreatureFacade } from "../../application";

/**
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 */
export class Creature implements Fightable {
    private speeds: Map<SpeedType, Speed> = new Map();
    private armorClass?: ArmorClass;
    private hitPoints?: HitPoints;

    constructor(
        private id: CreatureId,
        private type: CreatureType = CreatureFacade.STANDARD_CREATURE_TYPE,
    ) {}

    getId(): CreatureId {
        return this.id;
    }

    getType(): CreatureType {
        return this.type;
    }

    setType(type: CreatureType): void {
        this.type = type;
    }

    getArmorClass(): ArmorClass | undefined {
        return this.armorClass;
    }

    setArmorClass(armorClass: ArmorClass): void {
        this.armorClass = armorClass;
    }

    getSpeeds(): Map<SpeedType, Speed> {
        return this.speeds;
    }

    setSpeeds(speeds: Map<SpeedType, Speed>): void {
        this.speeds = speeds;
    }

    getHitPoints(): HitPoints | undefined {
        return this.hitPoints;
    }

    setHitPoints(hitPoints: HitPoints): void {
        this.hitPoints = hitPoints;
    }

    attack(target: Fightable): void {
        target.takeDamage(1);
    }

    takeDamage(amount: number): void {
        this.hitPoints?.takeDamage(amount);
    }
}

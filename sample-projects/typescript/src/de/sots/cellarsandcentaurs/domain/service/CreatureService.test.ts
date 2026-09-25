import { describe, expect, it } from "vitest";
import { CreatureService } from "./CreatureService";
import { Creatures } from "./Creatures";
import { Creature } from "../model/Creature";
import { CreatureId } from "../model/CreatureId";
import { Speed } from "../model/Speed";
import { SpeedType } from "../model/SpeedType";

function should_save_creature_to_the_stable(): void {
    const saved: Creature[] = [];
    const creatures: Creatures = {
        save: (creature) => {
            saved.push(creature);
        },
        find: () => saved[0],
    };
    const service = new CreatureService(creatures);
    const walking_speed = new Speed(40);
    const creature = new Creature(new CreatureId("centaur-1"));
    creature.setSpeeds(new Map([[SpeedType.WALKING, walking_speed]]));

    service.save(creature);

    expect(saved).toHaveLength(1);
}

describe("CreatureService", () => {
    it("saves a creature to the stable", should_save_creature_to_the_stable);
});

import { test } from "node:test";
import assert from "node:assert";
import { CreatureService } from "./CreatureService.js";
import { Creature } from "../model/Creature.js";
import { CreatureId } from "../model/CreatureId.js";
import { Speed } from "../model/Speed.js";

function should_save_creature_to_the_stable() {
    const saved = [];
    const creatures = { save: (creature) => saved.push(creature) };
    const service = new CreatureService(creatures);
    const walking_speed = new Speed(40);
    const creature = new Creature(new CreatureId("centaur-1"));
    creature.setSpeeds(new Map([["walking", walking_speed]]));

    service.save(creature);

    assert.strictEqual(saved.length, 1);
}

test("saves a creature to the stable", should_save_creature_to_the_stable);

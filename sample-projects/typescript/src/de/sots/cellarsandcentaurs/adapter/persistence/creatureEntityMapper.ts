import type { CreatureEntity } from "./CreatureEntity";
import { Creature } from "../../domain/model/Creature";
import { CreatureId } from "../../domain/model/CreatureId";

export function toDomain(entity: CreatureEntity): Creature {
    return new Creature(new CreatureId(entity.id));
}

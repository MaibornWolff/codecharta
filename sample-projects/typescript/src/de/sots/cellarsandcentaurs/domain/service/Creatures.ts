import { Creature } from "../model/Creature";
import { CreatureId } from "../model/CreatureId";

export interface Creatures {
    save(creature: Creature): Promise<void> | void;
    find(id: CreatureId): Promise<Creature> | Creature;
}

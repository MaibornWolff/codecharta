import { CreatureRepository } from "./CreatureRepository.js";
import { CreatureEntity } from "./CreatureEntity.js";
import { Creatures } from "../../domain/service/Creatures.js";
import { Creature } from "../../domain/model/Creature.js";
import { CreatureId } from "../../domain/model/CreatureId.js";
import { NoSuchCreatureException } from "../../domain/model/NoSuchCreatureException.js";
import { CreatureFacade } from "../../application/index.js";

export class PersistedCreatures extends Creatures {
    /**
     * @param {CreatureRepository} repository
     */
    constructor(repository) {
        super();
        this.repository = repository;
    }

    async save(creature) {
        await this.repository.save(new CreatureEntity(creature.getId().id));
    }

    async find(id) {
        const creatureEntity = await this.repository.findOne(id.id);
        if (!creatureEntity) {
            throw new NoSuchCreatureException(id);
        }
        return new Creature(new CreatureId(creatureEntity.id), CreatureFacade.STANDARD_CREATURE_TYPE);
    }
}

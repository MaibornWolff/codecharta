import { CreatureEntity as Entity } from "./CreatureEntity.js";
import { Repository } from "./Repository.js";

/**
 * @extends {Repository<Entity>}
 */
export class CreatureRepository extends Repository {
    /**
     * @param {Entity} creature
     */
    async save(creature) {
        await super.save(creature);
    }

    createEmpty(id) {
        return new Entity(id);
    }

    findByXP(minimum) {
        return this.findAll().filter((entity) => entity.XPValue >= minimum);
    }
}

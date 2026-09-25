import { CreatureEntity as Entity } from "./CreatureEntity";
import { Repository } from "./Repository";

export class CreatureRepository extends Repository<Entity> {
    protected tableName(): string {
        return "creatures";
    }

    createEmpty(id: string): Entity {
        return new Entity(id);
    }

    findByXP(minimum: number): Entity[] {
        return this.findAll().filter((entity) => entity.XPValue >= minimum);
    }
}

import { CreatureEntity as Entity } from './CreatureEntity'
import { Repository } from './Repository'

export class CreatureRepository extends Repository<Entity> {
  async findByPrefix(prefix: string): Promise<Entity[]> {
    const all: Entity[] = await this.findAll()
    return all.filter((entity) => entity.id.startsWith(prefix))
  }
}

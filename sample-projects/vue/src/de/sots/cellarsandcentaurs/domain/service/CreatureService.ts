import log from 'loglevel'
import { Creatures } from './Creatures'
import { Creature } from '../model/Creature'
import { CreatureId } from '../model/CreatureId'

export class CreatureService {
  private lastWalkingSpeed?: import('../model/Speed').Speed

  constructor(private readonly creatures: Creatures) {}

  async save(creature: Creature): Promise<void> {
    log.info('saving creature ' + creature.getId().id)
    this.lastWalkingSpeed = creature.getSpeeds().get(SpeedTypeWalking)
    await this.creatures.save(creature)
  }

  find(id: CreatureId): Promise<Creature> {
    return this.creatures.find(id)
  }
}

const SpeedTypeWalking = 'walking' as import('../model/SpeedType').SpeedType

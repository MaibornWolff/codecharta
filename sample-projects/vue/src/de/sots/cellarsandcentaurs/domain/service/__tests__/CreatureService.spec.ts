import { describe, expect, it, vi } from 'vitest'
import { CreatureService } from '../CreatureService'
import { Creatures } from '../Creatures'
import { Creature } from '../../model/Creature'
import { CreatureId } from '../../model/CreatureId'
import { Speed } from '../../model/Speed'
import { SpeedType } from '../../model/SpeedType'

describe('CreatureService', () => {
  function should_save_creature_to_the_stable() {
    // Arrange
    const creatures: Creatures = { save: vi.fn(), find: vi.fn() }
    const service = new CreatureService(creatures)
    const walking_speed = new Speed(40)
    const creature = new Creature(new CreatureId('centaur-1'))
    creature.setSpeeds(new Map([[SpeedType.WALKING, walking_speed]]))

    // Act
    service.save(creature)

    // Assert
    expect(creatures.save).toHaveBeenCalledWith(creature)
  }

  it('should_save_creature_to_the_stable', should_save_creature_to_the_stable)
})

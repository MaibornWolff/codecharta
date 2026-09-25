import { Creature } from './Creature'
import { CreatureId } from './CreatureId'
import { CreatureType } from './CreatureType'
import { Speed } from './Speed'
import { SpeedType } from './SpeedType'
import { Roams } from './Roams'

@Roams('cellar')
export class Centaur extends Creature {
  private readonly XPValue = 100

  constructor(id: CreatureId, walkingSpeed: Speed) {
    super(id, CreatureType.MONSTROSITY)
    this.setSpeeds(new Map([[SpeedType.WALKING, walkingSpeed]]))
  }

  getXPValue(): number {
    return this.XPValue
  }
}

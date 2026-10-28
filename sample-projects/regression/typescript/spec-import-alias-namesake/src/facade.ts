import { Creature } from './model'
import { Creature as CreatureDto } from './dto/creature'

export class Facade {
    toDto(creature: Creature): CreatureDto {
        return new CreatureDto()
    }
}

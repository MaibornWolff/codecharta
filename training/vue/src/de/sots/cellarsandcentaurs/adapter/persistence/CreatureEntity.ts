import { v4 as uuidv4 } from 'uuid'

export class CreatureEntity {
  readonly id: string

  constructor(id?: string) {
    this.id = id ?? uuidv4()
  }
}

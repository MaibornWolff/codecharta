import { CreatureUtil } from '../../application'

export class ArmorClass {
  private readonly total: number

  constructor(
    private base: number,
    private bonus: number,
    private description: string = CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION
  ) {
    this.total = base + bonus
  }

  getBase(): number {
    return this.base
  }

  getBonus(): number {
    return this.bonus
  }

  getTotal(): number {
    return this.total
  }

  getDescription(): string {
    return this.description
  }
}

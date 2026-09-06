/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
export class HitPoints {
  static readonly MAX_HIT_POINTS = 999

  constructor(
    readonly current: number,
    readonly max: number,
    readonly temporary: number = 0
  ) {}

  static init(max: number): HitPoints {
    return new HitPoints(Math.min(max, HitPoints.MAX_HIT_POINTS), max, 0)
  }

  takeDamage(amount: number): HitPoints {
    return new HitPoints(Math.max(0, this.current - amount), this.max, this.temporary)
  }

  rest(): HitPoints {
    return new HitPoints(this.max, this.max, 0)
  }
}

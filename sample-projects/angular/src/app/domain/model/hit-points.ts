export const MAX_HIT_POINTS = 300;

/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
export class HitPoints {
  constructor(
    readonly current: number,
    readonly maximum: number,
  ) {}
}

/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
export class HitPoints {
    static readonly MAX_HIT_POINTS = 999;

    constructor(
        public current: number,
        public max: number,
        public temporary: number = 0,
    ) {}

    static init(max: number): HitPoints {
        const cappedMax = Math.min(max, HitPoints.MAX_HIT_POINTS);
        return new HitPoints(cappedMax, cappedMax, 0);
    }

    takeDamage(amount: number): void {
        this.current = Math.max(0, this.current - amount);
    }

    rest(): void {
        this.current = this.max;
    }
}

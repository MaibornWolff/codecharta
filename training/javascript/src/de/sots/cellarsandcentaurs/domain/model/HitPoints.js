/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
export class HitPoints {
    static MAX_HIT_POINTS = 999;

    constructor(current, max, temporary = 0) {
        this.current = current;
        this.max = Math.min(max, HitPoints.MAX_HIT_POINTS);
        this.temporary = temporary;
    }

    static init(max) {
        return new HitPoints(max, max, 0);
    }

    takeDamage(amount) {
        this.current = Math.max(0, this.current - amount);
    }
}

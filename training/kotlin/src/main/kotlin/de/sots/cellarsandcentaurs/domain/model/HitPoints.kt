package de.sots.cellarsandcentaurs.domain.model

/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
data class HitPoints(val current: Int, val max: Int, val temporary: Int = 0) {

    fun takeDamage(damage: Int): HitPoints = copy(current = maxOf(0, current - damage))

    fun rest(): HitPoints = copy(current = max)

    companion object {
        const val MAX_HIT_POINTS = 999

        fun init(max: Int): HitPoints = HitPoints(minOf(max, MAX_HIT_POINTS), minOf(max, MAX_HIT_POINTS))
    }
}

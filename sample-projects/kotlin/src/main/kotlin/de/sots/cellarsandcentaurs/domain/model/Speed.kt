package de.sots.cellarsandcentaurs.domain.model

@JvmInline
value class Speed(val feetPerRound: Int) {
    operator fun plus(other: Speed): Speed = Speed(feetPerRound + other.feetPerRound)
}

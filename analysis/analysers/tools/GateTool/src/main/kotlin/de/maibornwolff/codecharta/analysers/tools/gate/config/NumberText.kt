package de.maibornwolff.codecharta.analysers.tools.gate.config

fun Double.toDisplayText(): String = if (this % 1.0 == 0.0) toLong().toString() else toString()

fun Double.toJsonNumber(): Number = if (this % 1.0 == 0.0) toLong() else this

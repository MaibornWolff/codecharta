package de.maibornwolff.codecharta.analysers.tools.gate.config

object ConfigKeys {
    const val INPUT = "input"
    const val OUTPUT = "output"
    const val PARALLEL = "parallel"
    const val ANALYSERS = "analysers"
    const val EXIT_CODES = "exitCodes"
    const val METRICS = "metrics"
    const val CYCLES = "cycles"
    const val OVERRIDES = "overrides"
    val TOP_LEVEL = listOf(INPUT, OUTPUT, PARALLEL, ANALYSERS, EXIT_CODES, METRICS, CYCLES, OVERRIDES)

    const val MAX = "max"
    const val INSTRUCTION = "instruction"
    val LEVEL = listOf(MAX, INSTRUCTION)

    const val PATHS = "paths"
    val OVERRIDE = listOf(PATHS, METRICS)

    const val BETWEEN_FILES = "betweenFiles"
    const val INSIDE_FILES = "insideFiles"
    const val UPWARD = "upward"
    val CYCLE_RULES = listOf(BETWEEN_FILES, INSIDE_FILES, UPWARD)

    const val SEVERITY = "severity"
    const val IGNORE = "ignore"
    val CYCLE_RULE = listOf(SEVERITY, INSTRUCTION, IGNORE)
}

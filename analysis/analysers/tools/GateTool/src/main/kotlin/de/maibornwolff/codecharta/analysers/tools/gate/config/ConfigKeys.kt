package de.maibornwolff.codecharta.analysers.tools.gate.config

object ConfigKeys {
    const val INPUT = "input"
    const val OUTPUT = "output"
    const val PARALLEL = "parallel"
    const val EXCLUDE = "exclude"
    const val ANALYSERS = "analysers"
    const val EXIT_CODES = "exitCodes"
    const val METRICS = "metrics"
    const val DEPENDENCIES = "dependencies"
    const val OVERRIDES = "overrides"
    val TOP_LEVEL = listOf(INPUT, OUTPUT, PARALLEL, EXCLUDE, ANALYSERS, EXIT_CODES, METRICS, DEPENDENCIES, OVERRIDES)

    const val MIN = "min"
    const val MAX = "max"
    const val INSTRUCTION = "instruction"
    val LEVEL = listOf(MIN, MAX, INSTRUCTION)

    const val PATHS = "paths"
    val OVERRIDE = listOf(PATHS, METRICS)

    const val CYCLES_BETWEEN_FILES = "cyclesBetweenFiles"
    const val CYCLES_INSIDE_FILES = "cyclesInsideFiles"
    const val UPWARD = "upward"
    val DEPENDENCY_RULES = listOf(CYCLES_BETWEEN_FILES, CYCLES_INSIDE_FILES, UPWARD)

    const val SEVERITY = "severity"
    const val IGNORE = "ignore"
    const val ACCEPT = "accept"
    val DEPENDENCY_RULE = listOf(SEVERITY, INSTRUCTION, IGNORE, ACCEPT)

    const val FILES = "files"
    const val FROM = "from"
    const val TO = "to"
    const val REASON = "reason"
    val ACCEPTED_CYCLE = listOf(FILES, REASON)
    val ACCEPTED_UPWARD = listOf(FROM, TO, REASON)
}

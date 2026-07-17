package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress

/**
 * No-op implementation for --quiet mode or testing.
 */
object SilentProgressReporter : ProgressReporter {
    override fun startPhase(phaseName: String, total: Long?) = Unit

    override fun advance(count: Long) = Unit

    override fun completePhase() = Unit

    override fun close() = Unit
}

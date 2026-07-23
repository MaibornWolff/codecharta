package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress

object SilentProgressReporter : ProgressReporter {
    override fun startPhase(phaseName: String, totalItems: Long?) = Unit

    override fun advance(completedItems: Long) = Unit

    override fun completePhase() = Unit

    override fun close() = Unit
}

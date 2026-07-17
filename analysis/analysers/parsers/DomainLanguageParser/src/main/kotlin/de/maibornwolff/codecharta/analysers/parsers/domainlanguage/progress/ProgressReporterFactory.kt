package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.progress

object ProgressReporterFactory {
    fun create(quiet: Boolean): ProgressReporter = if (quiet) SilentProgressReporter else ProgressTrackerReporter()
}

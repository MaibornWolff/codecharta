package de.maibornwolff.codecharta.analysers.parsers.dependency.progress

object ProgressReporterFactory {
    fun create(quiet: Boolean): ProgressReporter = if (quiet) SilentProgressReporter else ProgressTrackerReporter()
}

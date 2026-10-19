package de.maibornwolff.codecharta.analysers.analyserinterface.failures

import de.maibornwolff.codecharta.util.Logger

/** A file whose analysis failed, relative to the analysed folder, with the reason it failed. */
data class FailedFile(val path: String, val cause: Exception)

/**
 * Words the failed files as warnings, one per distinct cause, most frequent first: a broken grammar or extractor that
 * fails every file of a language shows as one cause with its count instead of a count without a reason.
 */
object FailureReport {
    private const val MAX_LISTED_FILES = 5

    fun warnAbout(failures: List<FailedFile>) = warningsOf(failures).forEach { warning -> Logger.warn { warning } }

    fun warningsOf(failures: List<FailedFile>): List<String> =
        byCause(failures).map { (cause, failed) -> warningOf(cause, failed.map { it.path }.sorted()) }

    private fun byCause(failures: List<FailedFile>): List<Pair<String, List<FailedFile>>> = failures
        .groupBy { describe(it.cause) }
        .toList()
        .sortedByDescending { (_, failed) -> failed.size }

    private fun warningOf(cause: String, paths: List<String>): String {
        val subject = if (paths.size == 1) "1 file could not be analysed and is" else "${paths.size} files could not be analysed and are"
        val unlisted = paths.size - MAX_LISTED_FILES
        val andMore = if (unlisted > 0) " and $unlisted more" else ""
        return "$subject missing from the output ($cause): ${paths.take(MAX_LISTED_FILES).joinToString()}$andMore"
    }

    // Names the cause itself, as the warnings may not be shown, such as by `ccsh gate --quiet`
    fun nothingAnalysed(failures: List<FailedFile>): String {
        val causes = byCause(failures)
        val (mostFrequentCause, failedByIt) = causes.first()
        val failedAll = "No file could be analysed: all ${failures.size} failed"
        if (causes.size == 1) return "$failedAll with $mostFrequentCause"
        return "$failedAll, ${failedByIt.size} with $mostFrequentCause, the others as the warnings above say"
    }

    // A native library that cannot be loaded fails every language, a grammar that does not fit the core only its own
    fun unusableParser(failure: Throwable): String = if (failure is LinkageError) {
        "Cannot load the native tree-sitter libraries: ${failure.message}"
    } else {
        "Cannot parse the files of a language: ${failure.message}"
    }

    private fun describe(cause: Exception): String = listOfNotNull(cause::class.simpleName, cause.message).joinToString(": ")
}

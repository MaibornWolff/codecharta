package de.maibornwolff.codecharta.analysers.parsers.unified

/** A file whose analysis failed, relative to the analysed folder, with the reason it failed. */
data class FailedFile(val path: String, val cause: Exception)

/**
 * Words the failed files as warnings, one per distinct cause, most frequent first: a broken grammar or extractor that
 * fails every file of a language shows as one cause with its count instead of a count without a reason.
 */
object FailureReport {
    private const val MAX_LISTED_FILES = 5

    fun warningsOf(failures: List<FailedFile>): List<String> = failures
        .groupBy { describe(it.cause) }
        .entries
        .sortedByDescending { it.value.size }
        .map { (cause, failed) -> warningOf(cause, failed.map { it.path }.sorted()) }

    private fun warningOf(cause: String, paths: List<String>): String {
        val subject = if (paths.size == 1) "1 file could not be analysed and is" else "${paths.size} files could not be analysed and are"
        val unlisted = paths.size - MAX_LISTED_FILES
        val andMore = if (unlisted > 0) " and $unlisted more" else ""
        return "$subject missing from the output ($cause): ${paths.take(MAX_LISTED_FILES).joinToString()}$andMore"
    }

    private fun describe(cause: Exception): String = listOfNotNull(cause::class.simpleName, cause.message).joinToString(": ")
}

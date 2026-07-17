package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

/**
 * Result of processing a single file.
 *
 * Used to distinguish between files that were successfully processed
 * and files that were skipped due to unsupported extensions.
 */
sealed class FileResult {
    data class Processed(val words: Map<String, Int>) : FileResult()

    data class Skipped(val extension: String) : FileResult()
}

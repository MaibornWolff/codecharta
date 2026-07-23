package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

sealed class FileResult {
    data class Processed(val words: Map<String, Int>) : FileResult()

    data class Skipped(val extension: String) : FileResult()
}

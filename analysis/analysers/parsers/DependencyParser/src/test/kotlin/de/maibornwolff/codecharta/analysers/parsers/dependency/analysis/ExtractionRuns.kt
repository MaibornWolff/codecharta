package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis

import de.maibornwolff.codecharta.analysers.analyserinterface.scan.SourceFileScanner
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.progress.SilentProgressReporter
import java.io.File

/**
 * Runs extraction over a directory of sample sources the way the parser does, minus the CLI.
 *
 * The samples live under `src/test/resources`, so test detection has to be off — every path there is
 * inside a directory called `test`, and the point of the samples is the production-shaped code in them.
 */
fun extractFrom(rootDirectory: String, vararg languages: SupportedLanguage): List<FileReport> {
    val suffixes = languages.flatMap { it.suffixes }.ifEmpty { SupportedLanguage.allSuffixes() }
    val scanner = SourceFileScanner(allowedExtensions = suffixes)
    return ExtractionPipeline(scanner, SilentProgressReporter).run(File(rootDirectory), bypassGitignore = true)
}

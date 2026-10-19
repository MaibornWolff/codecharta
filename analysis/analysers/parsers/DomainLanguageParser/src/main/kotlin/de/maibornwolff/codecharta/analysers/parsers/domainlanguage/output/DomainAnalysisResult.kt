package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

import de.maibornwolff.codecharta.analysers.analyserinterface.failures.FailedFile

/** @property failedFiles the files that could not be analysed and are missing from [filePaths] */
data class DomainAnalysisResult(
    val filePaths: List<String>,
    val wordsByPath: Map<String, List<WordFrequency>>,
    val failedFiles: List<FailedFile> = emptyList()
)

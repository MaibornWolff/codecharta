package de.maibornwolff.codecharta.analysers.parsers.domainlanguage

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output.DomainAnalysisResult

interface WordAnalyzer {
    fun analyze(directoryPath: String): DomainAnalysisResult
}

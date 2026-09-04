package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport

interface LanguageAnalyzer {
    fun analyze(): FileReport
}

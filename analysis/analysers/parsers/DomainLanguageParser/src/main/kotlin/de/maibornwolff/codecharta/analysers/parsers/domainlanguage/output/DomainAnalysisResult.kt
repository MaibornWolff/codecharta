package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

data class DomainAnalysisResult(val filePaths: List<String>, val wordsByPath: Map<String, List<WordFrequency>>)

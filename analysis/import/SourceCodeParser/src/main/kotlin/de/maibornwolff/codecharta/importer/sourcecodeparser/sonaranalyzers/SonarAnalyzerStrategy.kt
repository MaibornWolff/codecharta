package de.maibornwolff.codecharta.importer.sourcecodeparser.sonaranalyzers

interface SonarAnalyzerStrategy {
    fun scanFiles(fileList: List<String>)
}
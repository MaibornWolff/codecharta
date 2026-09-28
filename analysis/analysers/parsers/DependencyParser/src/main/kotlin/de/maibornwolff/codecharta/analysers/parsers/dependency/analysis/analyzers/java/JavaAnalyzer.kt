package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BaseLanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

class JavaAnalyzer(fileInfo: FileInfo) : BaseLanguageAnalyzer(fileInfo) {
    override val language = SupportedLanguage.JAVA
}

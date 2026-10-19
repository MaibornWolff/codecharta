package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.dependency.DependencyParser
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.DomainLanguageParser
import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser

object CodeParsers {
    fun create(): List<AnalyserInterface> = listOf(RawTextParser(), UnifiedParser(), DependencyParser(), DomainLanguageParser())
}

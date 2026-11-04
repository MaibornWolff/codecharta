package de.maibornwolff.codecharta.analysers.tools.analyse

import de.maibornwolff.codecharta.analysers.analyserinterface.AnalyserInterface
import de.maibornwolff.codecharta.analysers.parsers.dependency.DependencyParser
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.DomainLanguageParser
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.CoroutineFileProcessor
import de.maibornwolff.codecharta.analysers.parsers.rawtext.RawTextParser
import de.maibornwolff.codecharta.analysers.parsers.unified.UnifiedParser
import de.maibornwolff.codecharta.serialization.NoPipedInput

object CodeParsers {
    /** With [sharedFileLoop], the tree-sitter parsers parse each file once together, see [SharedFileLoop]. */
    fun create(sharedFileLoop: SharedFileLoop? = null): List<AnalyserInterface> = listOf(
        RawTextParser(input = NoPipedInput),
        UnifiedParser(input = NoPipedInput, fileLoop = sharedFileLoop?.participant(UnifiedParser.NAME)),
        DependencyParser(input = NoPipedInput, fileLoop = sharedFileLoop?.participant(DependencyParser.NAME)),
        DomainLanguageParser(
            input = NoPipedInput,
            fileProcessor = CoroutineFileProcessor(sharedFileLoop?.participant(DomainLanguageParser.NAME))
        )
    )

    val needingEveryFile = mapOf(
        DependencyParser.NAME to "its dependency graph needs every file of the project",
        DomainLanguageParser.NAME to "its TF-IDF scores compare every file of the project"
    )
}

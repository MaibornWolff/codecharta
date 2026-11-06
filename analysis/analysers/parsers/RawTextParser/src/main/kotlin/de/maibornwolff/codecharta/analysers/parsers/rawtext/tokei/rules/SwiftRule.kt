package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.Delimiters
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object SwiftRule : LanguageRule {
    override val tokeiLanguages = setOf("Swift")

    private val multiLineString = Delimiters("\"\"\"", "\"\"\"")

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(quotes = listOf(multiLineString) + syntax.quotes)
}

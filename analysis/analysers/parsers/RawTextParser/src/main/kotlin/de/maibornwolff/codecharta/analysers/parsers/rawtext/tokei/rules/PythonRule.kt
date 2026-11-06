package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.Delimiters
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object PythonRule : LanguageRule {
    override val tokeiLanguages = setOf("Python")

    private val stringPrefixes = listOf("r", "u", "f", "b", "fr", "rf", "br", "rb")

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(
        quotes = syntax.quotes + prefixed(syntax.quotes),
        docQuotes = syntax.docQuotes + prefixed(syntax.docQuotes),
        isDocStringAStatement = true
    )

    private fun prefixed(quotes: List<Delimiters>): List<Delimiters> = stringPrefixes
        .flatMap(::caseVariants)
        .flatMap { prefix -> quotes.map { it.copy(start = prefix + it.start) } }

    private fun caseVariants(prefix: String): List<String> = prefix.fold(listOf("")) { variants, letter ->
        variants.flatMap { listOf(it + letter.lowercaseChar(), it + letter.uppercaseChar()) }
    }
}

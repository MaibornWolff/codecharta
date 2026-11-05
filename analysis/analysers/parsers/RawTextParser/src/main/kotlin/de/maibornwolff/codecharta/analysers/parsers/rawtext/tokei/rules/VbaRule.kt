package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.Delimiters
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object VbaRule : LanguageRule {
    override val tokeiLanguages = setOf("VB6")

    private val remComments = listOf("Rem ", "REM ", "rem ")
    private val stringQuotes = Delimiters("\"", "\"")

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(
        lineComments = syntax.lineComments + remComments,
        quotes = syntax.quotes + stringQuotes,
        isLineCommentOnlyAtWordStart = true
    )
}

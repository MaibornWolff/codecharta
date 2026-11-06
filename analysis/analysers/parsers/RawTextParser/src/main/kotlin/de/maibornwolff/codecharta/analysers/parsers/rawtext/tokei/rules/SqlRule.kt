package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object SqlRule : LanguageRule {
    override val tokeiLanguages = setOf("Sql")

    private const val MYSQL_LINE_COMMENT = "#"
    private const val POSTGRES_JSON_PATH_OPERATOR = "#>"

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(
        lineComments = syntax.lineComments + MYSQL_LINE_COMMENT,
        codeMarkers = listOf(POSTGRES_JSON_PATH_OPERATOR),
        isBackslashEscapeInQuotes = false
    )
}

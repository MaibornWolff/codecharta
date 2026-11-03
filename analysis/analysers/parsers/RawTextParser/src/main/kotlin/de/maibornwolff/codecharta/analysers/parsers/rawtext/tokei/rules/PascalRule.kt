package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object PascalRule : LanguageRule {
    override val tokeiLanguages = setOf("Pascal")

    private val compilerDirectiveStarts = listOf("{\$", "(*\$")

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(codeMarkers = compilerDirectiveStarts)
}

package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal interface LanguageRule {
    val tokeiLanguages: Set<String>

    fun applyTo(syntax: LanguageSyntax): LanguageSyntax
}

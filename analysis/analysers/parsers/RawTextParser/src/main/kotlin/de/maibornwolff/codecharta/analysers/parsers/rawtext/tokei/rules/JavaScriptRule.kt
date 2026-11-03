package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object JavaScriptRule : LanguageRule {
    override val tokeiLanguages = setOf("JavaScript", "TypeScript", "Jsx", "Tsx")

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(hasRegexLiterals = true)
}

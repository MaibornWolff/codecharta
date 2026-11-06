package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.RegexLiteral
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.TemplateLiteral

internal object JavaScriptRule : LanguageRule {
    override val tokeiLanguages = setOf("JavaScript", "TypeScript", "Jsx", "Tsx")

    private val keywordsBeforeAValue = setOf(
        "return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw", "case", "do", "else", "yield", "await"
    )

    private val templateLiteral = TemplateLiteral(quote = "`", placeholderStart = "\${")

    override fun applyTo(syntax: LanguageSyntax) =
        syntax.copy(regexLiteral = RegexLiteral(keywordsBeforeAValue), templateLiteral = templateLiteral)
}

package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.HeredocOpener
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object PhpRule : LanguageRule {
    override val tokeiLanguages = setOf("Php")

    private const val ATTRIBUTE_START = "#["
    private val heredocOrNowdoc = HeredocOpener("""<<<[ \t]*(['"]?)([A-Za-z_]\w*)\1""")

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(
        codeMarkers = listOf(ATTRIBUTE_START),
        heredocOpeners = listOf(heredocOrNowdoc)
    )
}

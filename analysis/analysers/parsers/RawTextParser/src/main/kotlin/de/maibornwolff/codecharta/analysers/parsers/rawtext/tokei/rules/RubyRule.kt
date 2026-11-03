package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.HeredocOpener
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object RubyRule : LanguageRule {
    override val tokeiLanguages = setOf("Ruby")

    private val squigglyOrDashHeredoc = HeredocOpener("""<<[~-](['"`]?)([A-Za-z_]\w*)\1""")

    // `list <<item` appends, so a bare heredoc needs the upper-case terminator Ruby code uses for it
    private val bareHeredoc = HeredocOpener("""<<(['"`]?)([A-Z_][A-Z0-9_]*)\1""")

    private const val DATA_SECTION_MARKER = "__END__"

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(
        heredocOpeners = listOf(squigglyOrDashHeredoc, bareHeredoc),
        dataSectionMarker = DATA_SECTION_MARKER
    )
}

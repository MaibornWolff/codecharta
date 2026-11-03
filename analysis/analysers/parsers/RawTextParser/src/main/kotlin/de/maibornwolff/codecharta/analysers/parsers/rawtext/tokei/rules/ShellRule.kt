package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.HeredocOpener
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object ShellRule : LanguageRule {
    override val tokeiLanguages = setOf("Bash", "Sh", "Zsh", "Ksh")

    private val heredoc = HeredocOpener("""<<(?!<)-?[ \t]*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1""")

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(
        heredocOpeners = listOf(heredoc),
        isLineCommentOnlyAtWordStart = true,
        isBackslashEscapeInCode = true
    )
}

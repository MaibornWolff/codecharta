package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax
import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.MeasuredBlock

internal object VueRule : LanguageRule {
    override val tokeiLanguages = setOf("Vue")

    private val firstScriptBlock = MeasuredBlock(startPattern = """^\s*<script\b""", end = "</script>")

    override fun applyTo(syntax: LanguageSyntax) = JavaScriptRule.applyTo(syntax).copy(measuredBlock = firstScriptBlock)
}

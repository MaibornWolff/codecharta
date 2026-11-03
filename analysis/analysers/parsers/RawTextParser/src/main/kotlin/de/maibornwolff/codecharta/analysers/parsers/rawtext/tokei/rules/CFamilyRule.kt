package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object CFamilyRule : LanguageRule {
    override val tokeiLanguages = setOf("C", "CHeader", "Cpp", "CppHeader", "Cuda", "ObjectiveC", "ObjectiveCpp")

    override fun applyTo(syntax: LanguageSyntax) = syntax.copy(isLineCommentContinuedByBackslash = true)
}

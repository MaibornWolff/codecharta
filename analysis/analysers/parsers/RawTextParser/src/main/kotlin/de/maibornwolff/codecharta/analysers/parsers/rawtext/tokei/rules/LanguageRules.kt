package de.maibornwolff.codecharta.analysers.parsers.rawtext.tokei.rules

import de.maibornwolff.codecharta.analysers.parsers.rawtext.language.LanguageSyntax

internal object LanguageRules {
    private val rules = listOf(ShellRule, RubyRule, PhpRule, JavaScriptRule, VueRule, PascalRule, SqlRule, CFamilyRule, GoRule, PythonRule)
    private val ruleByLanguage = rules.flatMap { rule -> rule.tokeiLanguages.map { it to rule } }.toMap()

    fun applyTo(tokeiLanguage: String, syntax: LanguageSyntax): LanguageSyntax = ruleByLanguage[tokeiLanguage]?.applyTo(syntax) ?: syntax
}

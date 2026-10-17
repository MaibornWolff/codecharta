package de.maibornwolff.treesitter.excavationsite.languages

import de.maibornwolff.treesitter.excavationsite.languages.abl.AblDefinition
import de.maibornwolff.treesitter.excavationsite.languages.angular.AngularDefinition
import de.maibornwolff.treesitter.excavationsite.languages.bash.BashDefinition
import de.maibornwolff.treesitter.excavationsite.languages.c.CDefinition
import de.maibornwolff.treesitter.excavationsite.languages.cpp.CppDefinition
import de.maibornwolff.treesitter.excavationsite.languages.csharp.CSharpDefinition
import de.maibornwolff.treesitter.excavationsite.languages.delphi.DelphiDefinition
import de.maibornwolff.treesitter.excavationsite.languages.go.GoDefinition
import de.maibornwolff.treesitter.excavationsite.languages.java.JavaDefinition
import de.maibornwolff.treesitter.excavationsite.languages.javascript.JavascriptDefinition
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TypescriptDefinition
import de.maibornwolff.treesitter.excavationsite.languages.kotlin.KotlinDefinition
import de.maibornwolff.treesitter.excavationsite.languages.objectivec.ObjectiveCDefinition
import de.maibornwolff.treesitter.excavationsite.languages.php.PhpDefinition
import de.maibornwolff.treesitter.excavationsite.languages.python.PythonDefinition
import de.maibornwolff.treesitter.excavationsite.languages.ruby.RubyDefinition
import de.maibornwolff.treesitter.excavationsite.languages.rust.RustDefinition
import de.maibornwolff.treesitter.excavationsite.languages.sql.SqlDefinition
import de.maibornwolff.treesitter.excavationsite.languages.swift.SwiftDefinition
import de.maibornwolff.treesitter.excavationsite.languages.tsx.TsxDefinition
import de.maibornwolff.treesitter.excavationsite.languages.vue.VueDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition

object LanguageRegistry {
    fun getGrammarLibrary(language: Language): GrammarLibrary = registrationOf(language).grammarLibrary

    fun getLanguageDefinition(language: Language): LanguageDefinition = registrationOf(language).definition

    // Exhaustive, so that a language without a grammar and a definition does not compile
    private fun registrationOf(language: Language): Registration = when (language) {
        Language.JAVA -> Registration(GrammarLibrary("java"), JavaDefinition)
        Language.KOTLIN -> Registration(GrammarLibrary("kotlin"), KotlinDefinition)
        Language.TYPESCRIPT -> Registration(GrammarLibrary("typescript"), TypescriptDefinition)
        Language.TSX -> Registration(GrammarLibrary("tsx"), TsxDefinition)
        Language.JAVASCRIPT -> Registration(GrammarLibrary("javascript"), JavascriptDefinition)
        Language.PYTHON -> Registration(GrammarLibrary("python"), PythonDefinition)
        Language.GO -> Registration(GrammarLibrary("go"), GoDefinition)
        Language.PHP -> Registration(GrammarLibrary("php"), PhpDefinition)
        Language.RUBY -> Registration(GrammarLibrary("ruby"), RubyDefinition)
        Language.SWIFT -> Registration(GrammarLibrary("swift"), SwiftDefinition)
        Language.BASH -> Registration(GrammarLibrary("bash"), BashDefinition)
        Language.CSHARP -> Registration(GrammarLibrary("c-sharp", "c_sharp"), CSharpDefinition)
        Language.CPP -> Registration(GrammarLibrary("cpp"), CppDefinition)
        Language.C -> Registration(GrammarLibrary("c"), CDefinition)
        Language.OBJECTIVE_C -> Registration(GrammarLibrary("objc"), ObjectiveCDefinition)
        Language.VUE -> Registration(GrammarLibrary("javascript"), VueDefinition)
        Language.ABL -> Registration(GrammarLibrary("abl"), AblDefinition)
        Language.DELPHI -> Registration(GrammarLibrary("pascal"), DelphiDefinition)
        Language.RUST -> Registration(GrammarLibrary("rust"), RustDefinition)
        Language.ANGULAR -> Registration(GrammarLibrary("angular"), AngularDefinition)
        Language.SQL -> Registration(GrammarLibrary("sql-island", "sql_island"), SqlDefinition)
    }

    private data class Registration(val grammarLibrary: GrammarLibrary, val definition: LanguageDefinition)
}

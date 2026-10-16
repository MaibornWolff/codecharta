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
    private val registrations: Map<Language, Registration> = mapOf(
        Language.JAVA to Registration(GrammarLibrary("java"), JavaDefinition),
        Language.KOTLIN to Registration(GrammarLibrary("kotlin"), KotlinDefinition),
        Language.TYPESCRIPT to Registration(GrammarLibrary("typescript"), TypescriptDefinition),
        Language.TSX to Registration(GrammarLibrary("tsx"), TsxDefinition),
        Language.JAVASCRIPT to Registration(GrammarLibrary("javascript"), JavascriptDefinition),
        Language.PYTHON to Registration(GrammarLibrary("python"), PythonDefinition),
        Language.GO to Registration(GrammarLibrary("go"), GoDefinition),
        Language.PHP to Registration(GrammarLibrary("php"), PhpDefinition),
        Language.RUBY to Registration(GrammarLibrary("ruby"), RubyDefinition),
        Language.SWIFT to Registration(GrammarLibrary("swift"), SwiftDefinition),
        Language.BASH to Registration(GrammarLibrary("bash"), BashDefinition),
        Language.CSHARP to Registration(GrammarLibrary("c-sharp", "c_sharp"), CSharpDefinition),
        Language.CPP to Registration(GrammarLibrary("cpp"), CppDefinition),
        Language.C to Registration(GrammarLibrary("c"), CDefinition),
        Language.OBJECTIVE_C to Registration(GrammarLibrary("objc"), ObjectiveCDefinition),
        Language.VUE to Registration(GrammarLibrary("javascript"), VueDefinition),
        Language.ABL to Registration(GrammarLibrary("abl"), AblDefinition),
        Language.DELPHI to Registration(GrammarLibrary("pascal"), DelphiDefinition),
        Language.RUST to Registration(GrammarLibrary("rust"), RustDefinition),
        Language.ANGULAR to Registration(GrammarLibrary("angular"), AngularDefinition),
        Language.SQL to Registration(GrammarLibrary("sql-island", "sql_island"), SqlDefinition)
    )

    fun getGrammarLibrary(language: Language): GrammarLibrary = registrations.getValue(language).grammarLibrary

    fun getLanguageDefinition(language: Language): LanguageDefinition = registrations.getValue(language).definition

    private data class Registration(val grammarLibrary: GrammarLibrary, val definition: LanguageDefinition)
}

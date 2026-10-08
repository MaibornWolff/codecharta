package de.maibornwolff.treesitter.excavationsite.languages

import de.maibornwolff.treesitter.excavationsite.languages.abl.AblDefinition
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
import de.maibornwolff.treesitter.excavationsite.languages.swift.SwiftDefinition
import de.maibornwolff.treesitter.excavationsite.languages.tsx.TsxDefinition
import de.maibornwolff.treesitter.excavationsite.languages.vue.VueDefinition
import de.maibornwolff.treesitter.excavationsite.shared.domain.GrammarLibrary
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition

object LanguageRegistry {
    fun getGrammarLibrary(language: Language): GrammarLibrary = when (language) {
        Language.JAVA -> GrammarLibrary("java")
        Language.KOTLIN -> GrammarLibrary("kotlin")
        Language.TYPESCRIPT -> GrammarLibrary("typescript")
        Language.TSX -> GrammarLibrary("tsx")
        Language.JAVASCRIPT -> GrammarLibrary("javascript")
        Language.PYTHON -> GrammarLibrary("python")
        Language.GO -> GrammarLibrary("go")
        Language.PHP -> GrammarLibrary("php")
        Language.RUBY -> GrammarLibrary("ruby")
        Language.SWIFT -> GrammarLibrary("swift")
        Language.BASH -> GrammarLibrary("bash")
        Language.CSHARP -> GrammarLibrary("c-sharp", "c_sharp")
        Language.CPP -> GrammarLibrary("cpp")
        Language.C -> GrammarLibrary("c")
        Language.OBJECTIVE_C -> GrammarLibrary("objc")
        Language.VUE -> GrammarLibrary("javascript")
        Language.ABL -> GrammarLibrary("abl")
        Language.DELPHI -> GrammarLibrary("pascal")
        Language.RUST -> GrammarLibrary("rust")
    }

    fun getLanguageDefinition(language: Language): LanguageDefinition = when (language) {
        Language.JAVA -> JavaDefinition
        Language.KOTLIN -> KotlinDefinition
        Language.TYPESCRIPT -> TypescriptDefinition
        Language.TSX -> TsxDefinition
        Language.JAVASCRIPT -> JavascriptDefinition
        Language.PYTHON -> PythonDefinition
        Language.GO -> GoDefinition
        Language.PHP -> PhpDefinition
        Language.RUBY -> RubyDefinition
        Language.SWIFT -> SwiftDefinition
        Language.BASH -> BashDefinition
        Language.CSHARP -> CSharpDefinition
        Language.CPP -> CppDefinition
        Language.C -> CDefinition
        Language.OBJECTIVE_C -> ObjectiveCDefinition
        Language.VUE -> VueDefinition
        Language.ABL -> AblDefinition
        Language.DELPHI -> DelphiDefinition
        Language.RUST -> RustDefinition
    }
}

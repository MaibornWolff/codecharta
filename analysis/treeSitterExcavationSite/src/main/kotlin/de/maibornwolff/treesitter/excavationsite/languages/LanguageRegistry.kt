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
import de.maibornwolff.treesitter.excavationsite.shared.domain.Language
import de.maibornwolff.treesitter.excavationsite.shared.domain.LanguageDefinition
import org.treesitter.TSLanguage
import org.treesitter.TreeSitterAbl
import org.treesitter.TreeSitterBash
import org.treesitter.TreeSitterC
import org.treesitter.TreeSitterCSharp
import org.treesitter.TreeSitterCpp
import org.treesitter.TreeSitterGo
import org.treesitter.TreeSitterJava
import org.treesitter.TreeSitterJavascript
import org.treesitter.TreeSitterKotlin
import org.treesitter.TreeSitterObjc
import org.treesitter.TreeSitterPascal
import org.treesitter.TreeSitterPhp
import org.treesitter.TreeSitterPython
import org.treesitter.TreeSitterRuby
import org.treesitter.TreeSitterRust
import org.treesitter.TreeSitterSwift
import org.treesitter.TreeSitterTsx
import org.treesitter.TreeSitterTypescript

/**
 * Registry that maps Language enum values to their TreeSitter language and definition.
 *
 * This centralizes the mapping between the Language enum and its associated
 * TreeSitter parser and language definition.
 */
object LanguageRegistry {
    /**
     * Returns a new TreeSitter language parser instance for the given language.
     */
    fun getTreeSitterLanguage(language: Language): TSLanguage = when (language) {
        Language.JAVA -> TreeSitterJava()
        Language.KOTLIN -> TreeSitterKotlin()
        Language.TYPESCRIPT -> TreeSitterTypescript()
        Language.TSX -> TreeSitterTsx()
        Language.JAVASCRIPT -> TreeSitterJavascript()
        Language.PYTHON -> TreeSitterPython()
        Language.GO -> TreeSitterGo()
        Language.PHP -> TreeSitterPhp()
        Language.RUBY -> TreeSitterRuby()
        Language.SWIFT -> TreeSitterSwift()
        Language.BASH -> TreeSitterBash()
        Language.CSHARP -> TreeSitterCSharp()
        Language.CPP -> TreeSitterCpp()
        Language.C -> TreeSitterC()
        Language.OBJECTIVE_C -> TreeSitterObjc()
        Language.VUE -> TreeSitterJavascript()
        Language.ABL -> TreeSitterAbl()
        Language.DELPHI -> TreeSitterPascal()
        Language.RUST -> TreeSitterRust()
    }

    /**
     * Returns the language definition for the given language.
     */
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

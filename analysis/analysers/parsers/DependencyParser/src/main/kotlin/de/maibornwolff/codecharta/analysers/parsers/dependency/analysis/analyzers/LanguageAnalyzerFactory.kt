package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp.CppAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi.DelphiAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java.JavaAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.javascript.JavascriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.kotlin.KotlinAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.PhpAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.PythonAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust.RustAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.TypescriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue.VueAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

class LanguageAnalyzerFactory {
    companion object {
        fun createAnalyzer(fileInfo: FileInfo): LanguageAnalyzer = when (fileInfo.language) {
            SupportedLanguage.JAVA -> JavaAnalyzer(fileInfo)
            SupportedLanguage.C_SHARP -> CSharpAnalyzer(fileInfo)
            SupportedLanguage.TYPESCRIPT -> TypescriptAnalyzer(fileInfo)
            SupportedLanguage.JAVASCRIPT -> JavascriptAnalyzer(fileInfo)
            SupportedLanguage.PHP -> PhpAnalyzer(fileInfo)
            SupportedLanguage.GO -> GoAnalyzer(fileInfo)
            SupportedLanguage.PYTHON -> PythonAnalyzer(fileInfo)
            SupportedLanguage.CPP -> CppAnalyzer(fileInfo)
            SupportedLanguage.KOTLIN -> KotlinAnalyzer(fileInfo)
            SupportedLanguage.VUE -> VueAnalyzer(fileInfo)
            SupportedLanguage.DELPHI -> DelphiAnalyzer(fileInfo)
            SupportedLanguage.RUST -> RustAnalyzer(fileInfo)
        }
    }
}

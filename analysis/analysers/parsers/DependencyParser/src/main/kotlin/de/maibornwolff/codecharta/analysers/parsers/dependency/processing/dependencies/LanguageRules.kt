package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp.CppCopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp.CppIncludes
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp.CppNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpCopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpProjects
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi.DelphiNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoCopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java.JavaNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.php.PhpNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python.PythonNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust.RustCopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust.RustNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql.SqlCopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql.SqlNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.TypescriptNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DefaultNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NearestCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import java.io.File

/** The rules of a language that differ from the shared ones; each language's own rules live next to its analyzer. */
internal object LanguageRules {
    fun namesOf(language: SupportedLanguage): NameRules = when (language) {
        SupportedLanguage.C_SHARP -> CSharpNameRules
        SupportedLanguage.CPP -> CppNameRules
        SupportedLanguage.DELPHI -> DelphiNameRules
        SupportedLanguage.JAVA, SupportedLanguage.KOTLIN -> JavaNameRules
        SupportedLanguage.GO -> GoNameRules
        SupportedLanguage.PHP -> PhpNameRules
        SupportedLanguage.PYTHON -> PythonNameRules
        SupportedLanguage.RUST -> RustNameRules
        SupportedLanguage.SQL -> SqlNameRules
        SupportedLanguage.TYPESCRIPT, SupportedLanguage.JAVASCRIPT, SupportedLanguage.VUE -> TypescriptNameRules
        else -> DefaultNameRules
    }

    fun copiesOf(language: SupportedLanguage, analysisRoot: File?): CopyRules = when (language) {
        SupportedLanguage.C_SHARP -> CSharpCopyRules(CSharpProjects(analysisRoot))
        SupportedLanguage.SQL -> SqlCopyRules
        SupportedLanguage.GO -> GoCopyRules
        SupportedLanguage.CPP -> CppCopyRules(analysisRoot?.let { CppIncludes.of(it) })
        SupportedLanguage.RUST -> RustCopyRules
        else -> NearestCopy
    }
}

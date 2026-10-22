package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpCopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpProjects
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang.GoNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java.JavaNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql.SqlCopyRules
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
        SupportedLanguage.JAVA, SupportedLanguage.KOTLIN -> JavaNameRules
        SupportedLanguage.GO -> GoNameRules
        else -> DefaultNameRules
    }

    fun copiesOf(language: SupportedLanguage, analysisRoot: File?): CopyRules = when (language) {
        SupportedLanguage.C_SHARP -> CSharpCopyRules(CSharpProjects(analysisRoot))
        SupportedLanguage.SQL -> SqlCopyRules
        else -> NearestCopy
    }
}

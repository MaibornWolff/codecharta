package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpCopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java.JavaNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql.SqlCopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DefaultNameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NameRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NearestCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage

/** The rules of a language that differ from the shared ones; each language's own rules live next to its analyzer. */
internal object LanguageRules {
    fun namesOf(language: SupportedLanguage): NameRules = when (language) {
        SupportedLanguage.C_SHARP -> CSharpNameRules
        SupportedLanguage.JAVA, SupportedLanguage.KOTLIN -> JavaNameRules
        else -> DefaultNameRules
    }

    fun copiesOf(language: SupportedLanguage): CopyRules = when (language) {
        SupportedLanguage.C_SHARP -> CSharpCopyRules
        SupportedLanguage.SQL -> SqlCopyRules
        else -> NearestCopy
    }
}

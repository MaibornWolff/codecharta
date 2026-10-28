package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Language
import java.io.File

/** The language a TypeScript or JavaScript module file is read in, by its ending. */
internal object ModuleLanguages {
    private val JAVASCRIPT_ENDINGS = listOf(".js", ".jsx", ".mjs", ".cjs")
    private const val TSX_ENDING = ".tsx"

    fun tseLanguageOf(moduleFile: File): Language = when {
        moduleFile.name.endsWith(TSX_ENDING) -> Language.TSX
        isJavascript(moduleFile) -> Language.JAVASCRIPT
        else -> Language.TYPESCRIPT
    }

    fun languageOf(moduleFile: File): SupportedLanguage =
        if (isJavascript(moduleFile)) SupportedLanguage.JAVASCRIPT else SupportedLanguage.TYPESCRIPT

    private fun isJavascript(moduleFile: File): Boolean = JAVASCRIPT_ENDINGS.any { moduleFile.name.endsWith(it) }
}

package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * What the modules of a project export, by "What an import binds" of `docs/name-resolution/typescript.md`, each module
 * read once per analysis root, as every file that imports it may ask.
 */
internal class ModuleExports private constructor() {
    private val defaultNameByFile = ConcurrentHashMap<String, DefaultName>()

    /**
     * The name below the module's logical path that its default export has: the declaration `export default name` or
     * `export default class Name` names, else [DefaultExports.LEAF_NAME]; none for a Vue component, which is the
     * module itself, or for a module without a default export.
     */
    fun defaultNameOf(moduleFile: File): String? =
        defaultNameByFile.computeIfAbsent(moduleFile.absolutePath) { DefaultName(readDefaultName(moduleFile)) }.name

    private fun readDefaultName(moduleFile: File): String? {
        if (moduleFile.name.endsWith(VUE_ENDING)) return null
        val result =
            runCatching { TreeSitterDependencies.analyze(moduleFile.readText(), languageOf(moduleFile)) }.getOrNull() ?: return null
        val defaultExport = result.declarations.firstOrNull { it.name == TSE_DEFAULT_EXPORT_NAME } ?: return null
        val namedDeclaration = defaultExport.usedTypes.singleOrNull()?.name
        val isOwnName = defaultExport.type == DeclarationType.REEXPORT && namedDeclaration != null && declares(result, namedDeclaration)
        return if (isOwnName) namedDeclaration else DefaultExports.LEAF_NAME
    }

    private fun declares(result: DependencyResult, name: String): Boolean =
        result.declarations.any { it.name == name && it.parentPath.isEmpty() && it.type != DeclarationType.REEXPORT }

    private class DefaultName(val name: String?)

    companion object {
        private const val VUE_ENDING = ".vue"
        private val JAVASCRIPT_ENDINGS = listOf(".js", ".jsx", ".mjs", ".cjs")
        private const val TSX_ENDING = ".tsx"
        private val exportsByRoot = ConcurrentHashMap<String, ModuleExports>()

        fun of(analysisRoot: File): ModuleExports = exportsByRoot.computeIfAbsent(analysisRoot.absolutePath) { ModuleExports() }

        private fun languageOf(moduleFile: File): Language = when {
            moduleFile.name.endsWith(TSX_ENDING) -> Language.TSX
            JAVASCRIPT_ENDINGS.any { moduleFile.name.endsWith(it) } -> Language.JAVASCRIPT
            else -> Language.TYPESCRIPT
        }
    }
}

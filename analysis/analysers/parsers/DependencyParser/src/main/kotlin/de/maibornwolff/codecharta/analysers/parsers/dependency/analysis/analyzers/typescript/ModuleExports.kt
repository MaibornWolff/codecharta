package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * What the modules of a project export, by "What an import binds" of `docs/name-resolution/typescript.md`: the own
 * declaration an exported name stands for and the default export, each module read once per analysis root, as every
 * file that imports it may ask.
 */
internal class ModuleExports private constructor() {
    private val tableByFile = ConcurrentHashMap<String, ExportTable>()

    /**
     * The name below the module's logical path that its default export has: the declaration `export default name` or
     * `export default class Name` names, else [DefaultExports.LEAF_NAME]; none for a Vue component, which is the
     * module itself, or for a module without a default export.
     */
    fun defaultNameOf(moduleFile: File): String? = tableOf(moduleFile).defaultName

    /** The name below the module's logical path that its export [exportedName] has: the own declaration it stands for. */
    fun nameOf(moduleFile: File, exportedName: String): String = tableOf(moduleFile).ownNameByExport[exportedName] ?: exportedName

    private fun tableOf(moduleFile: File): ExportTable = tableByFile.computeIfAbsent(moduleFile.absolutePath) { read(moduleFile) }

    private fun read(moduleFile: File): ExportTable {
        if (moduleFile.name.endsWith(VUE_ENDING)) return ExportTable.NONE
        val result =
            runCatching { TreeSitterDependencies.analyze(moduleFile.readText(), languageOf(moduleFile)) }.getOrNull()
                ?: return ExportTable.NONE
        val ownNameByExport = result.declarations
            .filter { it.type == DeclarationType.REEXPORT && it.parentPath.isEmpty() }
            .mapNotNull { export ->
                export.usedTypes
                    .singleOrNull()
                    ?.name
                    ?.takeIf { declares(result, it) }
                    ?.let { export.name to it }
            }.toMap()
        val hasDefault = result.declarations.any { it.name == TSE_DEFAULT_EXPORT_NAME }
        val defaultName = if (hasDefault) ownNameByExport[TSE_DEFAULT_EXPORT_NAME] ?: DefaultExports.LEAF_NAME else null
        return ExportTable(ownNameByExport, defaultName)
    }

    private fun declares(result: DependencyResult, name: String): Boolean =
        result.declarations.any { it.name == name && it.parentPath.isEmpty() && it.type != DeclarationType.REEXPORT }

    private class ExportTable(val ownNameByExport: Map<String, String>, val defaultName: String?) {
        companion object {
            val NONE = ExportTable(emptyMap(), null)
        }
    }

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

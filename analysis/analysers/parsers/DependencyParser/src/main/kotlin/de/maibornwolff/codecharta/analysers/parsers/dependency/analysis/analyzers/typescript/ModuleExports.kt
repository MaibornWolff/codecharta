package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.WILDCARD_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * What the modules of a project export, by "Declarations" and "What an import binds" of
 * `docs/name-resolution/typescript.md`: the own declaration an exported name stands for, the default export, and the
 * names a module exports by name, through `export *` too; each module read once per analysis root, as every file that
 * imports it may ask.
 */
internal class ModuleExports private constructor(private val analysisRoot: File) {
    private val tableByFile = ConcurrentHashMap<String, ExportTable>()

    /**
     * The name below the module's logical path that its default export has: the declaration `export default name` or
     * `export default class Name` names, else [DefaultExports.LEAF_NAME]; none for a Vue component, which is the
     * module itself, or for a module without a default export.
     */
    fun defaultNameOf(moduleFile: File): String? = tableOf(moduleFile).defaultName

    /** The name below the module's logical path that its export [exportedName] has: the own declaration it stands for. */
    fun nameOf(moduleFile: File, exportedName: String): String = tableOf(moduleFile).ownNameByExport[exportedName] ?: exportedName

    /**
     * The names `export *` from the [sources] re-exports, each with the module it comes from: every name a source
     * exports by name, without its default export, a name of [ownNames], and a name two sources offer.
     */
    fun starExports(sources: List<File>, ownNames: Set<String>): Map<String, File> = starExports(sources, ownNames, emptySet())

    private fun starExports(sources: List<File>, ownNames: Set<String>, visited: Set<String>): Map<String, File> = sources
        .distinct()
        .flatMap { source -> namedExportsOf(source, visited).map { name -> name to source } }
        .groupBy({ it.first }, { it.second })
        .filter { (name, offeringSources) -> name !in ownNames && offeringSources.size == 1 }
        .mapValues { (_, offeringSources) -> offeringSources.single() }

    private fun namedExportsOf(moduleFile: File, visited: Set<String>): Set<String> {
        if (moduleFile.absolutePath in visited) return emptySet()
        val table = tableOf(moduleFile)
        return table.namedExports + starExports(table.starSources, table.namedExports, visited + moduleFile.absolutePath).keys
    }

    private fun tableOf(moduleFile: File): ExportTable = tableByFile.computeIfAbsent(moduleFile.absolutePath) { read(moduleFile) }

    private fun read(moduleFile: File): ExportTable {
        if (moduleFile.name.endsWith(VUE_ENDING)) return ExportTable.NONE
        val content = runCatching { moduleFile.readText() }.getOrNull() ?: return ExportTable.NONE
        val result = runCatching { TreeSitterDependencies.analyze(content, languageOf(moduleFile)) }.getOrNull() ?: return ExportTable.NONE
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
        return ExportTable(
            ownNameByExport,
            defaultName,
            namedExportsIn(result, ownNameByExport),
            starSourcesOf(result, moduleFile, content)
        )
    }

    // What a module exports by name: its exported declarations except the one only its default export names, and its re-exports
    private fun namedExportsIn(result: DependencyResult, ownNameByExport: Map<String, String>): Set<String> {
        val reexports = result.declarations
            .filter { it.type == DeclarationType.REEXPORT && it.parentPath.isEmpty() }
            .map { it.name }
            .filter { it != TSE_DEFAULT_EXPORT_NAME && it != WILDCARD_EXPORT_NAME }
        val defaultTarget = ownNameByExport[TSE_DEFAULT_EXPORT_NAME]
        val exportedDeclarations = result.declarations
            .filter { it.type != DeclarationType.REEXPORT && it.parentPath.isEmpty() && !it.isFileScoped }
            .map { it.name }
            .filter { it != defaultTarget }
        return (exportedDeclarations + reexports).toSet()
    }

    private fun starSourcesOf(result: DependencyResult, moduleFile: File, content: String): List<File> {
        val fileInfo =
            FileInfo(
                languageOfFileInfo(moduleFile),
                moduleFile.canonicalFile.relativeTo(analysisRoot.canonicalFile).invariantSeparatorsPath,
                content,
                analysisRoot
            )
        return result.imports
            .filter { it.kind == ImportKind.REEXPORT && it.isWildcard }
            .mapNotNull { ImportedModules.fileOf(it, fileInfo) }
    }

    private fun declares(result: DependencyResult, name: String): Boolean =
        result.declarations.any { it.name == name && it.parentPath.isEmpty() && it.type != DeclarationType.REEXPORT }

    private class ExportTable(
        val ownNameByExport: Map<String, String>,
        val defaultName: String?,
        val namedExports: Set<String>,
        val starSources: List<File>
    ) {
        companion object {
            val NONE = ExportTable(emptyMap(), null, emptySet(), emptyList())
        }
    }

    companion object {
        private const val VUE_ENDING = ".vue"
        private val JAVASCRIPT_ENDINGS = listOf(".js", ".jsx", ".mjs", ".cjs")
        private const val TSX_ENDING = ".tsx"
        private val exportsByRoot = ConcurrentHashMap<String, ModuleExports>()

        fun of(analysisRoot: File): ModuleExports = exportsByRoot.computeIfAbsent(analysisRoot.absolutePath) { ModuleExports(analysisRoot) }

        private fun isJavascript(moduleFile: File): Boolean = JAVASCRIPT_ENDINGS.any { moduleFile.name.endsWith(it) }

        private fun languageOf(moduleFile: File): Language = when {
            moduleFile.name.endsWith(TSX_ENDING) -> Language.TSX
            isJavascript(moduleFile) -> Language.JAVASCRIPT
            else -> Language.TYPESCRIPT
        }

        private fun languageOfFileInfo(moduleFile: File): SupportedLanguage =
            if (isJavascript(moduleFile)) SupportedLanguage.JAVASCRIPT else SupportedLanguage.TYPESCRIPT
    }
}

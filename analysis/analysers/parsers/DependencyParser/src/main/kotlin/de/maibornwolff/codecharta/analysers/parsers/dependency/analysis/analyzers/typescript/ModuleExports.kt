package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.WILDCARD_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * What the modules of a project export, by "Declarations" and "What an import binds" of
 * `docs/name-resolution/typescript.md`: the own declaration an exported name stands for, the default export, and the
 * names a module exports by name, through `export *` too, and the modules it exports as a name by `export * as`; each
 * module read once per analysis root, as every file that imports it may ask.
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

    /** The module [moduleFile] exports as [exportedName] by `export * as`, itself or through `export *`; null for any other name. */
    fun moduleExportOf(moduleFile: File, exportedName: String): File? = moduleExportOf(moduleFile, exportedName, emptySet())

    private fun moduleExportOf(moduleFile: File, exportedName: String, visited: Set<String>): File? {
        if (moduleFile.absolutePath in visited) return null
        val table = tableOf(moduleFile)
        return table.moduleExports[exportedName] ?: table.starSources
            .mapNotNull { moduleExportOf(it, exportedName, visited + moduleFile.absolutePath) }
            .distinct()
            .singleOrNull()
    }

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
        val result =
            runCatching { TreeSitterDependencies.analyze(content, ModuleLanguages.tseLanguageOf(moduleFile)) }.getOrNull()
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
        val reexportedModules = reexportedModulesOf(result, moduleFile, content)
        return ExportTable(
            ownNameByExport,
            defaultName,
            namedExportsIn(result, ownNameByExport),
            starSources = reexportedModules.filter { (name, _) -> name == null }.map { (_, module) -> module },
            moduleExports = reexportedModules.mapNotNull { (name, module) -> name?.let { it to module } }.toMap()
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

    // The modules `export *` re-exports the names of, each with no name, and those `export * as name` exports as a name
    private fun reexportedModulesOf(result: DependencyResult, moduleFile: File, content: String): List<Pair<String?, File>> {
        val fileInfo =
            FileInfo(
                ModuleLanguages.languageOf(moduleFile),
                moduleFile.canonicalFile.relativeTo(analysisRoot.canonicalFile).invariantSeparatorsPath,
                content,
                analysisRoot
            )
        return result.imports
            .filter { it.kind == ImportKind.REEXPORT && it.isWildcard }
            .mapNotNull { import -> ImportedModules.fileOf(import, fileInfo)?.let { import.bindingName to it } }
    }

    private fun declares(result: DependencyResult, name: String): Boolean =
        result.declarations.any { it.name == name && it.parentPath.isEmpty() && it.type != DeclarationType.REEXPORT }

    private class ExportTable(
        val ownNameByExport: Map<String, String>,
        val defaultName: String?,
        val namedExports: Set<String>,
        val starSources: List<File>,
        val moduleExports: Map<String, File>
    ) {
        companion object {
            val NONE = ExportTable(emptyMap(), null, emptySet(), emptyList(), emptyMap())
        }
    }

    companion object {
        private const val VUE_ENDING = ".vue"
        private val exportsByRoot = ConcurrentHashMap<String, ModuleExports>()

        fun of(analysisRoot: File): ModuleExports = exportsByRoot.computeIfAbsent(analysisRoot.absolutePath) { ModuleExports(analysisRoot) }
    }
}

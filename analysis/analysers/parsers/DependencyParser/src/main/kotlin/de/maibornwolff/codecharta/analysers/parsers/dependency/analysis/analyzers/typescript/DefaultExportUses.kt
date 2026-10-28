package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * The uses of a module's default export by its specifier, by decisions 2 and 8 of `docs/name-resolution/typescript.md`:
 * `export { default as B } from './m'` uses the default export of `m`, none where `m` is no project file or has none.
 */
internal object DefaultExportUses {
    fun of(usedTypes: Set<UsedType>, fileInfo: FileInfo): Set<UsedType> = usedTypes.mapNotNullTo(LinkedHashSet()) { usedType ->
        if (isDefaultExportBySpecifier(usedType)) defaultExportUse(usedType.namespacePrefix, fileInfo) else usedType
    }

    private fun isDefaultExportBySpecifier(usedType: UsedType): Boolean =
        usedType.name == TSE_DEFAULT_EXPORT_NAME && usedType.namespacePrefix.isNotEmpty()

    private fun defaultExportUse(specifier: List<String>, fileInfo: FileInfo): UsedType? {
        val analysisRoot = fileInfo.analysisRoot ?: return null
        val moduleFile = ImportedModules.fileOf(ImportDeclaration(path = specifier, isWildcard = false), fileInfo) ?: return null
        val module = ImportedModules.logicalPathOf(moduleFile, analysisRoot)
        return ModuleExports.of(analysisRoot).defaultPathOf(moduleFile, module)?.let { UsedType(it.withDots()) }
    }
}

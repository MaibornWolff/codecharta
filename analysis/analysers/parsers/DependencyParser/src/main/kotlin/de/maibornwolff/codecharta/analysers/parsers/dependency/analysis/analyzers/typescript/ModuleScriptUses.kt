package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_MODULE_SCRIPT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * The uses of a module's top-level code, by "What an import binds" of `docs/name-resolution/typescript.md` (decision
 * 3): a side-effect import or a `require` whose result is not bound is a use of the script leaf of the module its
 * specifier names, none where that is no project file.
 */
internal object ModuleScriptUses {
    fun of(usedTypes: Set<UsedType>, fileInfo: FileInfo): Set<UsedType> = usedTypes.mapNotNullTo(LinkedHashSet()) { usedType ->
        if (usedType.name == TSE_MODULE_SCRIPT_NAME) scriptLeafUse(usedType.namespacePrefix, fileInfo) else usedType
    }

    private fun scriptLeafUse(specifier: List<String>, fileInfo: FileInfo): UsedType? {
        val analysisRoot = fileInfo.analysisRoot ?: return null
        val moduleFile = ImportedModules.fileOf(ImportDeclaration(path = specifier, isWildcard = false), fileInfo) ?: return null
        return UsedType(ScriptLeaf.pathIn(ImportedModules.logicalPathOf(moduleFile, analysisRoot)).withDots())
    }
}

package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import java.io.File

/**
 * The default imports of one file, by "What an import binds" of `docs/name-resolution/typescript.md`: `import D from
 * './m'` binds `D` to the default export of `m`, so a use of `D` is written as the full path of that declaration.
 */
internal class DefaultImports(private val analysisRoot: File) {
    private val targetByBinding = HashMap<String, Path>()

    /** The declaration a default import of [moduleFile] means, null for an import that is none or a module without a default. */
    fun targetOf(import: ImportDeclaration, moduleFile: File, module: Path): Path? {
        if (!ImportedModules.namesMember(import) || import.path.lastOrNull() != TSE_DEFAULT_EXPORT_NAME) return null
        val target = defaultOf(moduleFile, module) ?: return null
        import.bindingName?.let { targetByBinding[it] = target }
        return target
    }

    fun rewrite(usedTypes: Set<UsedType>): Set<UsedType> = usedTypes.mapTo(LinkedHashSet()) { rewrite(it) }

    private fun rewrite(usedType: UsedType): UsedType {
        val target = targetByBinding[usedType.name]
        val genericTypes = usedType.genericTypes.map { rewrite(it) }
        return usedType.copy(name = target?.withDots() ?: usedType.name, genericTypes = genericTypes)
    }

    private fun defaultOf(moduleFile: File, module: Path): Path? {
        if (moduleFile.name.endsWith(VUE_ENDING)) return module
        return ModuleExports.of(analysisRoot).defaultNameOf(moduleFile)?.let { module + it }
    }

    companion object {
        private const val VUE_ENDING = ".vue"
    }
}

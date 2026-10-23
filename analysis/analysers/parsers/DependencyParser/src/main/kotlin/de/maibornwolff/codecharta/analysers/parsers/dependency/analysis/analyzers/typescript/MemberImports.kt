package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import java.io.File

/**
 * The imports of one file that name a member of a project module, by "What an import binds" of
 * `docs/name-resolution/typescript.md`: `import D from './m'` binds `D` to the default export of `m`, `import { A }` to
 * the declaration `m` exports as `A`, so a use is written as the full path of that declaration where it is not the
 * module path plus the imported name.
 */
internal class MemberImports(private val analysisRoot: File) {
    private val targetByBinding = HashMap<String, Path>()

    /** The declaration a member import of [moduleFile] means, null where it is the module path plus the imported name. */
    fun targetOf(import: ImportDeclaration, moduleFile: File, module: Path): Path? {
        if (!ImportedModules.namesMember(import)) return null
        val importedName = import.path.lastOrNull() ?: return null
        if (importedName == TSE_DEFAULT_EXPORT_NAME) {
            val target = defaultOf(moduleFile, module) ?: return null
            import.bindingName?.let { targetByBinding[it] = target }
            return target
        }
        val ownName = ModuleExports.of(analysisRoot).nameOf(moduleFile, importedName)
        if (ownName == importedName) return null
        // The extractor writes a use of a renamed import under the imported name, `Model` for `import { Model as Base }`
        return (module + ownName).also { targetByBinding[importedName] = it }
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

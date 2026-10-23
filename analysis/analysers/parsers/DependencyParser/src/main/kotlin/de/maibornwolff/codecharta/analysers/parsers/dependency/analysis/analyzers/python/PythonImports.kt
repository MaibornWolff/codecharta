package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind

/**
 * The imports of one Python file, resolved against the module path of that file.
 *
 * A module path means the modules [PythonModules] finds for it. Without them, or for a module they do not hold, a name
 * imported from it can be defined in the module file or in the `__init__.py` of a package of that name, so such an
 * import is a dependency on both.
 *
 * @property memberDependencies the names imported with `from module import name`, or the submodules of that name
 * @property wildcardDependencies the modules imported with `from module import *`
 * @property reexports the name each `from module import name [as alias]` binds to what it imports, which an
 *   `__init__.py` re-exports
 * @property aliasedMembers alias to the name it stands for, for `from module import name as alias`
 */
internal class PythonImports private constructor(
    val memberDependencies: List<Dependency>,
    val wildcardDependencies: List<Dependency>,
    val reexports: Map<String, ImportedName>,
    val aliasedMembers: Map<String, ImportedName>,
    private val importedModules: Map<String, ModuleReference>,
    private val importedNames: Map<String, ModuleReference>,
    private val candidates: ModuleCandidates
) {
    /** The module an import statement binds to a name: `import a.b` binds `a.b`, `import a.b as m` binds `m`. */
    fun moduleImportedAs(dottedName: String): ModuleReference? = importedModules[dottedName]

    /** The module a name may stand for: the module an import statement binds, else the submodule `from a import b` binds. */
    fun moduleBoundTo(dottedName: String): ModuleReference? = importedModules[dottedName] ?: importedNames[dottedName]

    /** The paths the name [name] of the module [module] can have, the likeliest first. */
    fun pathsIn(module: ModuleReference, name: List<String>): List<List<String>> = candidates.of(module).map { it + name }

    /** The dependencies on the name [name] of the module [module], or on its submodule of that name. */
    fun dependenciesOn(module: ModuleReference, name: List<String>): List<Dependency> =
        pathsIn(module, name).map { Dependency(Path(it)) } + candidates.found(module.submodule(name)).map { Dependency(Path(it)) }

    companion object {
        private const val SEGMENT_SEPARATOR = "."

        fun of(imports: List<ImportDeclaration>, modulePath: List<String>, modules: PythonModules?): PythonImports {
            val (memberImports, moduleImports) = imports.partition { it.kind == ImportKind.MEMBER }
            val (wildcards, members) = memberImports.mapNotNull { MemberImport.of(it, modulePath) }.partition { it.isWildcard }
            val candidates = ModuleCandidates(modules, modulePath.dropLast(1))
            val plainMembers = members.filter { it.alias == null }
            return PythonImports(
                memberDependencies = plainMembers.flatMap { member ->
                    candidates.of(member.module).map { Dependency(Path(it + member.name)) } +
                        candidates.found(member.module.submodule(member.name)).map { Dependency(Path(it)) }
                },
                wildcardDependencies = wildcards.flatMap { wildcard -> candidates.of(wildcard.module).map { Dependency.asWildcard(it) } },
                reexports = members.associate { (it.alias ?: it.name.last()) to ImportedName(it.module, it.name) },
                aliasedMembers = members
                    .mapNotNull { member ->
                        member.alias?.let { it to ImportedName(member.module, member.name) }
                    }.toMap(),
                importedModules = moduleImports.associate { import ->
                    (import.bindingName ?: import.path.joinToString(SEGMENT_SEPARATOR)) to ModuleReference(import.path)
                },
                importedNames = members.associate { (it.alias ?: it.name.joinToString(SEGMENT_SEPARATOR)) to it.module.submodule(it.name) },
                candidates = candidates
            )
        }
    }
}

/** The name [name] of the module [module]. */
internal data class ImportedName(val module: ModuleReference, val name: List<String>)

private class MemberImport(val module: ModuleReference, val name: List<String>, val alias: String?, val isWildcard: Boolean) {
    companion object {
        private const val RELATIVE_LEVEL = "."
        private const val SEGMENT_SEPARATOR = "."

        fun of(import: ImportDeclaration, modulePath: List<String>): MemberImport? {
            val modulePart = if (import.isWildcard) import.path else import.path.dropLast(1)
            val module = moduleOf(modulePart, modulePath) ?: return null
            // The extractor leaves the imported name one segment, whatever dots it holds
            val name = if (import.isWildcard) emptyList() else import.path.last().split(SEGMENT_SEPARATOR)
            return MemberImport(module, name, import.bindingName, import.isWildcard)
        }

        // One leading dot is the package of the file, every further one its parent. An import that reaches the
        // root of the analysed tree or beyond is dropped
        private fun moduleOf(importPath: List<String>, modulePath: List<String>): ModuleReference? {
            val levels = importPath.takeWhile { it == RELATIVE_LEVEL }.size
            if (levels == 0) return ModuleReference(importPath)
            val packagePath = modulePath.dropLast(levels)
            if (packagePath.isEmpty()) return null
            return ModuleReference(packagePath + importPath.drop(levels), isRelative = true)
        }
    }
}

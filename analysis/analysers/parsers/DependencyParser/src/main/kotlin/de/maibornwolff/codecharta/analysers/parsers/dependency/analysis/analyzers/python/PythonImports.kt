package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind

/**
 * The imports of one Python file, resolved against the module path of that file.
 *
 * A name imported from a module can be defined in the module file or in the `__init__.py` of a package of that
 * name, so every such import is a dependency on both.
 *
 * @property memberDependencies the names imported with `from module import name`
 * @property wildcardDependencies the modules imported with `from module import *`
 * @property aliasedMembers alias to the path of the name it stands for, for `from module import name as alias`
 * @property modules the dotted names imported with `import module`
 * @property aliasedModules alias to the path of the module it stands for, for `import module as alias`
 */
class PythonImports private constructor(
    val memberDependencies: List<Dependency>,
    val wildcardDependencies: List<Dependency>,
    val aliasedMembers: Map<String, List<String>>,
    val modules: Set<String>,
    val aliasedModules: Map<String, List<String>>
) {
    companion object {
        const val PACKAGE_FILE = "__init__"
        private const val PARENT_LEVEL = "."
        private const val SEGMENT_SEPARATOR = "."

        fun of(imports: List<ImportDeclaration>, modulePath: List<String>): PythonImports {
            val (memberImports, moduleImports) = imports.partition { it.kind == ImportKind.MEMBER }
            val resolvedMemberImports = memberImports.mapNotNull { import ->
                resolveAgainst(modulePath, import.path)?.let { import.copy(path = it) }
            }
            val (wildcards, members) = resolvedMemberImports.partition { it.isWildcard }
            val (aliasedMembers, plainMembers) = members.partition { it.bindingName != null }
            val (aliasedModules, plainModules) = moduleImports.partition { it.bindingName != null }
            return PythonImports(
                memberDependencies = plainMembers.flatMap { inModuleOrPackage(it.path.dropLast(1), segmentsOf(it.path.last())) },
                wildcardDependencies = wildcards.flatMap {
                    listOf(
                        Dependency.asWildcard(it.path),
                        Dependency.asWildcard(
                            it.path + PACKAGE_FILE
                        )
                    )
                },
                aliasedMembers = aliasedMembers.associate { it.bindingName!! to it.path.dropLast(1) + segmentsOf(it.path.last()) },
                modules = plainModules.map { it.path.joinToString(SEGMENT_SEPARATOR) }.toSet(),
                aliasedModules = aliasedModules.associate { it.bindingName!! to it.path }
            )
        }

        fun inModuleOrPackage(module: List<String>, name: List<String>): List<Dependency> =
            listOf(Dependency(Path(module + name)), Dependency(Path(module + PACKAGE_FILE + name)))

        // One leading dot is the package of the file, every further one its parent. A relative import that
        // leaves the analysed tree cannot be resolved
        private fun resolveAgainst(modulePath: List<String>, importPath: List<String>): List<String>? {
            val levels = importPath.takeWhile { it == PARENT_LEVEL }.size
            if (levels == 0) return importPath
            val packagePath = modulePath.dropLast(levels)
            if (packagePath.isEmpty()) return null
            return packagePath + importPath.drop(levels)
        }

        private fun segmentsOf(dottedName: String): List<String> = dottedName.split(SEGMENT_SEPARATOR)
    }
}

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
 * @property boundMembers the name each `from module import name [as alias]` binds to the path of the name it stands for
 * @property modules the dotted names imported with `import module`
 * @property aliasedModules alias to the path of the module it stands for, for `import module as alias`
 */
class PythonImports private constructor(
    val memberDependencies: List<Dependency>,
    val wildcardDependencies: List<Dependency>,
    val aliasedMembers: Map<String, List<String>>,
    val boundMembers: Map<String, List<String>>,
    val modules: Set<String>,
    val aliasedModules: Map<String, List<String>>
) {
    companion object {
        const val PACKAGE_FILE = "__init__"
        private const val RELATIVE_LEVEL = "."
        private const val SEGMENT_SEPARATOR = "."

        fun of(imports: List<ImportDeclaration>, modulePath: List<String>): PythonImports {
            val (memberImports, moduleImports) = imports.partition { it.kind == ImportKind.MEMBER }
            val resolvedMemberImports = memberImports.mapNotNull { import ->
                resolveAgainst(modulePath, import.path)?.let { import.copy(path = it) }
            }
            val (wildcards, members) = resolvedMemberImports.partition { it.isWildcard }
            return PythonImports(
                memberDependencies = members.filter { it.bindingName == null }.flatMap { inModuleOrPackage(moduleOf(it), nameOf(it)) },
                wildcardDependencies = wildcards.flatMap { wildcardOnModuleOrPackage(it.path) },
                aliasedMembers = pathsByAlias(members) { moduleOf(it) + nameOf(it) },
                boundMembers = members.associate { (it.bindingName ?: it.path.last()) to moduleOf(it) + nameOf(it) },
                modules = moduleImports.filter { it.bindingName == null }.map { it.path.joinToString(SEGMENT_SEPARATOR) }.toSet(),
                aliasedModules = pathsByAlias(moduleImports) { it.path }
            )
        }

        fun inModuleOrPackage(module: List<String>, name: List<String>): List<Dependency> =
            pathsInModuleOrPackage(module, name).map { Dependency(Path(it)) }

        fun pathsInModuleOrPackage(module: List<String>, name: List<String>): List<List<String>> =
            listOf(module + name, module + PACKAGE_FILE + name)

        private fun wildcardOnModuleOrPackage(module: List<String>): List<Dependency> =
            listOf(Dependency.asWildcard(module), Dependency.asWildcard(module + PACKAGE_FILE))

        private fun pathsByAlias(imports: List<ImportDeclaration>, pathOf: (ImportDeclaration) -> List<String>): Map<String, List<String>> =
            imports.mapNotNull { import -> import.bindingName?.let { alias -> alias to pathOf(import) } }.toMap()

        private fun moduleOf(memberImport: ImportDeclaration): List<String> = memberImport.path.dropLast(1)

        // The extractor leaves the imported name one segment, whatever dots it holds
        private fun nameOf(memberImport: ImportDeclaration): List<String> = memberImport.path.last().split(SEGMENT_SEPARATOR)

        // One leading dot is the package of the file, every further one its parent. An import that reaches the
        // root of the analysed tree or beyond is dropped
        private fun resolveAgainst(modulePath: List<String>, importPath: List<String>): List<String>? {
            val levels = importPath.takeWhile { it == RELATIVE_LEVEL }.size
            if (levels == 0) return importPath
            val packagePath = modulePath.dropLast(levels)
            if (packagePath.isEmpty()) return null
            return packagePath + importPath.drop(levels)
        }
    }
}

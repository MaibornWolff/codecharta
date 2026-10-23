package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.python

import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind

/** The name each `from module import name [as alias]` of a file binds, which a package's `__init__.py` re-exports. */
internal object PythonImports {
    fun reexportsOf(imports: List<ImportDeclaration>, modulePath: List<String>): Map<String, ImportedName> = imports
        .filter { it.kind == ImportKind.MEMBER && !it.isWildcard }
        .mapNotNull { import ->
            ModuleReference.of(import.path.dropLast(1), modulePath)?.let { module ->
                (import.bindingName ?: import.path.last()) to ImportedName(module, import.path.last())
            }
        }.toMap()
}

/** The name [name] of the module [module]. */
internal data class ImportedName(val module: ModuleReference, val name: String)

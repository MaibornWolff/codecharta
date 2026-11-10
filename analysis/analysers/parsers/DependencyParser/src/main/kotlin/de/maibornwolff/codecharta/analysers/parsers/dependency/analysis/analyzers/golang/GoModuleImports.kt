package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.codecharta.model.ExternalImport
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration

/**
 * The Go packages of other modules a file imports, by their whole import path, which begins with the path of the
 * module that holds them. A path whose first segment has no dot is the standard library's (or cgo's `C`), and a
 * package the project holds is the project's own.
 */
internal class GoModuleImports(private val isProjectPackage: (ImportDeclaration) -> Boolean) {
    fun of(imports: List<ImportDeclaration>): Set<ExternalImport> = imports
        .filterNot(isProjectPackage)
        .map { import -> import.path.filter { it.isNotEmpty() } }
        .filter { path -> path.isNotEmpty() && '.' in path.first() }
        .map { ExternalImport(ECOSYSTEM, it.joinToString(SEPARATOR)) }
        .toSet()

    companion object {
        private const val ECOSYSTEM = "golang"
        private const val SEPARATOR = "/"
    }
}

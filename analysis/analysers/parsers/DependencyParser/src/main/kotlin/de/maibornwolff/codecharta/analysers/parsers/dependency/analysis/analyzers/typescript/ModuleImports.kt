package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.defaultImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration

/**
 * The imports of one module file that name a project module, by "Module specifiers" and "What an import binds" of
 * `docs/name-resolution/typescript.md`: the dependency each draws, the modules `export *` re-exports, and the uses of
 * the names they bind written as the full path of what they name.
 */
internal class ModuleImports(private val fileInfo: FileInfo) {
    /** What the module's `export * from` re-exports; null without an analysis root to read the source modules below. */
    val starExports = fileInfo.analysisRoot?.let { StarExports(it) }
    private val memberImports = fileInfo.analysisRoot?.let { MemberImports(it) }

    /** The dependency an import of a project module draws; null for a library or a specifier that names no project file. */
    fun dependencyOf(import: ImportDeclaration): Dependency? {
        val analysisRoot = fileInfo.analysisRoot ?: return null
        val moduleFile = ImportedModules.fileOf(import, fileInfo) ?: return null
        val module = ImportedModules.logicalPathOf(moduleFile, analysisRoot)
        starExports?.remember(import, moduleFile)
        memberImports?.targetOf(import, moduleFile, module)?.let { return Dependency(path = it) }
        val importedName = if (ImportedModules.namesMember(import)) listOf(import.defaultImportPath().last()) else emptyList()
        return Dependency(path = Path(module.parts + importedName), isWildcard = import.isWildcard)
    }

    /** Binds the name an import of no project file binds to the [path] its dependency is written as. */
    fun bindOutsideProject(import: ImportDeclaration, path: Path) {
        memberImports?.bindOutsideProject(import, path)
    }

    /** The nodes with each use of an imported binding written as the full path of what it names. */
    fun rewrite(nodes: List<Node>): List<Node> = memberImports?.rewrite(nodes) ?: nodes
}

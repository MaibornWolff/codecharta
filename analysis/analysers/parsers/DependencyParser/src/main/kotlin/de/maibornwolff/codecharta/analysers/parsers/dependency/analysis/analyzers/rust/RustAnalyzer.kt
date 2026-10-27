package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * A `.rs` file's module path is the one the module tree gives it (`rust.md`, "Modules"), prefixed to the inline `mod`
 * chain of each declaration; it starts with the crate name.
 *
 * A `pub use module::Type` becomes a [NodeType.REEXPORT] carrier at `crate::Type`, because a crate flattens its
 * public API at `lib.rs` and consumers import the short path. The dependency resolver folds it into an alias.
 */
class RustAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val file = RustProject.segmentsOf(fileInfo.physicalPath)

    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.RUST)
        val project =
            fileInfo.analysisRoot?.let { RustProject.of(it, fileInfo.analysedFiles) } ?: RustProject.ofSingleFile(file, fileInfo.content)
        val fileScope = project.tree.scopeOf(file)
        val crateRoot = fileScope?.crateRootPath.orEmpty()
        val fileModulePath = fileScope?.path.orEmpty()

        val (reexportImports, regularImports) = result.imports.partition { it.kind == ImportKind.REEXPORT }
        val isEdition2015 = (fileScope?.crate?.edition ?: RustCrate.EDITION_2021) < RustCrate.EDITION_2018
        val imports = regularImports.flatMap { import ->
            importPaths(
                import.path,
                fileModulePath,
                crateRoot,
                isEdition2015
            ).map { Dependency(path = Path(it), isWildcard = import.isWildcard) }
        }

        val declarationNodes = result.declarations.map { declaration ->
            toNode(declaration, imports, fileModulePath, crateRoot)
        }
        val reexportNodes = reexportImports.mapNotNull { toReexportNode(it, fileModulePath, crateRoot) }
        return FileReport(declarationNodes + reexportNodes)
    }

    // In edition 2015 a `use` path starts at the crate root, where `extern crate` puts the other crates too
    private fun importPaths(
        path: List<String>,
        fileModulePath: List<String>,
        crateRoot: List<String>,
        isEdition2015: Boolean
    ): List<List<String>> {
        val normalized = normalizePath(path, fileModulePath, crateRoot)
        return if (isEdition2015 && normalized == path) listOf(crateRoot + path, path) else listOf(normalized)
    }

    private fun toReexportNode(import: ImportDeclaration, fileModulePath: List<String>, crateRoot: List<String>): Node? {
        // Expanding `pub use foo::*` needs the contents of the re-exported module, which lie in another file
        if (import.isWildcard) return null
        val name = import.bindingName ?: import.path.lastOrNull() ?: return null
        val target = reexportTarget(import.path, fileModulePath, crateRoot)
        if (target.isEmpty()) return null
        return Node(
            pathWithName = Path(fileModulePath + name),
            physicalPath = fileInfo.physicalPath,
            nodeType = NodeType.REEXPORT,
            language = SupportedLanguage.RUST,
            dependencies = setOf(Dependency(path = Path(target))),
            usedTypes = setOf(Type.simple(name))
        )
    }

    // A bare leading segment is a crate-local module: `pub use workshop::Workshop` in crate `domain` re-exports
    // `domain::workshop::Workshop`
    private fun reexportTarget(path: List<String>, fileModulePath: List<String>, crateRoot: List<String>): List<String> {
        if (path.isEmpty()) return emptyList()
        return when (path.first()) {
            CRATE, SELF, SUPER -> normalizePath(path, fileModulePath, crateRoot)
            else -> crateRoot + path
        }
    }

    private fun toNode(declaration: Declaration, imports: List<Dependency>, fileModulePath: List<String>, crateRoot: List<String>): Node {
        val nodePath = fileModulePath + declaration.parentPath
        return Node(
            pathWithName = Path(nodePath + declaration.name),
            physicalPath = fileInfo.physicalPath,
            nodeType = declaration.type.toNodeType(),
            language = SupportedLanguage.RUST,
            dependencies = buildDependencies(declaration, imports, fileModulePath, crateRoot, nodePath),
            usedTypes = declaration.usedTypes.map { it.toType() }.toSet()
        )
    }

    private fun buildDependencies(
        declaration: Declaration,
        imports: List<Dependency>,
        fileModulePath: List<String>,
        crateRoot: List<String>,
        nodePath: List<String>
    ): Set<Dependency> {
        val selfWildcard = Dependency.asWildcard(nodePath)
        val namespacePrefixWildcards = declaration.usedTypes
            .flatMap { it.collectNamespacePrefixes() }
            .map { Dependency.asWildcard(normalizePath(it, fileModulePath, crateRoot)) }
        return (imports + selfWildcard + namespacePrefixWildcards).toSet()
    }

    private fun UsedType.collectNamespacePrefixes(): List<List<String>> {
        val own = if (namespacePrefix.isEmpty()) emptyList() else listOf(namespacePrefix)
        return own + genericTypes.flatMap { it.collectNamespacePrefixes() }
    }

    // A path starting with another crate's name is already crate-rooted and stays as it is
    private fun normalizePath(path: List<String>, fileModulePath: List<String>, crateRoot: List<String>): List<String> {
        if (path.isEmpty()) return path
        return when (path.first()) {
            CRATE -> crateRoot + path.drop(1)
            SELF -> fileModulePath + path.drop(1)
            SUPER -> normalizeSuperPath(path, fileModulePath)
            else -> path
        }
    }

    private fun normalizeSuperPath(path: List<String>, fileModulePath: List<String>): List<String> {
        var base = fileModulePath
        var index = 0
        while (index < path.size && path[index] == SUPER) {
            base = base.dropLast(1)
            index++
        }
        return base + path.drop(index)
    }

    companion object {
        private const val CRATE = "crate"
        private const val SELF = "self"
        private const val SUPER = "super"
    }
}

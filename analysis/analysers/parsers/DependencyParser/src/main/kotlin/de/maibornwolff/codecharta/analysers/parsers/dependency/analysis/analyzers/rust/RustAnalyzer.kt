package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toNodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.common.splitNameToParts
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
 * A `.rs` file's module path is not written in its source but follows from where the file lies, so it is derived
 * from the physical path and prefixed to the inline `mod` chain of each declaration.
 *
 * A `pub use module::Type` becomes a [NodeType.REEXPORT] carrier at `crate::Type`, because a crate flattens its
 * public API at `lib.rs` and consumers import the short path. The dependency resolver folds it into an alias.
 */
class RustAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.RUST)
        val crateRoot = deriveCrateRoot(fileInfo.physicalPath)
        val fileModulePath = crateRoot + deriveInCrateModulePath(fileInfo.physicalPath)

        val (reexportImports, regularImports) = result.imports.partition { it.kind == ImportKind.REEXPORT }
        val imports = regularImports.map {
            Dependency(path = Path(normalizePath(it.path, fileModulePath, crateRoot)), isWildcard = it.isWildcard)
        }

        val declarationNodes = result.declarations.map { declaration ->
            toNode(declaration, imports, fileModulePath, crateRoot)
        }
        val reexportNodes = reexportImports.mapNotNull { toReexportNode(it, fileModulePath, crateRoot) }
        return FileReport(declarationNodes + reexportNodes)
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

    // Node paths carry the crate name, `crates/domain/src/workshop.rs` → `[domain]`, because a Rust path is always
    // rooted at a crate and cross-crate imports like `use domain::workshop::Workshop` must match them
    private fun deriveCrateRoot(physicalPath: String): List<String> {
        val parts = splitNameToParts(physicalPath).filter { it != CURRENT_DIR }
        val srcIndex = parts.lastIndexOf(SRC_DIR)
        return if (srcIndex > 0) listOf(parts[srcIndex - 1]) else emptyList()
    }

    // Rust 2018: `mod.rs` marks a directory module at any depth, while `lib.rs` and `main.rs` are the crate root
    // only directly below `src` and an ordinary module anywhere else
    private fun deriveInCrateModulePath(physicalPath: String): List<String> {
        val parts = splitNameToParts(physicalPath).filter { it != CURRENT_DIR }
        val relativeParts = stripToCrateRoot(parts)
        if (relativeParts.isEmpty()) return emptyList()

        val fileName = relativeParts.last()
        val directories = relativeParts.dropLast(1)
        return when {
            fileName == MOD_FILE -> directories
            fileName in CRATE_ROOT_FILES && directories.isEmpty() -> emptyList()
            else -> directories + fileName.removeSuffix(RUST_EXTENSION)
        }
    }

    private fun stripToCrateRoot(parts: List<String>): List<String> {
        val srcIndex = parts.lastIndexOf(SRC_DIR)
        return if (srcIndex in 0 until parts.lastIndex) parts.drop(srcIndex + 1) else parts
    }

    companion object {
        private const val CRATE = "crate"
        private const val SELF = "self"
        private const val SUPER = "super"
        private const val SRC_DIR = "src"
        private const val CURRENT_DIR = "."
        private const val RUST_EXTENSION = ".rs"
        private const val MOD_FILE = "mod.rs"
        private val CRATE_ROOT_FILES = setOf("lib.rs", "main.rs")
    }
}

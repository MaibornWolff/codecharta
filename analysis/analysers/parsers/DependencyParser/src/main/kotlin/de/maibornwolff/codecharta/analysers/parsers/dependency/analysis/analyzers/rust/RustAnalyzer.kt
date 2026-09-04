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
 * Class-2 (multi-namespace) analyzer for Rust, modeled on [csharp.CSharpAnalyzer] but with a
 * Rust-specific twist: a `.rs` file's module path from the crate root is filesystem-derived (not
 * visible in the source TSE sees), so it is reconstructed here from [FileInfo.physicalPath] and
 * prepended to TSE's in-file inline-`mod` chain ([Declaration.parentPath]).
 *
 * Imports keep TSE's verbatim leading `crate`/`self`/`super` segments; those are normalized here
 * against the file module path. `namespacePrefix` on qualified inline used types yields a synthetic
 * wildcard dependency per [cpp.CppAnalyzer].
 *
 * `pub use module::Type` re-exports (tagged [ImportKind.REEXPORT] by TSE) become [NodeType.REEXPORT]
 * carrier nodes `crate::Type` → `crate::module::Type`: a crate flattens its public API at `lib.rs`, so
 * consumers import the short `crate::Type` path. The resolver
 * ([processing.dependencies.DependencyResolverService]) folds each carrier into an alias on the real
 * definition node and drops the carrier, so a consumer's `crate::Type` reference resolves straight to
 * `crate::module::Type`.
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

    /**
     * A `pub use module::Type` becomes a forwarding node at `crate::Type` (the path consumers use)
     * that depends on the real definition `crate::module::Type`. Glob re-exports (`pub use foo::*`)
     * are skipped — expanding them needs the re-exported module's contents (cross-file).
     */
    private fun toReexportNode(import: ImportDeclaration, fileModulePath: List<String>, crateRoot: List<String>): Node? {
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

    /**
     * The crate-rooted path a re-export points at. `crate`/`self`/`super` are normalized as usual;
     * a bare leading segment is a crate-local module (the idiomatic `lib.rs` case, e.g.
     * `pub use workshop::Workshop` in crate `domain` → `domain::workshop::Workshop`).
     */
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

    /**
     * Resolves a path's leading `crate`/`self`/`super` segments against the file's module path:
     * `crate` → the crate root (the crate-name prefix), `self` → the file module, each `super`
     * strips one trailing segment. Paths starting with another crate name (`domain::…`,
     * cross-crate) or a `use`-bound name are left untouched — they are already crate-rooted, which
     * is exactly why node paths must also carry the crate name (see [deriveCrateRoot]) so the two
     * sides match during resolution.
     */
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

    /**
     * The crate-name prefix for node paths: the directory immediately before the last `src`
     * (`.../crates/domain/src/workshop.rs` → `[domain]`). Empty when there is no enclosing crate
     * directory (e.g. a bare `src/lib.rs` in tests, or a loose file). Including the crate name is
     * what lets cross-crate imports (`use domain::workshop::Workshop`) resolve to the right node,
     * since a Rust path is always rooted at a crate.
     */
    private fun deriveCrateRoot(physicalPath: String): List<String> {
        val parts = splitNameToParts(physicalPath).filter { it != CURRENT_DIR }
        val srcIndex = parts.lastIndexOf(SRC_DIR)
        return if (srcIndex > 0) listOf(parts[srcIndex - 1]) else emptyList()
    }

    /**
     * The in-crate module path from a physical path using Rust 2018 rules: taken relative to the
     * last `src` directory. `mod.rs` is a directory-module marker at any depth (`src/foo/mod.rs` →
     * `[foo]`); `lib.rs`/`main.rs` are crate roots only at the crate root (`src/lib.rs` → `[]`) and
     * otherwise behave like any file (`src/foo/lib.rs` → `[foo, lib]`); every other file becomes the
     * final module segment (`src/foo/bar.rs` → `[foo, bar]`). The crate name is added separately by
     * [deriveCrateRoot].
     */
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

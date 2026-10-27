package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.treesitter.excavationsite.api.RustModDeclaration
import de.maibornwolff.treesitter.excavationsite.api.RustModule

/**
 * The module tree the compiler builds (`rust.md`, "Modules", decision 2): from each crate root along the `mod`
 * declarations, `#[path]` included; a file that two crates load belongs to the first (decision 12), and a file no `mod`
 * reaches keeps the module path of the file system. Every module of a file, inline ones included, is a
 * [RustModuleScope].
 */
internal class RustModuleTree(
    private val crates: RustCrates,
    private val rustFiles: Set<List<String>>,
    private val factsOf: (List<String>) -> RustModule
) {
    private val scopesByFile = LinkedHashMap<List<String>, MutableMap<List<String>, RustModuleScope>>()

    init {
        crates.crates.filter { it.rootFile !in scopesByFile }.forEach { crate ->
            val path = listOfNotNull(crate.name.takeIf { it.isNotEmpty() })
            load(RustModuleScope(path, crate, path, crate.rootFile, emptyList(), crate.rootFile.dropLast(1)))
        }
        rustFiles.sortedBy { it.joinToString(SEPARATOR) }.filter { it !in scopesByFile }.forEach { load(unreachedScope(it)) }
    }

    /** The module a file's top level is, or one of the inline modules in it by their chain. */
    fun scopeOf(file: List<String>, inlinePath: List<String> = emptyList()): RustModuleScope? = scopesByFile[file]?.get(inlinePath)

    private fun load(fileScope: RustModuleScope) {
        val facts = factsOf(fileScope.file)
        val scopes = linkedMapOf(emptyList<String>() to fileScope)
        scopesByFile[fileScope.file] = scopes
        facts.modDeclarations.filter { it.isInline }.sortedBy { it.inlinePath.size }.forEach { declaration ->
            val parent = scopes[declaration.inlinePath] ?: return@forEach
            scopes[declaration.inlinePath + declaration.name] = RustModuleScope(
                parent.path + declaration.name,
                parent.crate,
                parent.crateRootPath,
                parent.file,
                declaration.inlinePath + declaration.name,
                parent.childFolder + declaration.name
            )
        }
        facts.modDeclarations.filterNot { it.isInline }.forEach { declaration ->
            val parent = scopes[declaration.inlinePath] ?: return@forEach
            val file = fileOf(declaration, parent) ?: return@forEach
            if (file !in scopesByFile) load(fileModule(declaration, parent, file))
        }
    }

    // A `mod.rs` and a file `#[path]` loads own their folder, any other `a.rs` the folder `a/` next to it
    private fun fileModule(declaration: RustModDeclaration, parent: RustModuleScope, file: List<String>): RustModuleScope {
        val ownsFolder = file.last() == RustCrates.MOD_FILE || declaration.pathAttribute != null
        val childFolder = if (ownsFolder) file.dropLast(1) else file.dropLast(1) + file.last().removeSuffix(RustCrates.RUST_SUFFIX)
        return RustModuleScope(parent.path + declaration.name, parent.crate, parent.crateRootPath, file, emptyList(), childFolder)
    }

    // `#[path]` is relative to the declaring file's folder, inside an inline module to the folder that module stands for
    private fun fileOf(declaration: RustModDeclaration, parent: RustModuleScope): List<String>? {
        val pathAttribute = declaration.pathAttribute
        if (pathAttribute != null) {
            val base = if (declaration.inlinePath.isEmpty()) parent.file.dropLast(1) else parent.childFolder
            return normalized(base + pathAttribute.split(SEPARATOR, BACKSLASH)).takeIf { it in rustFiles }
        }
        return listOf(
            parent.childFolder + (declaration.name + RustCrates.RUST_SUFFIX),
            parent.childFolder + listOf(declaration.name, RustCrates.MOD_FILE)
        ).firstOrNull { it in rustFiles }
    }

    private fun normalized(segments: List<String>): List<String> {
        val result = ArrayDeque<String>()
        segments.filter { it.isNotEmpty() && it != CURRENT_FOLDER }.forEach {
            if (it ==
                PARENT_FOLDER
            ) {
                result.removeLastOrNull()
            } else {
                result.addLast(it)
            }
        }
        return result.toList()
    }

    // The folders below `src` and the file's name, as the file system lays the modules out
    private fun unreachedScope(file: List<String>): RustModuleScope {
        val crate = crateOf(file)
        val sourceIndex = file.dropLast(1).lastIndexOf(RustCrates.SOURCE_FOLDER)
        val inCrate = if (sourceIndex >= 0) file.drop(sourceIndex + 1) else file
        val fileName = inCrate.last()
        val folders = inCrate.dropLast(1)
        val modules = when {
            fileName == RustCrates.MOD_FILE -> folders
            fileName in RustCrates.CRATE_ROOT_FILES && folders.isEmpty() -> emptyList()
            else -> folders + fileName.removeSuffix(RustCrates.RUST_SUFFIX)
        }
        val rootPath = listOfNotNull(crate.name.takeIf { it.isNotEmpty() })
        return RustModuleScope(rootPath + modules, crate, rootPath, file, emptyList(), file.dropLast(1))
    }

    // The crate of the file's package, else one named after the folder that holds `src`
    private fun crateOf(file: List<String>): RustCrate {
        val ownPackage = crates.packageOf(file)
        ownPackage?.crates?.firstOrNull()?.let { return it }
        val sourceIndex = file.dropLast(1).lastIndexOf(RustCrates.SOURCE_FOLDER)
        val name = ownPackage?.name?.let { RustCrates.crateNameOf(it) } ?: file.getOrNull(sourceIndex - 1).orEmpty()
        val edition = if (ownPackage != null) RustCrate.EDITION_2015 else RustCrate.EDITION_2021
        return RustCrate(name, file, CargoTargetKind.LIBRARY, edition, ownPackage?.folder)
    }

    companion object {
        private const val SEPARATOR = "/"
        private const val BACKSLASH = "\\"
        private const val CURRENT_FOLDER = "."
        private const val PARENT_FOLDER = ".."
    }
}

package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.treesitter.excavationsite.api.RustExternCrate
import de.maibornwolff.treesitter.excavationsite.api.RustItemKind
import de.maibornwolff.treesitter.excavationsite.api.RustModDeclaration
import de.maibornwolff.treesitter.excavationsite.api.RustModule

/**
 * The module tree the compiler builds (`rust.md`, "Modules", decision 2): from each crate root along the `mod`
 * declarations, `#[path]` included; a file that two crates load belongs to the first (decision 12), and a file no `mod`
 * reaches keeps the module path of the file system. Every module of a file, inline ones included, is a
 * [RustModuleScope] holding what it declares, imports and re-exports; test code binds nothing in a run without tests
 * (decision 6).
 */
internal class RustModuleTree(
    private val crates: RustCrates,
    private val rustFiles: Set<List<String>>,
    private val includesTests: Boolean = true,
    private val factsOf: (List<String>) -> RustModule
) {
    private val scopesByFile = LinkedHashMap<List<String>, MutableMap<List<String>, RustModuleScope>>()
    private val scopesByPath = LinkedHashMap<List<String>, RustModuleScope>()
    private val crateRoots = LinkedHashMap<RustCrate, RustModuleScope>()

    init {
        crates.crates.filter { it.rootFile !in scopesByFile }.forEach { crate ->
            val path = listOfNotNull(crate.name.takeIf { it.isNotEmpty() })
            val root = RustModuleScope(path, crate, path, crate.rootFile, emptyList(), null, crate.rootFile.dropLast(1))
            crateRoots[crate] = root
            load(root)
        }
        rustFiles.sortedBy { it.joinToString(SEPARATOR) }.filter { it !in scopesByFile }.forEach { load(unreachedScope(it)) }
    }

    /** The module a file's top level is, or one of the inline modules in it by their chain. */
    fun scopeOf(file: List<String>, inlinePath: List<String> = emptyList()): RustModuleScope? = scopesByFile[file]?.get(inlinePath)

    /** The module of a logical path, the first loaded of several. */
    fun scopeAt(path: List<String>): RustModuleScope? = scopesByPath[path]

    fun rootOf(crate: RustCrate): RustModuleScope? = crateRoots[crate]

    /** The `extern crate` declarations of a crate's root module. */
    fun externCratesOf(root: RustModuleScope): List<RustExternCrate> = factsOf(root.file).externCrates.filter {
        it.inlinePath ==
            root.inlinePath
    }

    /** The `macro_rules!` in textual scope at [offset] of [scope]'s file, the latest last (`rust.md`, "Macros"). */
    fun textualMacrosAt(scope: RustModuleScope, offset: Int): List<MacroBinding> {
        val facts = factsOf(scope.file)
        val enclosing = (0..scope.inlinePath.size).mapTo(HashSet()) { scope.inlinePath.take(it) }
        val defined = facts.items
            .filter { it.kind == RustItemKind.MACRO && it.inlinePath in enclosing && it.offset < offset && isCounted(scope, it.isTest) }
            .map { it.offset to MacroBinding(it.name, (scopeOf(scope.file, it.inlinePath)?.path ?: scope.path) + it.name) }
        val fromMacroUse = facts.modDeclarations
            .filter { it.isMacroUse && it.inlinePath in enclosing && it.offset < offset }
            .flatMap { declaration -> macrosOfModule(scope.file, declaration).map { declaration.offset to it } }
        val fileTop = scopeOf(scope.file) ?: scope
        return fileTop.inheritedMacros + (defined + fromMacroUse).sortedBy { it.first }.map { it.second }
    }

    // `#[macro_use] mod m;` keeps the macros `m` defines in scope after it
    private fun macrosOfModule(file: List<String>, declaration: RustModDeclaration): List<MacroBinding> {
        val module = scopeOf(file, declaration.inlinePath)?.modules?.get(declaration.name) ?: return emptyList()
        val inherited = (scopeOf(module.file) ?: module).inheritedMacros.toSet()
        return textualMacrosAt(module, Int.MAX_VALUE).filter { it !in inherited }
    }

    private fun load(fileScope: RustModuleScope) {
        val facts = factsOf(fileScope.file)
        val scopes = linkedMapOf(emptyList<String>() to fileScope)
        register(fileScope, scopes)
        facts.modDeclarations.filter { it.isInline }.sortedBy { it.inlinePath.size }.forEach { declaration ->
            val parent = scopes[declaration.inlinePath] ?: return@forEach
            val child = RustModuleScope(
                parent.pathOf(declaration.name),
                parent.crate,
                parent.crateRootPath,
                parent.file,
                declaration.inlinePath + declaration.name,
                parent,
                parent.childFolder + declaration.name,
                textualMacrosAt(parent, declaration.offset),
                parent.isTest || declaration.isTest
            )
            adopt(parent, declaration, child)
            register(child, scopes)
        }
        bind(facts, scopes)
        facts.modDeclarations.filterNot { it.isInline }.forEach { declaration ->
            val parent = scopes[declaration.inlinePath] ?: return@forEach
            val file = fileOf(declaration, parent) ?: return@forEach
            adopt(parent, declaration, scopeOf(file) ?: fileModule(declaration, parent, file).also { load(it) })
        }
    }

    private fun register(scope: RustModuleScope, scopes: MutableMap<List<String>, RustModuleScope>) {
        scopes[scope.inlinePath] = scope
        scopesByFile[scope.file] = scopes
        scopesByPath.putIfAbsent(scope.path, scope)
    }

    private fun adopt(parent: RustModuleScope, declaration: RustModDeclaration, child: RustModuleScope) {
        parent.modules[declaration.name] = child
        parent.moduleVisibilities[declaration.name] = declaration.visibility
    }

    private fun bind(facts: RustModule, scopes: Map<List<String>, RustModuleScope>) {
        facts.items.forEach { item ->
            val scope = scopes[item.inlinePath]?.takeIf { isCounted(it, item.isTest) } ?: return@forEach
            scope.items.getOrPut(item.name) { mutableListOf() }.add(item)
            if (item.isMacroExport) {
                val root = scopesByPath[scope.crateRootPath] ?: scope
                root.exportedMacros.putIfAbsent(item.name, MacroBinding(item.name, scope.pathOf(item.name)))
            }
        }
        facts.uses.forEach { use ->
            val scope = scopes[use.inlinePath]?.takeIf { isCounted(it, use.isTest) } ?: return@forEach
            if (use.isGlob) {
                scope.globs.add(use)
            } else if (use.binding != null) {
                scope.uses.add(use)
            }
        }
    }

    /** Whether code that [isTest] marks, in [scope], counts in this run. */
    fun isCounted(scope: RustModuleScope, isTest: Boolean): Boolean = includesTests || !(isTest || scope.isTest)

    // A `mod.rs` and a file `#[path]` loads own their folder, any other `a.rs` the folder `a/` next to it
    private fun fileModule(declaration: RustModDeclaration, parent: RustModuleScope, file: List<String>): RustModuleScope {
        val ownsFolder = file.last() == RustCrates.MOD_FILE || declaration.pathAttribute != null
        val childFolder = if (ownsFolder) file.dropLast(1) else file.dropLast(1) + file.last().removeSuffix(RustCrates.RUST_SUFFIX)
        return RustModuleScope(
            parent.pathOf(declaration.name),
            parent.crate,
            parent.crateRootPath,
            file,
            emptyList(),
            parent,
            childFolder,
            textualMacrosAt(parent, declaration.offset),
            parent.isTest || declaration.isTest
        )
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
        val path = rootPath + modules
        return RustModuleScope(path, crate, rootPath, file, emptyList(), scopesByPath[path.dropLast(1)], file.dropLast(1))
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

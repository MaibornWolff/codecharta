package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.treesitter.excavationsite.api.RustNamespace
import de.maibornwolff.treesitter.excavationsite.api.RustPath
import de.maibornwolff.treesitter.excavationsite.api.RustUse

/**
 * The lookup of `rust.md` over the module tree: a path's first segment as `crate`, `self`, `super`, `::x` or a simple
 * name, then each further segment in what the path so far means. A path into a type, trait or enum means that type
 * (decision 11); a library path means nothing. One lookup serves one file: it remembers the names it is resolving.
 */
internal class RustLookup(private val tree: RustModuleTree, private val crates: RustCrates) {
    private val bindings = ModuleBindings(::resolveUse)

    fun resolve(path: RustPath, user: RustModuleScope): List<Meaning> =
        resolve(Written(path.segments, path.namespace, path.offset, path.blockGlobs), user)

    /** What the name a `use` binds means in [namespace], looked up from the `use`'s module. */
    fun resolveUse(use: RustUse, namespace: RustNamespace, user: RustModuleScope): List<Meaning> =
        resolve(Written(use.path, namespace, use.offset, emptyList(), isUse = true), user)

    private data class Written(
        val segments: List<String>,
        val namespace: RustNamespace,
        val offset: Int,
        val blockGlobs: List<List<String>>,
        val isUse: Boolean = false
    )

    private fun resolve(written: Written, user: RustModuleScope): List<Meaning> {
        if (written.segments.isEmpty()) return emptyList()
        val (start, rest) = startOf(written, user)
        return rest.foldIndexed(start) { index, current, segment ->
            val namespace = if (index == rest.lastIndex) written.namespace else RustNamespace.TYPE
            current.flatMap { member(it, segment, namespace, user) }.distinct()
        }
    }

    // What the first segment means, with the segments still to walk
    private fun startOf(written: Written, user: RustModuleScope): Pair<List<Meaning>, List<String>> {
        val first = written.segments.first()
        val rest = written.segments.drop(1)
        val namespace = if (rest.isEmpty()) written.namespace else RustNamespace.TYPE
        val isEdition2015 = user.crate.edition < RustCrate.EDITION_2018
        return when {
            first == CRATE || first == DOLLAR_CRATE -> moduleOrNothing(crateRootOf(user)) to rest
            first == SELF -> listOf(Meaning.Module(user)) to rest
            first == SUPER -> moduleOrNothing(user.parent) to rest
            first == GLOBAL && isEdition2015 -> moduleOrNothing(crateRootOf(user)) to rest
            first == GLOBAL -> rest.firstOrNull()?.let { crateNamed(it, user) }.orEmpty() to rest.drop(1)
            written.isUse && isEdition2015 -> inCrateRoot(first, namespace, user) to rest
            else -> lookupName(first, namespace, user, written) to rest
        }
    }

    private fun moduleOrNothing(scope: RustModuleScope?): List<Meaning> = listOfNotNull(scope?.let { Meaning.Module(it) })

    // Edition 2015: a `use` path starts at the crate root, where `extern crate` puts the other crates
    private fun inCrateRoot(name: String, namespace: RustNamespace, user: RustModuleScope): List<Meaning> =
        crateRootOf(user)?.let { bindings.lookupIn(it, name, namespace, user) }.orEmpty().ifEmpty { crateNamed(name, user) }

    // "A simple name": textual macros, block globs, the module's names, crate names; the prelude means nothing
    private fun lookupName(name: String, namespace: RustNamespace, user: RustModuleScope, written: Written): List<Meaning> {
        if (namespace == RustNamespace.MACRO) {
            tree
                .textualMacrosAt(
                    user,
                    written.offset
                ).lastOrNull { it.name == name }
                ?.let { return listOf(Meaning.Declared(it.path, null)) }
        }
        written.blockGlobs.forEach { glob ->
            val found = resolve(Written(glob, RustNamespace.TYPE, written.offset, emptyList(), isUse = true), user)
                .flatMap { member(it, name, namespace, user) }
            if (found.isNotEmpty()) return found
        }
        val inModule = bindings.lookupIn(user, name, namespace, user)
        if (inModule.isNotEmpty() || namespace == RustNamespace.VALUE || namespace == RustNamespace.MACRO) return inModule
        return crateNamed(name, user)
    }

    private fun member(meaning: Meaning, segment: String, namespace: RustNamespace, user: RustModuleScope): List<Meaning> = when (meaning) {
        is Meaning.Module -> when (segment) {
            SUPER -> moduleOrNothing(meaning.scope.parent)
            SELF -> listOf(meaning)
            else -> bindings.lookupIn(meaning.scope, segment, namespace, user)
        }
        is Meaning.Declared -> if (meaning.item == null ||
            RustNamespace.TYPE in meaning.item.kind.namespaces
        ) {
            listOf(meaning)
        } else {
            emptyList()
        }
        is Meaning.Reexport -> if (meaning.target is Meaning.Module) member(meaning.target, segment, namespace, user) else listOf(meaning)
    }

    // A dependency renamed in Cargo.toml, an `extern crate … as`, then a crate of the project by its name (decision 9)
    private fun crateNamed(name: String, user: RustModuleScope): List<Meaning> {
        val renamed = user.crate.renamedDependencies.entries
            .firstOrNull { RustCrates.crateNameOf(it.key) == name }
            ?.let { crates.libraryNameOfPackage(it.value) }
        val externCrate = crateRootOf(user)?.let { root -> tree.externCratesOf(root).firstOrNull { it.binding == name }?.name }
        val crateName = renamed ?: externCrate ?: name
        val crate = crates.crates.filter { it.name == crateName }.minByOrNull { it.kind.ordinal } ?: return emptyList()
        return moduleOrNothing(tree.rootOf(crate))
    }

    private fun crateRootOf(user: RustModuleScope): RustModuleScope? = tree.scopeAt(user.crateRootPath)

    companion object {
        private const val CRATE = "crate"
        private const val DOLLAR_CRATE = "\$crate"
        private const val SELF = "self"
        private const val SUPER = "super"
        private const val GLOBAL = ""
    }
}

package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.treesitter.excavationsite.api.RustItem
import de.maibornwolff.treesitter.excavationsite.api.RustItemKind
import de.maibornwolff.treesitter.excavationsite.api.RustNamespace
import de.maibornwolff.treesitter.excavationsite.api.RustUse
import de.maibornwolff.treesitter.excavationsite.api.RustVisibility

/**
 * Steps 2 and 3 of "A simple name" in `rust.md` for one module: what it declares and what its `use` declarations bind,
 * then what its glob imports bind; a name two globs offer from different declarations means nothing. A `use` of the
 * module the name is written in, or one without a visibility, is an import that means what it names; any other `use`
 * is a re-export (decision 7). [resolveUse] looks up the path of a `use` from its module.
 */
internal class ModuleBindings(private val resolveUse: (RustUse, RustNamespace, RustModuleScope) -> List<Meaning>) {
    private val inProgress = HashSet<Triple<List<String>, String, RustNamespace>>()

    fun lookupIn(scope: RustModuleScope, name: String, namespace: RustNamespace, user: RustModuleScope): List<Meaning> {
        val key = Triple(scope.path, name, namespace)
        if (!inProgress.add(key)) return emptyList()
        try {
            val explicit = declaredIn(scope, name, namespace) + importedIn(scope, name, namespace, user)
            return explicit.ifEmpty { globbedIn(scope, name, namespace, user) }
        } finally {
            inProgress.remove(key)
        }
    }

    private fun declaredIn(scope: RustModuleScope, name: String, namespace: RustNamespace): List<Meaning> {
        val items = scope.items[name].orEmpty().filter { it.isIn(namespace) }.map { Meaning.Declared(scope.pathOf(name), it) }
        val module = scope.modules[name]?.takeIf { namespace == RustNamespace.TYPE || namespace == RustNamespace.ANY }
        val exported = scope.exportedMacros[name]?.takeIf { namespace == RustNamespace.MACRO || namespace == RustNamespace.ANY }
        return items.distinctBy { it.path } +
            listOfNotNull(module?.let { Meaning.Module(it) }, exported?.let { Meaning.Declared(it.path, null) })
    }

    private fun importedIn(scope: RustModuleScope, name: String, namespace: RustNamespace, user: RustModuleScope): List<Meaning> =
        scope.uses.filter { it.binding == name }.flatMap { use ->
            resolveUse(use, namespace, scope).map { meaning -> asSeenFrom(scope, use, name, meaning, user) }
        }

    private fun globbedIn(scope: RustModuleScope, name: String, namespace: RustNamespace, user: RustModuleScope): List<Meaning> {
        val found = scope.globs
            .filter { glob -> scope == user || scope.isVisibleTo(user, glob.visibility) }
            .flatMap { glob ->
                resolveUse(glob, RustNamespace.TYPE, scope)
                    .flatMap { offered(it, name, namespace, scope) }
                    .map { meaning -> asSeenFrom(scope, glob, name, meaning, user) }
            }.distinct()
        return if (found.distinctBy { it.declarationPath ?: it }.size > 1) emptyList() else found
    }

    // What a glob imports: the names of a module visible to the importer, or the variants of an enum
    private fun offered(source: Meaning, name: String, namespace: RustNamespace, importer: RustModuleScope): List<Meaning> = when (source) {
        is Meaning.Module -> lookupIn(source.scope, name, namespace, importer).filter { isVisible(source.scope, it, name, importer) }
        is Meaning.Declared -> if (source.item?.kind == RustItemKind.ENUM && name in source.item.variants) listOf(source) else emptyList()
        is Meaning.Reexport -> offered(source.target, name, namespace, importer).map { if (source.target is Meaning.Module) it else source }
    }

    private fun isVisible(module: RustModuleScope, meaning: Meaning, name: String, importer: RustModuleScope): Boolean {
        val visibility = (meaning as? Meaning.Declared)?.item?.visibility
            ?: module.moduleVisibilities[name]
            ?: module.uses.firstOrNull { it.binding == name }?.visibility
            ?: RustVisibility.PUBLIC
        return module.isVisibleTo(importer, visibility)
    }

    private fun asSeenFrom(
        scope: RustModuleScope,
        use: RustUse,
        name: String,
        meaning: Meaning,
        user: RustModuleScope
    ): Meaning = if (scope == user || use.visibility == RustVisibility.PRIVATE) meaning else Meaning.Reexport(scope.pathOf(name), meaning)

    private fun RustItem.isIn(namespace: RustNamespace): Boolean = namespace == RustNamespace.ANY || namespace in kind.namespaces
}

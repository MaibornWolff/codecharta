package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustNamespace
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustPath

/**
 * The names the blocks, functions and items around a place bind (`rust.md`, "A simple name", step 1), innermost last,
 * and the paths written so far. A path whose first segment such a name binds is left out, or written as the path a
 * block `use` imports; `Self` names the item around it and is left out too.
 */
internal class LocalScopes {
    private class Scope {
        val types = HashSet<String>()
        val values = HashSet<String>()
        val macros = HashSet<String>()
        val uses = HashMap<String, List<String>>()
        val globs = mutableListOf<List<String>>()
    }

    private val scopes = ArrayDeque<Scope>()
    private val written = mutableListOf<RustPath>()

    val paths: List<RustPath> get() = written.toList()

    fun <T> within(block: () -> T): T {
        scopes.addLast(Scope())
        try {
            return block()
        } finally {
            scopes.removeLast()
        }
    }

    fun bindType(name: String) {
        scopes.last().types.add(name)
    }

    fun bindValue(name: String) {
        scopes.last().values.add(name)
    }

    fun bindMacro(name: String) {
        scopes.last().macros.add(name)
    }

    fun bindUse(name: String, path: List<String>) {
        scopes.last().uses[name] = path
    }

    fun bindGlob(path: List<String>) {
        scopes.last().globs.add(path)
    }

    fun add(segments: List<String>, namespace: RustNamespace, offset: Int) {
        val first = segments.firstOrNull() ?: return
        if (first == SELF_TYPE) return
        if (isBound(first, if (segments.size == 1) namespace else RustNamespace.TYPE)) return
        val imported = scopes.asReversed().firstNotNullOfOrNull { it.uses[first] }
        if (imported != null) {
            written.add(RustPath(imported + segments.drop(1), namespace, offset))
        } else {
            written.add(RustPath(segments, namespace, offset, scopes.asReversed().flatMap { it.globs }))
        }
    }

    private fun isBound(name: String, namespace: RustNamespace): Boolean = scopes.any { scope ->
        when (namespace) {
            RustNamespace.TYPE -> name in scope.types
            RustNamespace.VALUE -> name in scope.values
            RustNamespace.MACRO -> name in scope.macros
            RustNamespace.ANY -> name in scope.values || name in scope.types
        }
    }

    companion object {
        private const val SELF_TYPE = "Self"
    }
}

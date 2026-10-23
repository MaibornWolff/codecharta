package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The names a Python module binds at its top level, and which of them a use sees: the last binding of the whole module
 * for a use that runs later, the last before a position for one that runs while its statement runs (decision 3 of
 * `docs/name-resolution/python.md`). A wildcard import after that binding may bind the name too, so the names it may
 * bind come first, the latest first.
 */
internal class ModuleBindings(module: SyntaxNode) {
    private val bindings = ScopeBindings(
        { _, name -> Binding.OwnDeclaration(listOf(name)) },
        { Binding.OwnDeclaration(listOf(it)) }
    ).of(module)

    /** What [name] may mean at [usePosition], the likeliest first; at any position after the module ran when it is null. */
    fun of(name: String, usePosition: Int?): List<Binding> {
        val latestFirst = bindings.filter { usePosition == null || it.position <= usePosition }.asReversed()
        val lastBinding = latestFirst.indexOfFirst { it.name == name }
        val after = if (lastBinding < 0) latestFirst else latestFirst.take(lastBinding)
        val wildcards = if (name.startsWith(PRIVATE_PREFIX)) emptyList() else after.filter { it.name == null }.map { it.binding }
        return wildcards + listOfNotNull(latestFirst.getOrNull(lastBinding)?.binding)
    }

    companion object {
        private const val PRIVATE_PREFIX = "_"
    }
}

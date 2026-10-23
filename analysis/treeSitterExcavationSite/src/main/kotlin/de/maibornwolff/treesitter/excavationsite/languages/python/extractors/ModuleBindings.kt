package de.maibornwolff.treesitter.excavationsite.languages.python.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The names a Python module binds at its top level, and which of them a use sees: the last binding of the whole module
 * for a use that runs later, the last before a position for one that runs while its statement runs (decision 3 of
 * `docs/name-resolution/python.md`), with its alternatives in other branches of one `if` or `try` (decision 5). A
 * wildcard import after that binding may bind the name too, so the names it may bind come first, the latest first.
 */
internal class ModuleBindings(module: SyntaxNode) {
    private val bindings = ScopeBindings(
        { _, name -> Binding.OwnDeclaration(listOf(name)) },
        { Binding.OwnDeclaration(listOf(it)) }
    ).of(module)

    /**
     * What [name] may mean at [usePosition], after the module ran when it is null: one meaning per binding of it and per
     * alternative to that binding, each the wildcard imports after them first, the latest first, then the binding.
     */
    fun of(name: String, usePosition: Int?): List<List<Binding>> {
        val visible = bindings.filter { usePosition == null || it.position <= usePosition }
        val lastBindings = visible.lastWithAlternatives(name)
        val latestPosition = lastBindings.firstOrNull()?.position ?: -1
        val wildcards = if (name.startsWith(PRIVATE_PREFIX)) {
            emptyList()
        } else {
            visible.filter {
                it.name == null &&
                    it.position > latestPosition
            }
        }
        val wildcardBindings = wildcards.asReversed().map { it.binding }
        if (lastBindings.isEmpty()) return listOf(wildcardBindings).filter { it.isNotEmpty() }
        return lastBindings.map { wildcardBindings + it.binding }
    }

    companion object {
        private const val PRIVATE_PREFIX = "_"
    }
}

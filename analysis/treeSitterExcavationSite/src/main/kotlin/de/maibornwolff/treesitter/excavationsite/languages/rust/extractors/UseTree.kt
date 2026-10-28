package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/**
 * The names one `use` declaration binds: `use a::{self, b::C as D, e::*};` binds `a` to `a`, `D` to `a::b::C` and the
 * glob `a::e`. `as _` binds no name.
 */
internal object UseTree {
    data class Binding(val path: List<String>, val name: String?, val isGlob: Boolean)

    private const val USE_WILDCARD = "use_wildcard"
    private const val USE_AS_CLAUSE = "use_as_clause"
    private const val SCOPED_USE_LIST = "scoped_use_list"
    private const val USE_LIST = "use_list"
    private const val VISIBILITY_MODIFIER = "visibility_modifier"
    private const val SCOPE_SEPARATOR = "::"
    private const val SELF = "self"
    private const val UNDERSCORE = "_"

    fun bindingsOf(useDeclaration: SyntaxNode): List<Binding> {
        val tree = useDeclaration.namedChildren().firstOrNull { it.type != VISIBILITY_MODIFIER } ?: return emptyList()
        return flatten(tree, emptyList())
    }

    private fun flatten(node: SyntaxNode, prefix: List<String>): List<Binding> = when (node.type) {
        USE_WILDCARD -> listOf(Binding(prefix + node.namedChildren().firstOrNull()?.let { segmentsOf(it) }.orEmpty(), null, true))
        USE_AS_CLAUSE -> {
            val children = node.namedChildren().toList()
            val alias = children.getOrNull(1)?.text?.trim()
            listOfNotNull(named(prefix, children.firstOrNull()?.let { segmentsOf(it) }.orEmpty(), alias))
        }
        SCOPED_USE_LIST -> {
            val list = node.namedChildren().firstOrNull { it.type == USE_LIST }
            val path = node.namedChildren().firstOrNull { it.type != USE_LIST }?.let { segmentsOf(it) }.orEmpty()
            list?.let { flatten(it, prefix + path) }.orEmpty()
        }
        USE_LIST -> node.namedChildren().flatMap { flatten(it, prefix) }.toList()
        else -> listOfNotNull(named(prefix, segmentsOf(node), null))
    }

    // `self` in a group names the group's own path
    private fun named(prefix: List<String>, segments: List<String>, alias: String?): Binding? {
        val path = if (segments == listOf(SELF) && prefix.isNotEmpty()) prefix else prefix + segments
        if (path.isEmpty()) return null
        val name = (alias ?: path.last()).takeUnless { it == UNDERSCORE }
        return Binding(path, name, false)
    }

    /** `a::b::C` as its segments, a leading `::` as an empty first segment. */
    fun segmentsOf(node: SyntaxNode): List<String> {
        val text = node.text.filterNot { it.isWhitespace() }
        val segments = text.split(SCOPE_SEPARATOR)
        return if (text.startsWith(SCOPE_SEPARATOR)) listOf("") + segments.drop(1) else segments.filter { it.isNotEmpty() }
    }
}

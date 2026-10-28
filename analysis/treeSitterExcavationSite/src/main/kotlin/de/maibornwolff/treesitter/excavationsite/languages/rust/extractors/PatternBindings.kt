package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustNamespace
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * What a pattern binds and names (`rust.md`, "A simple name"): a lower-case identifier binds a new local name, an
 * upper-case one names a constant, a unit struct or a variant, as Rust's naming conventions keep them apart; the
 * struct or variant a destructuring pattern names is a path. Whatever else the pattern holds is visited as code.
 */
internal class PatternBindings(private val scopes: LocalScopes, private val visit: (SyntaxNode) -> Unit) {
    fun bind(pattern: SyntaxNode) {
        when (pattern.type) {
            IDENTIFIER -> if (isBindingName(pattern.text)) scopes.bindValue(pattern.text) else addValue(pattern)
            SCOPED_IDENTIFIER -> visit(pattern)
            TUPLE_STRUCT_PATTERN -> bindDestructuring(pattern) { type -> if (type.type == IDENTIFIER) addValue(type) else visit(type) }
            STRUCT_PATTERN -> bindDestructuring(pattern) { type -> visit(type) }
            FIELD_PATTERN -> bindField(pattern)
            CAPTURED_PATTERN -> bindCaptured(pattern)
            RANGE_PATTERN -> pattern.namedChildren().forEach { if (it.type == IDENTIFIER) addValue(it) else visit(it) }
            in PATTERN_CONTAINERS -> pattern.namedChildren().forEach { bind(it) }
            else -> visit(pattern)
        }
    }

    private fun bindDestructuring(pattern: SyntaxNode, visitType: (SyntaxNode) -> Unit) {
        val type = pattern.getChildByFieldName(TYPE_FIELD).orNull()
        type?.let { visitType(it) }
        pattern.namedChildren().filter { it != type }.forEach { bind(it) }
    }

    // `Den { depth }` binds `depth`, `Den { depth: d }` binds `d`
    private fun bindField(pattern: SyntaxNode) {
        val inner = pattern.getChildByFieldName(PATTERN_FIELD).orNull()
        if (inner != null) return bind(inner)
        pattern.namedChildren().filter { it.type == SHORTHAND_FIELD_IDENTIFIER }.forEach { scopes.bindValue(it.text) }
    }

    // `name @ pattern` binds `name`
    private fun bindCaptured(pattern: SyntaxNode) {
        pattern.namedChildren().forEachIndexed { index, part ->
            if (index == 0 && part.type == IDENTIFIER) scopes.bindValue(part.text) else bind(part)
        }
    }

    private fun addValue(node: SyntaxNode) = scopes.add(listOf(node.text), RustNamespace.VALUE, node.startByte)

    private fun isBindingName(name: String): Boolean = name.first().let { it.isLowerCase() || it == UNDERSCORE }

    companion object {
        private const val IDENTIFIER = "identifier"
        private const val SCOPED_IDENTIFIER = "scoped_identifier"
        private const val TUPLE_STRUCT_PATTERN = "tuple_struct_pattern"
        private const val STRUCT_PATTERN = "struct_pattern"
        private const val FIELD_PATTERN = "field_pattern"
        private const val CAPTURED_PATTERN = "captured_pattern"
        private const val RANGE_PATTERN = "range_pattern"
        private const val SHORTHAND_FIELD_IDENTIFIER = "shorthand_field_identifier"
        private const val TYPE_FIELD = "type"
        private const val PATTERN_FIELD = "pattern"
        private const val UNDERSCORE = '_'
        private val PATTERN_CONTAINERS =
            setOf("mut_pattern", "ref_pattern", "reference_pattern", "or_pattern", "tuple_pattern", "slice_pattern")
    }
}

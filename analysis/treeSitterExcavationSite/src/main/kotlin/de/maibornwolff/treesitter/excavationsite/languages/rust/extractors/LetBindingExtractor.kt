package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val IDENTIFIER = "identifier"
private const val SHORTHAND_FIELD_IDENTIFIER = "shorthand_field_identifier"
private const val STRUCT_PATTERN = "struct_pattern"
private const val TUPLE_STRUCT_PATTERN = "tuple_struct_pattern"
private const val ASSIGNMENT = "="
private const val TYPE_ANNOTATION = ":"

/**
 * Extracts the bound variable names from a `let` declaration's pattern.
 *
 * Walks the binding pattern — the children before the `:` type annotation or `=`
 * initializer — and collects every bound name, descending through tuple, struct,
 * and tuple-struct patterns. The leading child of a `struct_pattern` /
 * `tuple_struct_pattern` is the constructor/type path (e.g. `Point` in
 * `Point { x, y }`, `Some` in `Some(inner)`) and is skipped; matched field names
 * (`field_identifier`) are not collected either. So neither constructor/type
 * references, nor the type annotation, nor the right-hand side leak as declarations.
 */
internal fun extractLetBindingIdentifiers(node: TSNode, sourceCode: String): List<String> {
    val identifiers = mutableListOf<String>()
    for (child in node.children()) {
        if (child.type == TYPE_ANNOTATION || child.type == ASSIGNMENT) break
        collectPatternBindings(child, sourceCode, identifiers)
    }
    return identifiers
}

private fun collectPatternBindings(node: TSNode, sourceCode: String, out: MutableList<String>) {
    when (node.type) {
        IDENTIFIER, SHORTHAND_FIELD_IDENTIFIER -> out.add(TreeTraversal.getNodeText(node, sourceCode))
        STRUCT_PATTERN, TUPLE_STRUCT_PATTERN ->
            // Skip the leading constructor/type path; recurse the remaining sub-patterns.
            node.children().drop(1).forEach { collectPatternBindings(it, sourceCode, out) }
        else -> node.children().forEach { collectPatternBindings(it, sourceCode, out) }
    }
}

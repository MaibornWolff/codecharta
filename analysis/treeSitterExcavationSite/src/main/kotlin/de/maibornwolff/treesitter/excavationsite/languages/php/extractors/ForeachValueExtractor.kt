package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.children

private const val VARIABLE_NAME = "variable_name"
private const val BY_REF = "by_ref"
private const val PAIR = "pair"
private const val AS_KEYWORD = "as"

/**
 * Extracts value variable from foreach statement.
 * Examples:
 * - `foreach ($items as $item)` -> "item"
 * - `foreach ($items as &$item)` -> "item"
 * Returns null for key-value pairs: `foreach ($items as $key => $value)`
 */
internal fun extractForeachValueVariable(node: SyntaxNode): String? {
    val children = node.children().toList()
    val asIndex = children.indexOfFirst { it.text == AS_KEYWORD }
    if (asIndex < 0) return null

    for (child in children.drop(asIndex + 1)) {
        when (child.type) {
            VARIABLE_NAME ->
                return stripDollarPrefix(child.text)
            BY_REF ->
                return findFirstVariableName(child)
            PAIR ->
                return null
        }
    }
    return null
}

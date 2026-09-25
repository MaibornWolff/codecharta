package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

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
internal fun extractForeachValueVariable(node: TSNode, sourceCode: String): String? {
    val children = node.children().toList()
    val asIndex = children.indexOfFirst { TreeTraversal.getNodeText(it, sourceCode) == AS_KEYWORD }
    if (asIndex < 0) return null

    for (child in children.drop(asIndex + 1)) {
        when (child.type) {
            VARIABLE_NAME ->
                return stripDollarPrefix(TreeTraversal.getNodeText(child, sourceCode))
            BY_REF ->
                return findFirstVariableName(child, sourceCode)
            PAIR ->
                return null
        }
    }
    return null
}

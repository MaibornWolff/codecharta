package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val NAME = "name"
private const val QUALIFIED_NAME = "qualified_name"
private const val AS_KEYWORD = "as"

/**
 * Extracts name from use clause, handling aliases and qualified names.
 * Examples:
 * - `use App\Model\User;` -> "User"
 * - `use App\Model\User as Customer;` -> "Customer"
 */
internal fun extractUseClauseName(node: TSNode, sourceCode: String): String? = findNameAfterAs(node, sourceCode)
    ?: node
        .children()
        .firstOrNull { it.type == QUALIFIED_NAME }
        ?.let { findLastNameChild(it, sourceCode) }
    ?: findFirstChildTextByType(node, sourceCode, NAME)

/**
 * Finds name child that appears after "as" keyword.
 * Used for trait adaptation: `use SomeTrait { method as newName; }`
 */
internal fun findNameAfterAs(node: TSNode, sourceCode: String): String? {
    val children = node.children().toList()
    val asIndex = children.indexOfFirst { TreeTraversal.getNodeText(it, sourceCode) == AS_KEYWORD }
    if (asIndex < 0) return null
    return children
        .drop(asIndex + 1)
        .firstOrNull { it.type == NAME }
        ?.let { TreeTraversal.getNodeText(it, sourceCode) }
}

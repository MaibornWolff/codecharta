package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val NAME = "name"
private const val QUALIFIED_NAME = "qualified_name"
private const val AS_KEYWORD = "as"

/**
 * Extracts name from use clause, handling aliases and qualified names.
 * Examples:
 * - `use App\Model\User;` -> "User"
 * - `use App\Model\User as Customer;` -> "Customer"
 */
internal fun extractUseClauseName(node: SyntaxNode): String? = findNameAfterAs(node)
    ?: node
        .children()
        .firstOrNull { it.type == QUALIFIED_NAME }
        ?.let { findLastNameChild(it) }
    ?: findFirstChildTextByType(node, NAME)

/**
 * Finds name child that appears after "as" keyword.
 * Used for trait adaptation: `use SomeTrait { method as newName; }`
 */
internal fun findNameAfterAs(node: SyntaxNode): String? {
    val children = node.children().toList()
    val asIndex = children.indexOfFirst { it.text == AS_KEYWORD }
    if (asIndex < 0) return null
    return children
        .drop(asIndex + 1)
        .firstOrNull { it.type == NAME }
        ?.text
}

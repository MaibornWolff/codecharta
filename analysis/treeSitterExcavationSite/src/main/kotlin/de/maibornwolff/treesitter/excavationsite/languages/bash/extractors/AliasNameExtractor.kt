package de.maibornwolff.treesitter.excavationsite.languages.bash.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val COMMAND_NAME = "command_name"
private const val ALIAS = "alias"

/**
 * Extracts alias name from a command node if it's an alias definition.
 *
 * Alias syntax: alias name='value' or alias name="value"
 *
 * Returns null if the command is not an alias definition.
 */
internal fun extractAliasName(node: TSNode, sourceCode: String): String? {
    val children = node.children().toList()
    if (children.size < 2) return null

    val firstChild = children[0]
    if (firstChild.type != COMMAND_NAME) return null
    if (TreeTraversal.getNodeText(firstChild, sourceCode) != ALIAS) return null

    // The alias name is the second child (a word node in form "name=value" or "name='value'")
    val aliasText = TreeTraversal.getNodeText(children[1], sourceCode)

    // Extract just the name part before the '='
    return aliasText.substringBefore('=').takeIf { it.isNotEmpty() }
}

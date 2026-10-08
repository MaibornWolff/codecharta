package de.maibornwolff.treesitter.excavationsite.languages.bash.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

private const val COMMAND_NAME = "command_name"
private const val ALIAS = "alias"

/**
 * Extracts alias name from a command node if it's an alias definition.
 *
 * Alias syntax: alias name='value' or alias name="value"
 *
 * Returns null if the command is not an alias definition.
 */
internal fun extractAliasName(node: SyntaxNode): String? {
    val children = node.children().toList()
    if (children.size < 2) return null

    val firstChild = children[0]
    if (firstChild.type != COMMAND_NAME) return null
    if (firstChild.text != ALIAS) return null

    // The alias name is the second child (a word node in form "name=value" or "name='value'")
    val aliasText = children[1].text

    // Extract just the name part before the '='
    return aliasText.substringBefore('=').takeIf { it.isNotEmpty() }
}

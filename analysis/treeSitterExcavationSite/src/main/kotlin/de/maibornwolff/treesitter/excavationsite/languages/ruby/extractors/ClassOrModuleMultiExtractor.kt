package de.maibornwolff.treesitter.excavationsite.languages.ruby.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children

private const val CONSTANT = "constant"
private const val SCOPE_RESOLUTION = "scope_resolution"

/**
 * Extracts identifiers from class/module with potential nested namespaces.
 * For `class Outer::Inner::Deep`, extracts [Outer, Inner, Deep].
 */
internal fun extractFromClassOrModuleMultiple(node: SyntaxNode): List<String> {
    val scopeResolution = node.children().firstOrNull {
        it.type == SCOPE_RESOLUTION
    }
    return if (scopeResolution != null) {
        extractConstantsFromScopeResolution(scopeResolution)
    } else {
        listOfNotNull(
            TreeTraversal.findFirstChildTextByType(node, CONSTANT)
        )
    }
}

/**
 * Recursively extracts all constants from a scope_resolution node.
 */
private fun extractConstantsFromScopeResolution(node: SyntaxNode): List<String> = node
    .children()
    .flatMap { child ->
        when (child.type) {
            SCOPE_RESOLUTION -> extractConstantsFromScopeResolution(child)
            CONSTANT -> listOf(child.text)
            else -> emptyList()
        }
    }.toList()

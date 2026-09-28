package de.maibornwolff.treesitter.excavationsite.languages.go.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val TYPE_SPEC = "type_spec"
private const val TYPE_IDENTIFIER = "type_identifier"

/**
 * Extracts identifier from type declaration.
 * Type declarations nest the identifier inside a type_spec child.
 */
internal fun extractTypeDeclarationIdentifier(node: TSNode, sourceCode: String): String? = node
    .children()
    .firstOrNull { it.type == TYPE_SPEC }
    ?.let { TreeTraversal.findFirstChildTextByType(it, sourceCode, TYPE_IDENTIFIER) }

package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val TYPE_IDENTIFIER = "type_identifier"

internal fun extractFromFriendDeclaration(node: SyntaxNode): String? {
    for (child in node.children()) {
        if (child.isNull) continue
        when (child.type) {
            TYPE_IDENTIFIER -> {
                return child.text
            }
            "class_specifier", "struct_specifier" -> {
                return TreeTraversal.findFirstChildTextByType(
                    child,
                    TYPE_IDENTIFIER
                )
            }
        }
    }
    return null
}

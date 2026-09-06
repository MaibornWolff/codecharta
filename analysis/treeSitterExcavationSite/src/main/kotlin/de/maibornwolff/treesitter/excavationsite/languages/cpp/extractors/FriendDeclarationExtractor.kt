package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val TYPE_IDENTIFIER = "type_identifier"

internal fun extractFromFriendDeclaration(node: TSNode, sourceCode: String): String? {
    for (child in node.children()) {
        if (child.isNull) continue
        when (child.type) {
            TYPE_IDENTIFIER -> {
                return TreeTraversal.getNodeText(child, sourceCode)
            }
            "class_specifier", "struct_specifier" -> {
                return TreeTraversal.findFirstChildTextByType(
                    child,
                    sourceCode,
                    TYPE_IDENTIFIER
                )
            }
        }
    }
    return null
}

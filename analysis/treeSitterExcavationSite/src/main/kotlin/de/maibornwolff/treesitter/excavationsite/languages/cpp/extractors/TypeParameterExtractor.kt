package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal

private const val TYPE_IDENTIFIER = "type_identifier"
private const val IDENTIFIER = "identifier"
private const val FIELD_NAME = "name"

internal fun extractFromTypeParameter(node: SyntaxNode, sourceCode: String): String? {
    val nameField = node.getChildByFieldName(FIELD_NAME)
    if (!nameField.isNull) {
        return TreeTraversal.getNodeText(nameField, sourceCode)
    }

    return TreeTraversal.findFirstChildTextByType(
        node,
        sourceCode,
        TYPE_IDENTIFIER,
        IDENTIFIER
    )
}

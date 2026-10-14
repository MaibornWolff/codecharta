package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors.usedtypes

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal object QualifiedIdentifierPath {
    private const val QUALIFIED_IDENTIFIER = "qualified_identifier"
    private const val SCOPE_FIELD = "scope"
    private const val NAME_FIELD = "name"

    fun scopeSegments(qualifiedId: SyntaxNode): List<String> = readLeaf(qualifiedId) { scopeSegments, _ -> scopeSegments }

    fun <T> readLeaf(qualifiedId: SyntaxNode, read: (scopeSegments: List<String>, leaf: SyntaxNode?) -> T): T {
        val scopeSegments = mutableListOf<String>()
        var node = qualifiedId
        while (node.type == QUALIFIED_IDENTIFIER) {
            val scope = node.getChildByFieldName(SCOPE_FIELD)
            if (!scope.isNull) {
                scopeSegments.add(scope.text.trim())
            }
            val nameField = node.getChildByFieldName(NAME_FIELD)
            if (nameField.isNull) return read(scopeSegments, null)
            node = nameField
        }
        return read(scopeSegments, node)
    }
}

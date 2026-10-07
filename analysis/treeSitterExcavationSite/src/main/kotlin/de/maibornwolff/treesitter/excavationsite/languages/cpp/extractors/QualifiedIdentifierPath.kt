package de.maibornwolff.treesitter.excavationsite.languages.cpp.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

internal data class QualifiedIdentifierPath(val segments: List<String>, val leaf: SyntaxNode?) {
    companion object {
        private const val QUALIFIED_IDENTIFIER = "qualified_identifier"
        private const val SCOPE_FIELD = "scope"
        private const val NAME_FIELD = "name"

        fun walk(qualifiedId: SyntaxNode): QualifiedIdentifierPath {
            val scopeSegments = mutableListOf<String>()
            var node = qualifiedId
            while (node.type == QUALIFIED_IDENTIFIER) {
                val scope = node.getChildByFieldName(SCOPE_FIELD)
                if (!scope.isNull) {
                    scopeSegments.add(scope.text.trim())
                }
                val nameField = node.getChildByFieldName(NAME_FIELD)
                if (nameField.isNull) return QualifiedIdentifierPath(scopeSegments, null)
                node = nameField
            }
            return QualifiedIdentifierPath(scopeSegments, node)
        }
    }
}

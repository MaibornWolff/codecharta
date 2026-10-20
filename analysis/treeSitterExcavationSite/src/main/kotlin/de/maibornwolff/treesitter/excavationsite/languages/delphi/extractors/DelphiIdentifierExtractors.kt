package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

private const val IDENTIFIER = "identifier"
private const val NAME_FIELD = "name"
private const val HEADER_FIELD = "header"
private const val RHS_FIELD = "rhs"
private const val ENTITY_FIELD = "entity"
private const val GENERIC_DOT = "genericDot"
private const val GENERIC_TPL = "genericTpl"

private fun leadingNameIdentifier(nameNode: SyntaxNode): String? {
    if (nameNode.isNull) return null
    return when (nameNode.type) {
        IDENTIFIER -> nameNode.text
        GENERIC_TPL -> {
            val entity = nameNode.getChildByFieldName(ENTITY_FIELD)
            if (entity.isNull) null else leadingNameIdentifier(entity)
        }
        GENERIC_DOT -> {
            val lhs = nameNode.getChildByFieldName("lhs")
            if (lhs.isNull) null else leadingNameIdentifier(lhs)
        }
        else ->
            TreeTraversal
                .findAllDescendantsOfType(nameNode, IDENTIFIER)
                .firstOrNull()
                ?.text
    }
}

private fun trailingNameIdentifier(nameNode: SyntaxNode): String? {
    if (nameNode.isNull) return null
    return when (nameNode.type) {
        IDENTIFIER -> nameNode.text
        GENERIC_TPL -> {
            val entity = nameNode.getChildByFieldName(ENTITY_FIELD)
            if (entity.isNull) null else trailingNameIdentifier(entity)
        }
        GENERIC_DOT -> {
            val rhs = nameNode.getChildByFieldName(RHS_FIELD)
            if (rhs.isNull) null else trailingNameIdentifier(rhs)
        }
        else -> null
    }
}

internal fun extractDelphiDeclTypeName(node: SyntaxNode): String? {
    val nameNode = node.getChildByFieldName(NAME_FIELD)
    return leadingNameIdentifier(nameNode)
}

internal fun extractDelphiDeclProcName(node: SyntaxNode): String? {
    val nameNode = node.getChildByFieldName(NAME_FIELD)
    return trailingNameIdentifier(nameNode)
}

internal fun extractDelphiDefProcName(node: SyntaxNode): String? {
    val header = node.getChildByFieldName(HEADER_FIELD)
    if (header.isNull) return null
    val nameNode = header.getChildByFieldName(NAME_FIELD)
    return trailingNameIdentifier(nameNode)
}

// `var X, Y: Integer;` lists its names up front; stopping at the first other token keeps identifiers of a
// default-value expression out.
internal fun extractDelphiMultipleNames(node: SyntaxNode): List<String> {
    val names = mutableListOf<String>()
    for (child in node.children()) {
        when (child.type) {
            IDENTIFIER -> names += child.text
            "," -> Unit
            else -> if (names.isNotEmpty()) return names
        }
    }
    return names
}

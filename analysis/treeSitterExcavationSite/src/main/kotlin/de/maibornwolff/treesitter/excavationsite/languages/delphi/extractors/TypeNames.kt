package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** The segments of a type name as written: `Game.Model.TCreature` is `[Game, Model, TCreature]`, `TList<T>` is `[TList]`. */
internal object TypeNames {
    private const val IDENTIFIER = "identifier"
    private const val TYPEREF = "typeref"
    private const val TYPEREF_DOT = "typerefDot"
    private const val TYPEREF_TPL = "typerefTpl"
    private const val TYPEREF_PTR = "typerefPtr"
    private const val LHS_FIELD = "lhs"
    private const val RHS_FIELD = "rhs"
    private const val ENTITY_FIELD = "entity"

    private val INNER_TYPES = setOf(IDENTIFIER, TYPEREF_DOT, TYPEREF_TPL, TYPEREF_PTR)

    fun segmentsOf(node: SyntaxNode): List<String> = when (node.type) {
        IDENTIFIER -> listOf(node.text)
        TYPEREF, TYPEREF_PTR -> node.children().firstOrNull { it.type in INNER_TYPES }?.let { segmentsOf(it) }.orEmpty()
        TYPEREF_DOT -> segmentsOfField(node, LHS_FIELD) + segmentsOfField(node, RHS_FIELD)
        TYPEREF_TPL -> segmentsOfField(node, ENTITY_FIELD)
        else -> emptyList()
    }

    private fun segmentsOfField(node: SyntaxNode, field: String): List<String> {
        val child = node.getChildByFieldName(field).orNull() ?: return emptyList()
        return segmentsOf(child)
    }
}

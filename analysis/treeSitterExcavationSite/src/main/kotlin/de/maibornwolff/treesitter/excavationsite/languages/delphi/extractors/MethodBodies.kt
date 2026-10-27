package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiName
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiSection
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

internal data class MethodBody(val ownerTypes: List<String>, val names: List<DelphiName>)

/** A method body (`function TOuter.TInner.Get: Integer; begin … end;`) and the names it writes, seeing its type's members first. */
internal object MethodBodies {
    private const val IDENTIFIER = "identifier"
    private const val GENERIC_DOT = "genericDot"
    private const val GENERIC_TPL = "genericTpl"
    private const val HEADER_FIELD = "header"
    private const val NAME_FIELD = "name"
    private const val LHS_FIELD = "lhs"
    private const val RHS_FIELD = "rhs"
    private const val ENTITY_FIELD = "entity"

    fun of(defProc: SyntaxNode, section: DelphiSection): MethodBody? {
        val name = defProc.getChildByFieldName(HEADER_FIELD).orNull()?.getChildByFieldName(NAME_FIELD)?.orNull() ?: return null
        if (name.type != GENERIC_DOT) return null
        val ownerTypes = segmentsOf(name).dropLast(1)
        return MethodBody(ownerTypes, NameCollector.namesIn(defProc, NamePlace(section, ownerTypes, LocalNames.of(defProc))))
    }

    private fun segmentsOf(node: SyntaxNode): List<String> = when (node.type) {
        IDENTIFIER -> listOf(node.text)
        GENERIC_TPL -> segmentsOfField(node, ENTITY_FIELD)
        GENERIC_DOT -> segmentsOfField(node, LHS_FIELD) + segmentsOfField(node, RHS_FIELD)
        else -> emptyList()
    }

    private fun segmentsOfField(node: SyntaxNode, field: String): List<String> {
        val child = node.getChildByFieldName(field).orNull() ?: return emptyList()
        return segmentsOf(child)
    }
}

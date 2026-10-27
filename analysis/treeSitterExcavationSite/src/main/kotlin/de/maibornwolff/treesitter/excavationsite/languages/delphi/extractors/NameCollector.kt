package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiName
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiSection
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/** Where the names of a subtree stand: the section, the type whose members they see first, and the local names that hide. */
internal data class NamePlace(val section: DelphiSection, val memberScope: List<String>, val locals: Set<String>) {
    fun hides(name: String): Boolean = name.lowercase() in locals
}

/**
 * The names a subtree writes: identifiers and dotted chains in expressions and statements, type names, attributes. The
 * name a declaration gives (a parameter, a field, a variable, a label), the member after `inherited`, the variable of an
 * exception handler and the field of a record constant are no names; a dotted chain ends where a call, an index or a
 * generic argument list makes the rest a member of a value.
 */
internal object NameCollector {
    private const val IDENTIFIER = "identifier"
    private const val EXPR_DOT = "exprDot"
    private const val EXPR_CALL = "exprCall"
    private const val EXPR_TPL = "exprTpl"
    private const val TYPEREF = "typeref"
    private const val TYPEREF_DOT = "typerefDot"
    private const val TYPEREF_TPL = "typerefTpl"
    private const val TYPEREF_PTR = "typerefPtr"
    private const val RTTI_ATTRIBUTES = "rttiAttributes"
    private const val GENERIC_TPL = "genericTpl"
    private const val ERROR = "ERROR"
    private const val LHS_FIELD = "lhs"
    private const val RHS_FIELD = "rhs"
    private const val ENTITY_FIELD = "entity"
    private const val ARGS_FIELD = "args"
    private const val NAME_FIELD = "name"

    private val TYPE_NAMES = setOf(TYPEREF, TYPEREF_DOT, TYPEREF_TPL, TYPEREF_PTR)
    private val NOT_WALKED = setOf("moduleName", "declUses", "declExports", "inherited", "guid", "asm", "comment")

    // The direct identifiers of these nodes are the names they declare (`A, B: Integer`, `on E: EFail`, `L1:`).
    private val DECLARING = setOf(
        "declArg", "declVar", "declField", "declConst", "declProp", "declEnumValue", "genericArg", "declType", "declProc",
        "declLabel", "varAssignDef", "exceptionHandler", "label", "recInitializerField", ERROR
    )

    fun namesIn(node: SyntaxNode, place: NamePlace): List<DelphiName> {
        val out = mutableListOf<DelphiName>()
        walk(node, place, out)
        return out.distinct()
    }

    private fun walk(node: SyntaxNode, place: NamePlace, out: MutableList<DelphiName>) {
        when (node.type) {
            IDENTIFIER -> add(listOf(node.text), place, out)
            EXPR_DOT -> walkChain(node, place, out)
            EXPR_TPL -> walkGenericInstance(node, place, out)
            in TYPE_NAMES -> walkTypeName(node, place, out)
            RTTI_ATTRIBUTES -> node.namedChildren().forEach { walkAttribute(it, place, out) }
            in NOT_WALKED -> Unit
            else -> walkChildren(node, place, out)
        }
    }

    private fun walkChildren(node: SyntaxNode, place: NamePlace, out: MutableList<DelphiName>) {
        val declaring = node.type in DECLARING
        val nameField = node.getChildByFieldName(NAME_FIELD).orNull()
        node.children().forEach { child ->
            when {
                isSameNode(child, nameField) -> walkDeclaredName(child, place, out)
                declaring && child.type == IDENTIFIER -> Unit
                else -> walk(child, place, out)
            }
        }
    }

    private fun isSameNode(node: SyntaxNode, other: SyntaxNode?): Boolean =
        other != null && node.startByte == other.startByte && node.type == other.type

    // A declared name is no use; only the constraints of a generic type's parameters (`TPool<T: TRule>`) are.
    private fun walkDeclaredName(name: SyntaxNode, place: NamePlace, out: MutableList<DelphiName>) {
        if (name.type == GENERIC_TPL) name.getChildByFieldName(ARGS_FIELD).orNull()?.let { walk(it, place, out) }
    }

    private fun walkChain(node: SyntaxNode, place: NamePlace, out: MutableList<DelphiName>) {
        val members = mutableListOf<SyntaxNode>()
        var head = node
        while (head.type == EXPR_DOT) {
            members.add(0, head.getChildByFieldName(RHS_FIELD))
            head = head.getChildByFieldName(LHS_FIELD).orNull() ?: return
        }
        if (head.type != IDENTIFIER) return walk(head, place, out)
        val plainMembers = members.takeWhile { it.type == IDENTIFIER }
        add(listOf(head.text) + plainMembers.map { it.text }, place, out)
        members.drop(plainMembers.size).forEach { member -> member.getChildByFieldName(ARGS_FIELD).orNull()?.let { walk(it, place, out) } }
    }

    private fun walkGenericInstance(node: SyntaxNode, place: NamePlace, out: MutableList<DelphiName>) {
        node.getChildByFieldName(ENTITY_FIELD).orNull()?.let { walk(it, place, out) }
        node.getChildByFieldName(ARGS_FIELD).orNull()?.let { walk(it, place, out) }
    }

    private fun walkTypeName(node: SyntaxNode, place: NamePlace, out: MutableList<DelphiName>) {
        add(TypeNames.segmentsOf(node), place, out)
        TypeNames.genericArgumentsOf(node).forEach { walk(it, place, out) }
    }

    private fun walkAttribute(attribute: SyntaxNode, place: NamePlace, out: MutableList<DelphiName>) {
        val call = attribute.takeIf { it.type == EXPR_CALL }
        val name = call?.getChildByFieldName(ENTITY_FIELD)?.orNull() ?: attribute
        val segments = attributeSegmentsOf(name)
        if (segments.isNotEmpty() && !place.hides(segments.first())) {
            out.add(DelphiName(segments, place.section, place.memberScope, isAttribute = true))
        }
        call?.getChildByFieldName(ARGS_FIELD)?.orNull()?.let { walk(it, place, out) }
    }

    private fun attributeSegmentsOf(name: SyntaxNode): List<String> = when (name.type) {
        IDENTIFIER -> listOf(name.text)
        EXPR_DOT -> attributeSegmentsOf(name.getChildByFieldName(LHS_FIELD)) + attributeSegmentsOf(name.getChildByFieldName(RHS_FIELD))
        else -> emptyList()
    }

    private fun add(segments: List<String>, place: NamePlace, out: MutableList<DelphiName>) {
        if (segments.isEmpty() || place.hides(segments.first())) return
        out.add(DelphiName(segments, place.section, place.memberScope))
    }
}

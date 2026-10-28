package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiName
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names a type declaration writes in its own text. Its attributes, the constraints of its generic parameters and its
 * base types stand outside it; what a class, record, interface or helper declares inside itself sees its members first.
 * A member type writes its own names, as a declaration of its own.
 */
internal object TypeDeclarationNames {
    private const val RTTI_ATTRIBUTES = "rttiAttributes"
    private const val GENERIC_TPL = "genericTpl"
    private const val TYPEREF = "typeref"
    private const val DECL_SECTION = "declSection"
    private const val DECL_TYPES = "declTypes"
    private const val NAME_FIELD = "name"
    private const val TYPE_FIELD = "type"
    private const val ARGS_FIELD = "args"

    private val WITH_MEMBERS = setOf("declClass", "declIntf", "declHelper")

    fun of(declType: SyntaxNode, ownPath: List<String>, outside: NamePlace): List<DelphiName> {
        val type = declType.getChildByFieldName(TYPE_FIELD).orNull() ?: return emptyList()
        val hasMembers = type.type in WITH_MEMBERS
        val fromOutside = attributesOf(declType) + constraintsOf(declType) + if (hasMembers) baseTypesOf(type) else listOf(type)
        val fromInside = if (hasMembers) membersOf(type) else emptyList()
        val inside = outside.copy(memberScope = ownPath)
        val names = fromOutside.flatMap { NameCollector.namesIn(it, outside) } + fromInside.flatMap { NameCollector.namesIn(it, inside) }
        return names.distinct()
    }

    private fun attributesOf(declType: SyntaxNode): List<SyntaxNode> = declType.children().filter { it.type == RTTI_ATTRIBUTES }.toList()

    private fun constraintsOf(declType: SyntaxNode): List<SyntaxNode> {
        val name = declType.getChildByFieldName(NAME_FIELD).orNull()?.takeIf { it.type == GENERIC_TPL } ?: return emptyList()
        return listOfNotNull(name.getChildByFieldName(ARGS_FIELD).orNull())
    }

    private fun baseTypesOf(type: SyntaxNode): List<SyntaxNode> = type.children().filter { it.type == TYPEREF }.toList()

    private fun membersOf(type: SyntaxNode): List<SyntaxNode> = type
        .children()
        .flatMap { if (it.type == DECL_SECTION) it.children() else sequenceOf(it) }
        .filter { it.type != DECL_TYPES && it.type != TYPEREF && it.type != RTTI_ATTRIBUTES }
        .toList()
}

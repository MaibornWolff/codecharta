package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

/**
 * The member chains read through a namespace import: `ns.Shapes.Circle` is one name, what the module exports under
 * `Shapes` and its member `Circle`.
 */
internal object NamespaceMembers {
    private const val MEMBER_EXPRESSION = "member_expression"
    private const val QUALIFIER_SEPARATOR = "."
    private const val OBJECT_FIELD = "object"

    fun useOf(memberExpr: SyntaxNode?, namespaceNames: Set<String>, scopes: LocalScopes): UsedType? {
        memberExpr ?: return null
        val directId = memberExpr.children().firstOrNull { it.type == IDENTIFIER }?.takeUnless { scopes.hides(it) } ?: return null
        val objName = directId.text.trim()
        if (objName !in namespaceNames) return null
        val members = memberChainFrom(memberExpr)
        if (members.isEmpty()) return null
        return UsedType(name = (listOf(objName) + members).joinToString(QUALIFIER_SEPARATOR))
    }

    // The names `ns.a.b` reads after `ns`: the member expression that reads `a`, and each one around it that reads on
    private fun memberChainFrom(memberExpr: SyntaxNode): List<String> = generateSequence(memberExpr) { member ->
        member.parent.takeIf { it.type == MEMBER_EXPRESSION && it.getChildByFieldName(OBJECT_FIELD).endByte == member.endByte }
    }.map { member -> member.children().firstOrNull { it.type == PROPERTY_IDENTIFIER }?.text?.trim() }
        .takeWhile { it != null }
        .filterNotNull()
        .toList()
}

package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The member chains read through a module binding: `ns.Shapes.Circle` is one name, what the module exports under
 * `Shapes` and its member `Circle`. A module binding is a namespace import, a dynamic import's module or one of its
 * exports, or `(await import('./m'))` itself.
 */
internal object NamespaceMembers {
    private const val MEMBER_EXPRESSION = "member_expression"
    private const val QUALIFIER_SEPARATOR = "."
    private const val OBJECT_FIELD = "object"

    fun useOf(memberExpr: SyntaxNode?, names: ModuleNames, scopes: LocalScopes): UsedType? {
        memberExpr ?: return null
        val binding = bindingReadBy(memberExpr, names, scopes) ?: return null
        val members = memberChainFrom(memberExpr)
        if (members.isEmpty()) return null
        return UsedType(name = (listOf(binding) + members).joinToString(QUALIFIER_SEPARATOR))
    }

    private fun bindingReadBy(memberExpr: SyntaxNode, names: ModuleNames, scopes: LocalScopes): String? {
        val receiver = memberExpr.getChildByFieldName(OBJECT_FIELD).orNull() ?: return null
        if (receiver.type != IDENTIFIER) return DynamicImports.moduleReadBy(receiver)
        if (scopes.hides(receiver)) return null
        val name = receiver.text.trim()
        if (name in names.namespaceNames) return name
        return names.dynamicImports.moduleOf(receiver) ?: names.dynamicImports.exportOf(receiver)
    }

    // The names `ns.a.b` reads after `ns`: the member expression that reads `a`, and each one around it that reads on
    private fun memberChainFrom(memberExpr: SyntaxNode): List<String> = generateSequence(memberExpr) { member ->
        member.parent.takeIf { it.type == MEMBER_EXPRESSION && it.getChildByFieldName(OBJECT_FIELD).endByte == member.endByte }
    }.map { member -> member.children().firstOrNull { it.type == PROPERTY_IDENTIFIER }?.text?.trim() }
        .takeWhile { it != null }
        .filterNotNull()
        .toList()
}

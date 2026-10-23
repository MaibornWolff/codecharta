package de.maibornwolff.treesitter.excavationsite.languages.vue.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.ComponentRegistration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The Vue components a JavaScript or TypeScript source registers: each `.component('Name', Binding)` call, globally,
 * and each entry of the `components` option of the object the module exports as default, also through a call such as
 * `defineComponent({ … })`, for that component.
 */
internal object ComponentRegistrationExtractor {
    private const val CALL_EXPRESSION = "call_expression"
    private const val MEMBER_EXPRESSION = "member_expression"
    private const val EXPORT_STATEMENT = "export_statement"
    private const val DEFAULT_KEYWORD = "default"
    private const val OBJECT = "object"
    private const val PAIR = "pair"
    private const val SHORTHAND_PROPERTY_IDENTIFIER = "shorthand_property_identifier"
    private const val STRING = "string"
    private const val STRING_FRAGMENT = "string_fragment"
    private const val IDENTIFIER = "identifier"
    private const val REGISTERING_METHOD = "component"
    private const val COMPONENTS_OPTION = "components"

    fun extract(rootNode: SyntaxNode): List<ComponentRegistration> = globalRegistrationsIn(rootNode) + componentsOptionIn(rootNode)

    private fun globalRegistrationsIn(rootNode: SyntaxNode): List<ComponentRegistration> = TreeTraversal
        .findAllDescendantsOfType(rootNode, CALL_EXPRESSION)
        .mapNotNull { call -> globalRegistrationOf(call) }

    private fun globalRegistrationOf(call: SyntaxNode): ComponentRegistration? {
        val function = call.getChildByFieldName("function").orNull()?.takeIf { it.type == MEMBER_EXPRESSION } ?: return null
        if (function.getChildByFieldName("property").orNull()?.text != REGISTERING_METHOD) return null
        val arguments = call.getChildByFieldName("arguments").orNull()?.namedChildren()?.toList() ?: return null
        val name = arguments.getOrNull(0)?.let { stringValueOf(it) } ?: return null
        val binding = arguments.getOrNull(1)?.takeIf { it.type == IDENTIFIER }?.text ?: return null
        return ComponentRegistration(name, binding, isGlobal = true)
    }

    private fun componentsOptionIn(rootNode: SyntaxNode): List<ComponentRegistration> {
        val options = defaultExportedObjectIn(rootNode) ?: return emptyList()
        val components = options
            .children()
            .firstOrNull { it.type == PAIR && keyOf(it) == COMPONENTS_OPTION }
            ?.getChildByFieldName("value")
            ?.orNull()
            ?.takeIf { it.type == OBJECT }
            ?: return emptyList()
        return components.children().mapNotNull { entry -> localRegistrationOf(entry) }.toList()
    }

    private fun defaultExportedObjectIn(rootNode: SyntaxNode): SyntaxNode? {
        val export = rootNode.children().firstOrNull { statement ->
            statement.type == EXPORT_STATEMENT && statement.children().any { it.type == DEFAULT_KEYWORD }
        }
        val value = export?.getChildByFieldName("value")?.orNull() ?: return null
        if (value.type == OBJECT) return value
        if (value.type != CALL_EXPRESSION) return null
        return value.getChildByFieldName("arguments").orNull()?.namedChildren()?.firstOrNull { it.type == OBJECT }
    }

    private fun localRegistrationOf(entry: SyntaxNode): ComponentRegistration? = when (entry.type) {
        SHORTHAND_PROPERTY_IDENTIFIER -> ComponentRegistration(entry.text, entry.text, isGlobal = false)
        PAIR -> {
            val binding = entry.getChildByFieldName("value").orNull()?.takeIf { it.type == IDENTIFIER }?.text
            keyOf(entry)?.let { name -> binding?.let { ComponentRegistration(name, it, isGlobal = false) } }
        }
        else -> null
    }

    private fun keyOf(pair: SyntaxNode): String? {
        val key = pair.getChildByFieldName("key").orNull() ?: return null
        return if (key.type == STRING) stringValueOf(key) else key.text
    }

    private fun stringValueOf(node: SyntaxNode): String? =
        if (node.type == STRING) TreeTraversal.findFirstChildTextByType(node, STRING_FRAGMENT) else null
}

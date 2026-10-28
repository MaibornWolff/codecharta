package de.maibornwolff.treesitter.excavationsite.languages.vue.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * The expressions of a component's template as script code, as the Vue compiler turns the template into a render
 * function inside `setup()`: an interpolation or a bound attribute becomes an expression statement, an event handler a
 * function body, and the names a `v-for` or a slot binds become the parameters of a function around the part of the
 * template that sees them, so the script's extractor binds every name as the compiler does.
 */
internal object TemplateExpressions {
    private const val TEMPLATE_ELEMENT = "template_element"
    private const val ELEMENT = "element"
    private const val START_TAG = "start_tag"
    private const val SELF_CLOSING_TAG = "self_closing_tag"
    private const val INTERPOLATION = "interpolation"
    private const val RAW_TEXT = "raw_text"
    private const val DIRECTIVE_ATTRIBUTE = "directive_attribute"
    private const val DIRECTIVE_NAME = "directive_name"
    private const val QUOTED_ATTRIBUTE_VALUE = "quoted_attribute_value"
    private const val ATTRIBUTE_VALUE = "attribute_value"
    private const val FOR_DIRECTIVE = "v-for"
    private val SLOT_DIRECTIVES = setOf("v-slot", "#")
    private val EVENT_DIRECTIVES = setOf("v-on", "@")
    private val FOR_EXPRESSION = Regex("""^\s*([\s\S]+?)\s+(?:in|of)\s+([\s\S]+?)\s*$""")

    /** The script code of the first template of the component, empty without one. */
    fun programOf(rootNode: SyntaxNode): String {
        val template = TreeTraversal.findAllDescendantsOfType(rootNode, TEMPLATE_ELEMENT).firstOrNull() ?: return ""
        return template.children().joinToString("") { codeOf(it) }
    }

    private fun codeOf(node: SyntaxNode): String = when (node.type) {
        ELEMENT, TEMPLATE_ELEMENT -> elementCode(node)
        INTERPOLATION -> TreeTraversal.findFirstChildTextByType(node, RAW_TEXT)?.let { statement(it) }.orEmpty()
        else -> ""
    }

    // A `v-for` scopes the element with its other attributes, a slot only what the element encloses
    private fun elementCode(element: SyntaxNode): String {
        val tag = element.children().firstOrNull { it.type == START_TAG || it.type == SELF_CLOSING_TAG } ?: return ""
        val directives = tag.children().filter { it.type == DIRECTIVE_ATTRIBUTE }.toList()
        val attributes = directives
            .filter {
                nameOf(
                    it
                ) != FOR_DIRECTIVE &&
                    nameOf(it) !in SLOT_DIRECTIVES
            }.joinToString("") { directiveCode(it) }
        val content = element.children().joinToString("") { codeOf(it) }
        val slotContent = valueOf(directives, SLOT_DIRECTIVES)?.let { scoped(it, content) } ?: content
        val forExpression = valueOf(directives, setOf(FOR_DIRECTIVE))?.let { FOR_EXPRESSION.find(it) } ?: return attributes + slotContent
        val (aliases, source) = forExpression.destructured
        return statement(source) + scoped(aliases, attributes + slotContent)
    }

    private fun directiveCode(directive: SyntaxNode): String {
        val value = valueOf(directive) ?: return ""
        return if (nameOf(directive) in EVENT_DIRECTIVES) "() => {\n$value\n};\n" else statement(value)
    }

    private fun scoped(parameters: String, body: String): String {
        val parameterList = if (parameters.trimStart().startsWith("(")) parameters else "($parameters)"
        return "($parameterList => {\n$body});\n"
    }

    private fun statement(expression: String): String = "(\n$expression\n);\n"

    private fun nameOf(directive: SyntaxNode): String? = TreeTraversal.findFirstChildTextByType(directive, DIRECTIVE_NAME)

    private fun valueOf(directives: List<SyntaxNode>, names: Set<String>): String? =
        directives.firstOrNull { nameOf(it) in names }?.let { valueOf(it) }

    private fun valueOf(directive: SyntaxNode): String? {
        val quoted = directive.children().firstOrNull { it.type == QUOTED_ATTRIBUTE_VALUE }
        return TreeTraversal.findFirstChildTextByType(quoted ?: directive, ATTRIBUTE_VALUE)
    }
}

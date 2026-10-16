package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * What the Angular decorator of a class declares: the elements its `@Component` selector names and the name of its
 * `@Pipe`, the names a template refers to the class by, and the template file or inline template of a component. An
 * attribute or class selector names no element, so it is left out.
 */
internal object AngularDecoratorExtractor {
    private const val ARGUMENTS = "arguments"
    private const val OBJECT = "object"
    private const val PAIR = "pair"
    private const val COMPONENT = "Component"
    private const val SELECTOR = "selector"
    private const val TEMPLATE_URL = "templateUrl"
    private const val TEMPLATE = "template"
    private const val TEMPLATE_STRING = "template_string"
    private const val PIPE = "Pipe"
    private const val PIPE_NAME = "name"
    private const val VALUE_FIELD = "value"
    private const val SELECTOR_SEPARATOR = ","
    private val ELEMENT_SELECTOR = Regex("^[a-zA-Z][\\w-]*")

    // A class has one Angular decorator
    fun extract(decorators: Sequence<SyntaxNode>): AngularDeclaration? = decorators.firstNotNullOfOrNull { declarationOf(it) }

    fun isInlineTemplate(stringNode: SyntaxNode): Boolean {
        val pair = stringNode.parent.takeIf { it.type == PAIR } ?: return false
        if (TreeTraversal.findFirstChildTextByType(pair, PROPERTY_IDENTIFIER) != TEMPLATE) return false
        val call = TreeTraversal.findAncestorOfType(pair, CALL_EXPRESSION) ?: return false
        return call.parent.type == DECORATOR && TreeTraversal.findFirstChildTextByType(call, IDENTIFIER) == COMPONENT
    }

    private fun declarationOf(decorator: SyntaxNode): AngularDeclaration? {
        val call = decorator.children().firstOrNull { it.type == CALL_EXPRESSION } ?: return null
        return when (TreeTraversal.findFirstChildTextByType(call, IDENTIFIER)) {
            COMPONENT -> componentOf(call)
            PIPE -> AngularDeclaration(templateNames = setOfNotNull(stringPropertyOf(call, PIPE_NAME)))
            else -> null
        }
    }

    private fun componentOf(call: SyntaxNode): AngularDeclaration = AngularDeclaration(
        templateNames = stringPropertyOf(call, SELECTOR)?.let { elementsOf(it) }.orEmpty().toSet(),
        templateUrl = stringPropertyOf(call, TEMPLATE_URL),
        inlineTemplate = inlineTemplateOf(call)
    )

    private fun stringPropertyOf(call: SyntaxNode, key: String): String? = valueOf(call, key)
        ?.takeIf { it.type == STRING }
        ?.let { TreeTraversal.findFirstChildTextByType(it, STRING_FRAGMENT) }

    // The text between the quotes, as the template is written: escapes and `${}` substitutions stay as they are
    private fun inlineTemplateOf(call: SyntaxNode): String? = valueOf(call, TEMPLATE)
        ?.takeIf { it.type == STRING || it.type == TEMPLATE_STRING }
        ?.text
        ?.let { it.substring(1, it.length - 1) }

    private fun valueOf(call: SyntaxNode, key: String): SyntaxNode? = call
        .children()
        .filter { it.type == ARGUMENTS }
        .flatMap { it.children() }
        .filter { it.type == OBJECT }
        .flatMap { it.children() }
        .filter { it.type == PAIR && TreeTraversal.findFirstChildTextByType(it, PROPERTY_IDENTIFIER) == key }
        .firstNotNullOfOrNull { pair -> pair.getChildByFieldName(VALUE_FIELD).orNull() }

    private fun elementsOf(selector: String): List<String> = selector
        .split(SELECTOR_SEPARATOR)
        .mapNotNull { ELEMENT_SELECTOR.find(it.trim())?.value?.lowercase() }
}

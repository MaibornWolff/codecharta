package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.AngularDeclaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal

/**
 * What the Angular decorator of a class declares: the elements its `@Component` selector names and the name of its
 * `@Pipe`, the names a template refers to the class by, and the template file of a component. An attribute or class
 * selector names no element, so it is left out.
 */
internal object AngularDecoratorExtractor {
    private const val ARGUMENTS = "arguments"
    private const val OBJECT = "object"
    private const val PAIR = "pair"
    private const val COMPONENT = "Component"
    private const val SELECTOR = "selector"
    private const val TEMPLATE_URL = "templateUrl"
    private const val PIPE = "Pipe"
    private const val PIPE_NAME = "name"
    private const val SELECTOR_SEPARATOR = ","
    private val ELEMENT_SELECTOR = Regex("^[a-zA-Z][\\w-]*")

    // A class has one Angular decorator
    fun extract(decorators: Sequence<SyntaxNode>): AngularDeclaration? = decorators.firstNotNullOfOrNull { declarationOf(it) }

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
        templateUrl = stringPropertyOf(call, TEMPLATE_URL)
    )

    private fun stringPropertyOf(call: SyntaxNode, key: String): String? = call
        .children()
        .filter { it.type == ARGUMENTS }
        .flatMap { it.children() }
        .filter { it.type == OBJECT }
        .flatMap { it.children() }
        .filter { it.type == PAIR && TreeTraversal.findFirstChildTextByType(it, PROPERTY_IDENTIFIER) == key }
        .firstNotNullOfOrNull { pair -> pair.children().firstOrNull { it.type == STRING } }
        ?.let { TreeTraversal.findFirstChildTextByType(it, STRING_FRAGMENT) }

    private fun elementsOf(selector: String): List<String> = selector
        .split(SELECTOR_SEPARATOR)
        .mapNotNull { ELEMENT_SELECTOR.find(it.trim())?.value?.lowercase() }
}
